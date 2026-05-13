# UX Structure: Customer (Pelanggan)

Pengalaman pelanggan dirancang sangat minimalis tanpa proses registrasi atau login. Akses sepenuhnya menggunakan token atau tap NFC.

## 1. Halaman Join / Pendaftaran (`/join` atau Link dari NFC)
Halaman awal jika pelanggan belum masuk ke sistem antrean. Jika menggunakan NFC, bisa langsung diarahkan ke halaman status.

**Informasi & Elemen yang Ditampilkan:**
- **Header:** Nama Event / Photobooth.
- **Input:** Kolom untuk memasukkan kode token (jika tidak otomatis terisi dari link/NFC).
- **Aksi:** Tombol "Masuk Antrean".

---

## 2. Halaman Status Antrean (`/status`)
Halaman utama tempat pelanggan memantau giliran mereka setelah sukses masuk antrean. Halaman ini melakukan auto-refresh (polling) secara berkala.

**Informasi & Elemen yang Ditampilkan:**
- **Nomor Antrean Anda:** Menampilkan nomor urut milik pelanggan dengan ukuran besar.
- **Status Sisa Antrean:** Menampilkan angka jumlah orang yang masih mengantre di depan mereka (misal: "Ada 3 orang di depan Anda").
- **Status Saat Ini (Real-time):**
  - Jika belum giliran: Menampilkan status "Menunggu Giliran".
  - Jika giliran tiba: Layar berubah mencolok menampilkan peringatan "GILIRAN ANDA! SILAKAN MENUJU PHOTOBOOTH".
  - Jika selesai: Menampilkan tombol/link "Unduh Hasil Foto" atau pesan "Sesi Selesai, Terima Kasih".
- **Instruksi:** Panduan sangat singkat (contoh: "Tunggu hingga nomor Anda dipanggil").
