# Optimasi Polling (Supabase Free Tier + Netlify Functions)

1. **Adaptive Polling (Backoff Interval)**
   Turunkan frekuensi polling saat sedang sepi. Mulai dari 3 detik, jika tidak ada perubahan setelah 5x request, naikkan interval menjadi 5 detik, lalu 10 detik. Kembalikan ke 3 detik setelah ada pembaruan.

2. **Timestamp Checking (Only Fetch Changes)**
   Client mengirim query parameter `?last_checked=1690000000`. Server hanya perlu melakukan query untuk mengecek apakah ada antrean yang `updated_at` > `last_checked`.

3. **Gunakan HTTP Caching di Netlify (Edge Cache)**
   Set header `Cache-Control: public, s-maxage=2` pada respons Netlify. Jika ada 10 device yang polling di detik yang sama, Netlify Edge hanya akan hit Supabase 1 kali, sisanya mengambil dari cache.

4. **Lean Query & Indexing**
   - Pastikan ada indeks gabungan di Supabase: `CREATE INDEX idx_polling ON queues(event_id, status, updated_at);`
   - Jangan gunakan `SELECT *`. Cukup ambil kolom esensial (contoh: `SELECT id, status`).
   
5. **Pisahkan Endpoint Polling**
   Buat 1 endpoint khusus (`/api/queue/current`) yang *hanya* difokuskan untuk di-hit berulang kali. Jangan gabungkan query berat (seperti join data user lengkap) di dalam endpoint polling ini.
