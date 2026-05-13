# Blueprint Sistem Antrean Photobooth

## 1. DATABASE STRUCTURE
*   **events:** `id` (PK), `name`, `created_at`
*   **users:** `id` (PK), `name`, `created_at`
*   **tokens:** `id` (PK), `event_id` (FK), `code` (Unique), `is_used` (Boolean), `expires_at` (Timestamp), `created_at`
*   **queues:** `id` (PK), `event_id` (FK), `user_id` (FK), `token_id` (FK), `status` (Enum: WAITING, CALLED, DONE), `created_at`
*   **results:** `id` (PK), `queue_id` (FK), `result_url` (Text), `created_at`
*   **Relasi Dasar:** Event memiliki banyak Queue & Token. Queue dimiliki oleh 1 User dan 1 Token. Result merujuk pada spesifik Queue.

## 2. API STRUCTURE
*   **`/api/queue/join` [POST]** - Memvalidasi token, menghanguskan token, dan mendaftarkan user ke antrean (WAITING).
*   **`/api/queue/next` [POST]** - Mengambil antrean WAITING paling lama, dan mengubah statusnya menjadi CALLED. 
*   **`/api/queue/skip` [POST]** - Admin melewati antrean (ubah ke SKIPPED/DONE) jika user tidak datang.
*   **`/api/queue/current` [GET]** - Endpoint polling utama. Mengembalikan 1 antrean CALLED saat ini dan 5 antrean WAITING selanjutnya.
*   **`/api/queue/status` [GET]** - Endpoint polling user. Mengecek status satu antrean berdasarkan `user_id`.
*   **`/api/result/save` [POST]** - Menyimpan url foto dari scan QR, lalu merubah status antrean menjadi DONE.

## 3. QUEUE FLOW
*   User menukarkan token dan mendaftar antrean.
*   User masuk daftar antrean (WAITING).
*   Admin 1 menekan tombol Next (antrean user menjadi CALLED).
*   User dipanggil ke layar dan masuk booth untuk foto.
*   Sesi foto selesai, mesin mengeluarkan QR code hasil.
*   Admin 1 scan QR tersebut untuk melampirkan URL foto ke data user.
*   Antrean selesai (DONE), user menerima hasil foto.

## 4. TOKEN FLOW
*   Admin 2 (Kasir) membuat/mencetak Token (Base64URL/Random String, batas waktu expiry).
*   User menerima Token (Kode text / Link QR).
*   User akses halaman `/join` dan memasukkan Token.
*   Sistem verifikasi (Token ada, belum dipakai, belum expired).
*   Sistem mengubah token `is_used = true` dan mengizinkan user masuk.

## 5. ADMIN FLOW
*   **Admin 1 (Mobile - Fast Operation):**
    *   Diam di depan photobooth.
    *   Klik 1 tombol raksasa "PANGGIL NEXT" saat mesin kosong.
    *   Klik 1 tombol raksasa "SCAN QR" saat pelanggan selesai foto.
    *   Diulang terus menerus secara cepat tanpa berpindah layar.
*   **Admin 2 (Desktop - Master Control):**
    *   Duduk di meja, memonitor flow di tabel antrean.
    *   Melihat siapa yang WAITING, CALLED, DONE.
    *   Mengirim notif WhatsApp panggilan ke User.
    *   Melakukan intervensi (Skip/Hapus) jika terjadi error di lapangan.

## 6. DATA FLOW
*   **Frontend (React/UI):** Komponen display (Mobile, Desktop, Booth, User) memanggil (polling) API setiap 3 detik memohon info terbaru.
*   **Backend (Netlify Functions):** Fungsi serverless di-trigger, mengeksekusi validasi bisnis tanpa logic yang rumit (stateless).
*   **Database (Supabase):** Mengeksekusi Single SQL Query yang optimal berbantuan Index tabel, mengubah data, lalu merespon request.
*   Data kembali menjalar ke atas: Database -> Backend JSON -> Frontend men-trigger State/DOM Update.

## 7. STATE FLOW
*   `WAITING` -> Antrean baru dibuat dan sedang menunggu instruksi dari Admin.
*   `CALLED` -> Antrean sedang aktif berjalan (berfoto) di dalam Photobooth. Hanya ada 1 yang CALLED dalam satu waktu.
*   `DONE` -> Antrean sukses diselesaikan, URL hasil foto telah ditambahkan.
*   *(Additional)* `SKIPPED` -> Opsi intervensi manual Admin jika user dibatalkan.
