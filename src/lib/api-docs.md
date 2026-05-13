# Struktur Endpoint API Antrean (Serverless)

## 1. Join Queue
Mendaftar ke antrean menggunakan token akses.

- **URL:** `/api/queue/join`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "event_id": 1,
    "user_id": 1,
    "token_code": "aBCD123..."
  }
  ```
- **Response Success (200):**
  ```json
  {
    "success": true,
    "queue": {
      "id": 101,
      "status": "WAITING"
    }
  }
  ```
- **Response Error (400):**
  ```json
  {
    "success": false,
    "error": "Token tidak valid atau sudah digunakan"
  }
  ```

---

## 2. Next Queue (Admin/Sistem)
Memanggil antrean `WAITING` berikutnya menjadi `CALLED`.

- **URL:** `/api/queue/next`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "event_id": 1
  }
  ```
- **Response Success (200):**
  ```json
  {
    "success": true,
    "queue": {
      "id": 101,
      "user_id": 1,
      "status": "CALLED"
    }
  }
  ```

---

## 3. Skip/Done Queue (Admin/Sistem)
Menandai antrean yang saat ini `CALLED` menjadi selesai (`DONE`) atau di-skip.

- **URL:** `/api/queue/skip`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "queue_id": 101,
    "action": "DONE" // atau "SKIPPED" jika butuh status skip
  }
  ```
- **Response Success (200):**
  ```json
  {
    "success": true,
    "message": "Status antrean diperbarui"
  }
  ```

---

## 4. Get Current Queue (Polling)
Untuk layar display mengambil data antrean yang sedang aktif. Sangat ringan untuk dipanggil via interval polling (contoh: 3 detik).

- **URL:** `/api/queue/current?event_id=1`
- **Method:** `GET`
- **Response Success (200):**
  ```json
  {
    "success": true,
    "current_queue": {
      "id": 101,
      "user_id": 1,
      "status": "CALLED"
    },
    "next_queues": [
      { "id": 102, "user_id": 2 },
      { "id": 103, "user_id": 3 }
    ]
  }
  ```

---

## 5. Save Result
Menyimpan link/hasil foto untuk user pada antrean tertentu.

- **URL:** `/api/result/save`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "queue_id": 101,
    "result_url": "https://example.com/photo_101.jpg"
  }
  ```
- **Response Success (200):**
  ```json
  {
    "success": true,
    "result_id": 50
  }
  ```
