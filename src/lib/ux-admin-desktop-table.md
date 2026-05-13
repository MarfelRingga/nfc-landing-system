# UX Structure: Admin 2 (Desktop Dashboard)

Halaman ini berfokus pada manajemen penuh dan pengawasan data antrean secara keseluruhan.

## Struktur Tabel (Master Data)

Tabel diurutkan berdasarkan `status` (CALLED teratas, lalu WAITING, terakhir DONE) dan waktu `created_at`.

### Kolom yang Ditampilkan

1. **No. Antrean** 
   - ID atau urutan kedatangan.
2. **Nama / Kontak**
   - Nama pelanggan dan nomor WhatsApp (jika diisi saat mendaftar).
3. **Status**
   - WAITING (Menunggu giliran)
   - CALLED (Sedang dilayani/berfoto)
   - DONE (Selesai/Hasil sudah diunggah)
4. **Waktu Kedatangan**
   - Waktu pelanggan bergabung ke antrean (`created_at`).
5. **Aksi**
   - Kumpulan tombol sesuai dengan status antrean.

---

## Aksi per Baris (Berdasarkan Status)

Aksi yang tersedia akan menyesuaikan kondisi `status` antrean saat itu untuk meminimalkan salah klik.

### Jika Status = WAITING
- **Kirim WA (Reminder):** Mengirim pesan template "Sebentar lagi giliran Anda".
- **Skip / Batalkan:** Langsung membatalkan antrean tanpa memanggilnya (ubah status ke CANCELLED atau hapus).

### Jika Status = CALLED
- **Kirim WA (Panggilan):** Mengirim pesan template "Giliran Anda sekarang, silakan menuju photobooth".
- **Skip (No Show):** Menandai pelanggan tidak hadir dan melewati gilirannya.

### Jika Status = DONE
- **Kirim WA (Hasil):** Mengirim pesan berisi link untuk mengunduh hasil foto.
- **Hapus Antrean:** Menghapus data/baris antrean dari display aktif (dibersihkan dari tabel).
