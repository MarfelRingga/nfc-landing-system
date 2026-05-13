# Audit Keseluruhan Database & Arsitektur Sistem

Berdasarkan pengecekan konfigurasi database nyata Anda berbanding dengan *source code* pada proyek ini, telah ditemukan sejumlah miss-match (ketidakselarasan) fatal yang dapat menyebabkan sistem *error* ketika dijalankan.

## 1. Temuan Utama Misinformasi Arsitektur

### 🔴 A. `users` VS `profiles`
- **Di Database Tersimpan:** Ada tabel `users` (dengan ID `integer`) dan tabel `profiles` (dengan ID `uuid`).
- **Di Web Codebase:** Seluruh aplikasi Next.js Anda (autentikasi, dashboard, circles) berakar pada tabel `profiles` bawaan Supabase (`public.profiles` dengan ID tipe `UUID`).
- **Kesalahan:** Beberapa skrip dan pembuatan tabel awal untuk Photobooth keliru mengaitkan *foreign key* `user_id` ke tabel rekayasa `users` (Integer).
- **Solusi:** Tabel `users` (integer) adalah *phantom table* (tabel sisa) yang **harus dihapus**. Fitur Photobooth didesain secara anonim menggunakan `customer_name`, sehingga kolom `user_id` di tabel antrean sebenarnya tidak diperlukan (atau jika butuh, harus pakai `profile_id` bertipe `UUID`).

### 🔴 B. Pertarungan Tipe Data: `UUID` VS `INTEGER`
- **Sisi File Migrasi SQL:** Jika Anda melihat file `20260505_photobooth_schema.sql` dan `20260509_photobooth_fixes.sql`, semua tabel Photobooth (`events`, `tokens`, `queues`, `results`) didefinisikan menggunakan **UUID**.
- **Sisi Database Nyata & Typescript:** Realitasnya di Supabase Anda, tabel-tabel ini terlanjur jadi **INTEGER** (misal ID-nya berurut `1`, `2`, `6`). Beberapa fungsi di *Javascript* justru me- *request* angka Integer.
- **Akibat:** Seluruh *RPC Function* (`pb_join_queue`, `pb_next_queue`) yang saya buat pada *patch* performa akan **GAGAL TOTAL** alias *crash* karena me-return `UUID` sedangkan database aslinya `INTEGER`.

---

## 2. Rencana Pemulihan (Recovery Plan)

Untuk meremajakan (aligning) arsitektur sistem ini dan menjawab kendala Netlify/Supabase Free Tier, kita akan mengeksekusi ini di Supabase SQL Editor:
1. **Drop Miskonsepsi:** Membuang tabel `users` sisa.
2. **Definitif Tipe Data:** Kita tetapkan bahwa semua tabel MVP Photobooth (`events`, `tokens`, `queues`, `results`) akan menggunakan standar **INTEGER (SERIAL)** agar sinkron dengan data event Anda yang sudah ada (`event_id = 6`).
3. **Rekreasi RPC:** Membangun ulang fungsi atomic performa tinggi (RPC) menggunakan parameter tipe *integer*.
4. **Hapus Ketergantungan User:** Kolom `user_id` pada `queues` akan diamputasi dari `users`, berganti penuh menjadi murni mencatat nama menggunakan `customer_name`.

---

## 3. Eksekusi SQL Code Fix

⚠️ **PERHATIAN**: Script SQL yang panjang telah dipindahkan dari dokumen ini agar lebih bersih.
Silakan buka file **`database-fixes.sql`** yang baru saja kami buat di _root_ direktori. Copy seluruh isi file tersebut dan jalankan di **Supabase SQL Editor** Anda.

Apa yang dilakukan oleh script tersebut?
1. **Membersihkan Fungsi Lama**: Menghapus RPC lama yang bertipe data UUID (misal `pb_join_queue(VARCHAR, UUID, VARCHAR)` dll) yang menyebabkan konflik.
2. **Memutuskan Koneksi User Palsu**: Melepas sambungan `public.queues` dari `public.users` dan menghapus total tabel hantu `users`.
3. **Penyelarasan Kolom Integer**: Menambahkan `customer_name` (VARCHAR), `queue_number` (INTEGER), serta `expires_at` (TIMESTAMPTZ) pada tabel-tabel terkait, dan membuang kolom usang `user_id` pada tabel `queues`.
4. **Rekreasi RPC Baru**: Menanamkan ulang 3 (tiga) fungsi performa tinggi berbasis INTEGER:
   - `pb_join_queue` (Mengamankan tiket & join antrean)
   - `pb_next_queue` (Panggil antrean berdasarkan prioritas terlama via _Skip Locked_)
   - `pb_generate_token` (Pembuatan tiket baru & _lazy cleanup_ tumpukan token kadaluarsa)
5. **Harmonisasi Index**: Memastikan kolom data utama di-*index* dengan baik agar WebSockets/Realtime API membaca data dalam milidetik.

Dengan menjalankan SQL pada `database-fixes.sql`, kesalahan (conflict) tipe data dan fungsional pada Supabase akan tuntas terselesaikan. Jangan ragu untuk me-rerun test setelah script tersebut dieksekusi!