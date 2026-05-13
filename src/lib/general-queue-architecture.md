# Arsitektur General Queue System (Sistem Antrean Serbaguna)

## 1. Tujuan
Mengubah fitur khusus "Photobooth" menjadi sebuah **Sistem Antrean General** yang dapat dipakai untuk berbagai kasus penggunaan (contoh: Photobooth, Antrean Klinik, Customer Service, Kasir, dll). Perubahan ini dilakukan tanpa mengganggu fitur utama lainnya di dalam aplikasi (seperti Circle, Inbox, dsb).

## 2. Batasan (Constraints)
- **Hanya merombak fitur Photobooth** dan kode yang terkait dengannya.
- Tidak menyentuh atau merusak tabel/fitur `circles`, `messages`, `users`, `tags`, dst.
- Sebisa mungkin mempertahankan skema tabel database yang sudah ada (`events` dan `queues`) namun mengubah **representasi dan UI** nya agar fleksibel.

## 3. Penyesuaian Skema (Pendekatan Fleksibel)
Kita akan tetap menggunakan tabel `events` dan `queues` dengan interpretasi sebagai berikut:
- **Tabel `events`** 
  - Merepresentasikan sebuah "Layanan" atau "Acara Antrean" (Queue Service).
  - Contoh entry: `name = "Photobooth Pernikahan Budi"`, atau `name = "Antrean Poli Gigi"`.
  - Kolom `code` tetap digunakan sebagai kode unik untuk pendaftaran/join ke layanan tersebut.
- **Tabel `queues`**
  - Merepresentasikan nomor antrean dari sebuah layanan.
  - `status`: `WAITING`, `CALLED`, `FINISHED`.
  - `result_url`: Bisa dipakai senada dengan jenis layanan (misal: link hasil foto untuk Photobooth, link dokumen PDF untuk customer service, atau dibiarkan kosong jika tidak diperlukan).

## 4. Perubahan Routing & UI
Kita akan memigrasikan URL path yang sebelumnya berbau "Photobooth" ("pb") menjadi lebih general ("q", "queue-manager").

**A. Dashboard Admin (Creator layanan):**
- **Sisi Kiri/Sidebar**: Menu "Photobooth" diubah labelnya menjadi "Queue Manager".
- **Path Asal**: `/admin/photobooth` $\rightarrow$ **Path Baru**: `/admin/queues`
- **Path Asal**: `/photobooth-hub/[code]` $\rightarrow$ **Path Baru**: `/queue-hub/[code]`
- Komponen admin (seperti `Admin1Page` dan `Admin2Page`) akan disesuaikan teksnya. ("Hasil Foto" diganti jadi "Lampiran / Hasil", "Panggil Next" dsb).

**B. Halaman Publik (Customer/Client):**
- **Path Asal**: `/pb/join` $\rightarrow$ **Path Baru**: `/q/join` (Portal bergabung ke antrean dengan kode).
- **Path Asal**: `/pb/device` $\rightarrow$ **Path Baru**: `/q/device` (Portal tablet standalone untuk ambil tiket).

## 5. Tahapan Eksekusi
1. Memindahkan direktori `/pb` ke `/q`.
2. Memindahkan `/admin/photobooth` ke `/admin/queues`.
3. Memindahkan `/photobooth-hub/[code]` ke `/queue-hub/[code]`.
4. Mengubah menu sidebar pada Layout Dashboard.
5. Menghilangkan kata-kata statis "Photobooth" pada komponen terkait (CustomerPage, DevicePage, JoinPage, Admin1Page, Admin2Page) menjadi kata-kata dinamis atau setidaknya general seperti "Layanan Antrean" atau menggunakan `eventName`.
6. Melakukan testing build untuk memastikan tidak ada import error.
