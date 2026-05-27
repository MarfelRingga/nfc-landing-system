# UX Structure & Flows

Sistem Antrean Serbaguna (General Queue Manager)

## 1. Customer (Pelanggan)
Pengalaman pelanggan dirancang sangat minimalis tanpa registrasi (Akses token / tap NFC).
- **Halaman `/q/join` (Portal Bergabung):** Input kode token / scan NFC. Klik "Masuk Antrean".
- **Halaman `/q` atau `/q/status` (Pantau Antrean):** Menampilkan nomor urut Anda, sisa orang di depan, dan auto-refresh. Jika giliran tiba, layar berubah mencolok. Jika selesai, tampil link unduhan hasil/lampiran.
- **Error States:**
  - *Token Tidak Valid:* "Kode token salah ketik." - Coba ketik ulang.
  - *Antrean Penuh:* "Sesi antrean penuh." - Cek kembali nanti.
  - *Sudah Masuk:* "Token sudah terdaftar." - Arahkan ke `/status`.
  - *Token Expired:* "Token kedaluwarsa." - Minta token baru.

## 2. Admin 1 (Mobile - Operasional Cepat / Petugas Depan)
- **Halaman `/q/device` atau `/admin/booth`:** UI Single Page tanpa scroll.
- **State A (Idle):** Tombol hijau besar "PANGGIL NEXT".
- **State B (Active):** Tombol biru besar "SCAN QR HASIL" (menyimpan URL ke antrean `CALLED` lalu ubah status jadi `DONE`). Tersedia tombol kecil "Skip / Batal".
- Kembali berkedip sukses dan otomatis balik ke State A.

## 3. Admin 2 (Desktop - Master Control / Kasir)
- **Manajemen & Tabel Utama (`/admin/queues`):** Memonitor antrean (WAITING, CALLED, DONE). 
- Diurutkan berdasarkan status dan waktu `created_at`.
- **Aksi (WAITING):** Kirim WA Reminder, Skip/Batalkan.
- **Aksi (CALLED):** Kirim WA Panggilan, Skip/Batalkan.
- **Aksi (DONE):** Kirim WA Hasil, Hapus data.
- **Generator Token:** Klik "Generate Token" ketika pelanggan membayar. Muncul kode teks / QR Code.

## 4. Booth Display (Public Layar Antrean)
Layar menghadap ke pelanggan yang sedang menunggu. Auto update via polling.
1. **Sesi Aktif:** Paling besar di layar. "Sedang Dilayani: Antrean #XX".
2. **Panggilan Terakhir:** Berkedip ketika ada antrean dipanggil pindah ke mesin/booth.
3. **Queue Menunggu:** List 3-5 nomor teratas yang berstatus `WAITING`.
4. **Instruksi Bergabung:** Cara mendapatkan kode atau scan QR `/q/join` statis.
