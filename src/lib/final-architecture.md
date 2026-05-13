# Final Architecture MVP: Photobooth Queue System

## 1. DATABASE SCHEMA (FINAL)

**Tabel `events`**
- `id` (INTEGER / UUID PRIMARY KEY)
- `name` (VARCHAR)
- `created_at` (TIMESTAMPTZ)

**Tabel `tokens`**
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `event_id` (FK ke events.id)
- `code` (VARCHAR UNIQUE NOT NULL)
- `is_used` (BOOLEAN DEFAULT FALSE)
- `expires_at` (TIMESTAMPTZ NOT NULL)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

**Tabel `queues`**
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `event_id` (FK ke events.id)
- `token_id` (FK ke tokens.id, UNIQUE NOT NULL) -- 1 token = 1 queue binding
- `queue_number` (INTEGER NOT NULL) -- Urutan antrean (sequential per event)
- `status` (VARCHAR) -- Enum: 'WAITING', 'CALLED', 'IN_SESSION', 'DONE', 'SKIPPED'
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

**Tabel `results`**
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `queue_id` (FK ke queues.id, UNIQUE)
- `result_url` (TEXT NOT NULL)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

**SQL Constraint Level Protection:**
```sql
-- Menjamin HANYA BOLEH ADA SATU queue berstatus CALLED per event
CREATE UNIQUE INDEX unique_called_per_event 
ON queues (event_id) 
WHERE status = 'CALLED';

-- Gabungan index optimal untuk view polling
CREATE INDEX idx_queues_polling 
ON queues(event_id, status, queue_number);
```

## 2. IMPORTANT SQL QUERIES

**A. Join Queue (Pakai Token)**
```sql
WITH valid_token AS (
  UPDATE tokens
  SET is_used = TRUE
  WHERE code = $1 AND is_used = FALSE AND expires_at > NOW()
  RETURNING id, event_id
)
INSERT INTO queues (event_id, token_id, queue_number, status)
SELECT 
  event_id, 
  id, 
  COALESCE((SELECT MAX(queue_number) FROM queues WHERE event_id = valid_token.event_id), 0) + 1,
  'WAITING'
FROM valid_token
RETURNING id, queue_number;
```

**B. Next Queue (Atomic + Single CALLED Protection)**
```sql
UPDATE queues
SET status = 'CALLED'
WHERE id = (
  SELECT id FROM queues 
  WHERE event_id = $1 AND status = 'WAITING' 
  ORDER BY queue_number ASC 
  FOR UPDATE SKIP LOCKED 
  LIMIT 1
) 
-- Guard level SQL: Jangan panggil Next jika sudah ada yang CALLED (mencegah error dari Unique Index)
AND NOT EXISTS (
  SELECT 1 FROM queues WHERE event_id = $1 AND status = 'CALLED'
)
RETURNING id, queue_number, status;
```

**C. Update IN_SESSION**
```sql
UPDATE queues
SET status = 'IN_SESSION'
WHERE id = $1 AND status = 'CALLED'
RETURNING id, queue_number;
```

**D. Skip Queue**
```sql
UPDATE queues
SET status = 'SKIPPED'
WHERE id = $1
RETURNING id;
```

**E. Save Result (Queue otomatis jadi DONE)**
```sql
WITH updated_queue AS (
  UPDATE queues
  SET status = 'DONE'
  WHERE id = $1
  RETURNING id
)
INSERT INTO results (queue_id, result_url)
SELECT id, $2 FROM updated_queue
RETURNING id;
```

## 3. TOKEN CLEANUP LOGIC

**Query Hapus Token Usang:**
```sql
DELETE FROM tokens 
WHERE event_id = $1 AND (is_used = TRUE OR expires_at < NOW());
```
**Kapan dipanggil (Lazy Cleanup):**
Disisipkan saat Kasir menembak endpoint `POST /api/token/generate`. Sistem secara pasif akan men-delete token invalid/kadaluarsa per `event_id` sebelum membuat token baru. Tidak perlu cron job, database tetap bersih.


## 4. API ADJUSTMENT

Identifier menggunakan parameter `queue_id` (karena user tidak login/anonim).

*   `POST /api/queue/join` | Req: `token_code` | Res: `queue_id`, `queue_number`
*   `POST /api/queue/next` | Req: `event_id` | Res: `queue_id`, `queue_number` (status = CALLED)
*   `POST /api/queue/session`| Req: `queue_id` | Res: Ubah status ke IN_SESSION
*   `POST /api/queue/skip` | Req: `queue_id` | Res: Ubah status ke SKIPPED
*   `POST /api/result/save` | Req: `queue_id`, `result_url` | Res: `result_id` (queue jadi DONE)
*   `GET /api/queue/current` | Req: `event_id` | Res: Data 1 antrean (CALLED/IN_SESSION) & Array N antrean (WAITING) selanjutnya
*   `GET /api/queue/status` | Req: `queue_id` | Res: Status terkini 1 queue spesifik (untuk Customer)


## 5. POLLING STRATEGY

Interval Optimal: **3 detik** berjalan konstan di dalam jam buka booth. Data yang di-fetch harus di-"trim" hanya memuat JSON dengan properti kritikal (`queue_id`, `queue_number`, `status`).

*   **Admin 1 (Mobile - Depan Booth)** -> Endpoint: `GET /api/queue/current`
    Hanya butuh info siapa yang CALLED/IN_SESSION saat ini dan menghitung `.length` WAITING selanjutnya.
*   **Admin 2 (Desktop - Jarak Jauh)** -> Endpoint: `GET /api/queue/current`
    Panggilan API yang persis sama dengan Admin 1 (cache aman), dirender penuh ke layout tabel.
*   **Booth (Public Display)** -> Endpoint: `GET /api/queue/current`
    Sama seperti Admin 1 & 2. Menggunakan endpoint terpusat agar bisa ditekan dengan Edge HTTP Caching jika perlu.
*   **Customer (Cek Status via HP)** -> Endpoint: `GET /api/queue/status?queue_id=XXX`
    Hitungan sangat ringan karena langsung dicari dengan Primary Key di Database, memberikan notif ketika statusnya berubah.
