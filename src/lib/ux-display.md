# UX Structure: Public Display (Layar Photobooth)

Layar pasif ini dihadapkan kepada pelanggan yang sedang menunggu. Tujuannya agar mereka tahu kapan giliran mereka tiba. Data di-update secara otomatis melalui polling.

## Urutan dan Elemen Informasi (Dari Atas ke Bawah)

**1. Sesi Saat Ini (Main Focus)**
Elemen paling besar dan paling mendominasi layar.
- **Teks Header:** "Sedang Dilayani" atau "Sesi Aktif"
- **Nomor Antrean:** Nomor antrean pelanggan yang saat ini berstatus `CALLED`.
- *(Opsional) Nama Pelanggan:* Jika sistem mendukung input nama.

**2. Panggilan Terakhir (Secondary Focus / Highlight Sementara)**
Elemen ini muncul/berkedip saat ada pergantian antrean (ketika tombol NEXT ditekan oleh admin).
- **Pesan:** "Panggilan untuk Antrean #..."
- **Instruksi:** "Silakan menuju area photobooth."

**3. Antrean Berikutnya (Daftar Antrean `WAITING` Teratas)**
Elemen daftar (list) untuk memberikan estimasi kepada pelanggan yang masih menunggu.
- **Teks Header:** "Antrean Berikutnya:"
- **Daftar Nomor:** Menampilkan 3 hingga 5 nomor antrean teratas yang berstatus `WAITING` beserta nama (jika ada).

**4. Instruksi Bergabung (Footer)**
Elemen statis di bagian bawah layar.
- **Teks:** "Cara Memasukkan Antrean"
- **QR Code:** (Opsional) QR code statis menuju halaman `/join`.
- **Informasi:** Langkah singkat menuju kasir untuk mendapatkan token/nomor.
