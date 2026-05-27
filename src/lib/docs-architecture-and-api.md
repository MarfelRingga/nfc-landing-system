# System Architecture & API Blueprint

## 1. Database Schema (Final)

**Table `events`**
- `id` (INTEGER / UUID PRIMARY KEY)
- `name` (VARCHAR)
- `created_at` (TIMESTAMPTZ)

**Table `tokens`**
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `event_id` (FK to events.id)
- `code` (VARCHAR UNIQUE NOT NULL)
- `is_used` (BOOLEAN DEFAULT FALSE)
- `expires_at` (TIMESTAMPTZ NOT NULL)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

**Table `queues`**
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `event_id` (FK to events.id)
- `token_id` (FK to tokens.id, UNIQUE NOT NULL)
- `queue_number` (INTEGER NOT NULL)
- `status` (VARCHAR) -- Enum: 'WAITING', 'CALLED', 'IN_SESSION', 'DONE', 'SKIPPED'
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

**Table `results`**
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `queue_id` (FK to queues.id, UNIQUE)
- `result_url` (TEXT NOT NULL)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

### SQL Constraint Level Protection
```sql
-- Menjamin HANYA BOLEH ADA SATU queue berstatus CALLED per event
CREATE UNIQUE INDEX unique_called_per_event 
ON queues (event_id) 
WHERE status = 'CALLED';

-- Gabungan index optimal untuk view polling
CREATE INDEX idx_queues_polling 
ON queues(event_id, status, queue_number);
```

## 2. API Endpoints

Identifier menggunakan parameter `queue_id` (karena user tidak login/anonim).

*   `POST /api/queue/join` | Req: `token_code` | Res: `queue_id`, `queue_number`
*   `POST /api/queue/next` | Req: `event_id` | Res: `queue_id`, `queue_number` (status = CALLED)
*   `POST /api/queue/session`| Req: `queue_id` | Res: Ubah status ke IN_SESSION
*   `POST /api/queue/skip` | Req: `queue_id` | Res: Ubah status ke SKIPPED
*   `POST /api/result/save` | Req: `queue_id`, `result_url` | Res: `result_id` (queue jadi DONE)
*   `GET /api/queue/current` | Req: `event_id` | Res: Data 1 antrean (CALLED/IN_SESSION) & Array N antrean (WAITING) selanjutnya
*   `GET /api/queue/status` | Req: `queue_id` | Res: Status terkini 1 queue spesifik (untuk Customer)

## 3. General Queue Architecture Adaptation
Mengubah fitur khusus "Photobooth" menjadi "Queue Manager" yang serbaguna (General Queue System):
- Memindahkan direktori `/pb` ke `/q`.
- Memindahkan `/admin/photobooth` ke `/admin/queues`.
- Representasi data menyesuaikan dengan nama Event (layanan).

## 4. Polling Optimization
- **Adaptive Polling (Backoff Interval):** 3 detik -> 5 detik -> 10 detik saat sepi.
- **Timestamp Checking:** `?last_checked=timestamp`.
- **API Cache:** `Cache-Control: public, s-maxage=2`.
- **Lean Query:** Ambil sebagian data penting saja (id, status), gunakan index.

## 5. Token Cleanup & Save Result Flow
- **Token Cleanup:** Dijalankan secara *lazy* ketika kasir membuat token baru melalui POST `/api/token/generate`.
- **Save Result Flow:** Scan QR -> Insert hasil ke database `results` -> Berikan ID hasil / link share. URL QR akan divalidasi dan dihubungkan dengan `user_id`/`queue_id` yang sedang aktif.
