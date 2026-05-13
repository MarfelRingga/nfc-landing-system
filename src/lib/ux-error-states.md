# UX Error States (Customer)

## 1. Token Tidak Valid / Salah
- **Pesan:** "Kode token tidak dikenali atau salah ketik."
- **Tindakan User:** "Coba Ketik Ulang" atau hubungi kasir.

## 2. Antrean Penuh
- **Pesan:** "Mohon maaf, sesi antrean saat ini sedang penuh/ditutup."
- **Tindakan User:** "Cek Kembali Nanti" (kembali ke beranda).

## 3. Sudah Masuk Antrean (Token Sudah Terpakai)
- **Pesan:** "Token ini sudah terdaftar dalam antrean."
- **Tindakan User:** "Lihat Status Saya" (langsung arahkan ke halaman `/status` milik token tersebut).

## 4. Token Expired (Kedaluwarsa)
- **Pesan:** "Token sudah kedaluwarsa karena melewati batas waktu."
- **Tindakan User:** Instruksi "Silakan minta token baru di kasir."
