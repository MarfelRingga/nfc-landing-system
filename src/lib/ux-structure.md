# Struktur UX Sistem Antrean Photobooth

## 1. Customer (Pelanggan)
**Fokus:** Masuk antrean dengan mudah, pantau kapan giliran tiba, lalu lihat hasil.

**Halaman `/join` (Input Token)**
- Fungsi utama: Memasukkan kode token/scan QR untuk masuk ke antrean.

**Halaman `/queue/status` (Live Board - Polling)**
- Fungsi utama: Menampilkan status terkini (giliran ke-berapa, sisa antrean, atau "GILIRAN ANDA"). Auto-refresh tiap beberapa detik. Tombol aksi minimal.

**Halaman `/result` (Download Hasil)**
- Fungsi utama: Menampilkan file atau link unduhan foto setelah sesi photobooth selesai.

---

## 2. Admin 1 (Mobile - Operasional Booth Cepat)
**Fokus:** Tombol besar, satu klik per aksi, tidak perlu scroll panjang. Mengontrol alur fisik di depan mesin photobooth.

**Halaman `/admin/booth` (Quick Controller)**
- Fungsi utama: Menampilkan 1 antrean yang sedang aktif.
- Aksi: 
  - Tombol **NEXT** (untuk memanggil antrean berikutnya).
  - Tombol **SKIP/NO SHOW** (jika customer dipanggil tidak hadir).

**Halaman `/admin/scan` (Upload/Scan)**
- Fungsi utama: Buka kamera mobile untuk scan QR dari mesin photobooth, lalu otomatis melampirkan (attach) link foto tersebut ke antrean yang saat ini sedang aktif (CALLED) dan menandainya menjadi DONE.

---

## 3. Admin 2 (Desktop - Manajemen & Kasir)
**Fokus:** Mengatur tiket masuk dan melihat gambaran seluruh antrean jika terjadi masalah (overview).

**Halaman `/admin/cashier` (Generator Token)**
- Fungsi utama: Satu klik "Generate Token" ketika ada pelanggan yang membayar. Menampilkan kode teks atau QR code pad untuk discan pelanggan.

**Halaman `/admin/master` (Master Board)**
- Fungsi utama: Menampilkan tabel list lengkap antrean (WAITING, CALLED, DONE). Bisa melakukan override manual (misal: membatalkan antrean, mengubah status secara manual jika Admin 1 salah klik).

**Halaman `/display` (Public Display - Fullscreen)**
- Fungsi utama: Layar pasif (tanpa tombol) yang menghadap antrean. Menampilkan nomor/nama antrean yang sedang dipanggil (status = CALLED). Polling berjalan terus menerus.
