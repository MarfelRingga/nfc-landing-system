# UX Flow: Admin 1 (Mobile - Operasional Cepat)

Hanya menggunakan 1 halaman (Single Page) dengan pergantian "State" UI untuk meminimalisir klik.

## Flow Step-by-Step

**Step 1: Panggil Antrean**
- Admin melihat tidak ada sesi aktif.
- Admin menekan tombol ukuran penuh "PANGGIL NEXT".
- Sistem memanggil antrean teratas (status menjadi `CALLED`).

**Step 2: Sesi Berjalan**
- Pelanggan masuk dan berfoto di photobooth.
- Admin standby.

**Step 3: Scan Hasil & Otomatis Selesai**
- Mesin photobooth memunculkan QR Code berisi link hasil foto.
- Admin menekan tombol "SCAN QR HASIL".
- Kamera terbuka, Admin scan QR.
- Sistem menyimpan URL ke antrean aktif, merubah status jadi `DONE`, dan **otomatis kembali ke Step 1** siap memanggil orang berikutnya.

---

## State UI Sederhana (1 Halaman)

Tampilan berubah berdasarkan status antrean saat ini, tanpa pindah URL.

### State A: Idle (Kosong)
- **Info:** "5 Antrean Menunggu"
- **Aksi Utama:** Tombol Hijau Besar "PANGGIL ANTRETAN BERIKUTNYA"

### State B: Active (Sesi Sedang Berjalan)
- **Info:** "Sesi Aktif: Antrean #12 (Budi)"
- **Aksi Utama:** Tombol Biru Besar "📸 SCAN QR HASIL" (membuka kamera)
- **Aksi Sekunder (Pojok):** Tombol kecil "Skip/Batal" (jika orangnya kabur/batal).

*(Ketika Scan QR berhasil, UI langsung berkedip sukses dan kembali ke State A)*
