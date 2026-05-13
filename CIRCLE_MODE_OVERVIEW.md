# Circle Mode Overview

## 1. Tujuan Utama Fitur
Circle Mode di Rifelo bertujuan untuk menyediakan ruang interaksi dan "kehadiran" (presence) eksklusif secara real-time. Fitur ini dirancang bukan sekadar sebagai grup chat, melainkan sebagai sebuah visualisasi "live space" dimana member bisa saling mengetahui siapa yang sedang aktif atau berkumpul pada waktu yang bersamaan, menciptakan nuansa komunitas dan kebersamaan (Resonance).

## 2. Masalah yang Ingin Diselesaikan
- Meningkatkan *engagement* antara sekelompok orang (teman, tim, atau member komunitas) saat berada di lokasi atau event yang sama maupun secara remote.
- Memberikan identitas komunal pada benda fisik (NFC Wristband / Card). Daripada sekadar tautan profil personal, NFC dapat dijadikan "kunci masuk" (access token) ke sebuah ruangan digital rahasia.

## 3. Target User
- Grup pertemanan (Social Circles).
- Anggota komunitas tertutup atau klub.
- Peserta event gathering terbatas.

## 4. Use Case Utama
- **Digital Basecamp**: Tempat berkumpul visual untuk grup teman.
- **Event / Party Roster**: Mengetahui siapa saja tamu yang sedang "Check-in" atau menyalakan notifikasi kehadirannya di suatu acara/klub.
- **Gamified Attendance**: Sensasi visual ketika semua member online bersama (Orbiting effect -> Merged resonance).

---

# User Flow

## 1. User Masuk Dari Mana
- Bisa masuk dari URL publik (`rifelo.id/c/[slug]` atau `rifelo.id/t/[token]`).
- Melalui halaman NFC tap (redirect ke link circle).
- Dari Dashboard (jika user adalah admin atau member yang sudah join).

## 2. Apa yang Terjadi Setelah Tap NFC
- Jika Tag diatur dalam mode `circle`: Saat user men-tap NFC, browser akan terbuka mengarah ke sistem `rifelo.id/t/[token]`. Server akan meredirect user ke halaman circle (misalnya `/c/[slug]`).

## 3. Langkah Demi Langkah User Flow
1. **Tap NFC / Buka Link**: User membuka URL Circle.
2. **Cek Autentikasi & Keanggotaan**:
   - Jika user **belum login**: Akan melihat visual "Public View" terbatas dari circle (orbit animasi dan daftar member statis/minimal).
   - Jika user **sudah login tapi belum join**: Bisa melihat halaman publik, namun membutuhkan *Invite Code* jika ada mekanisme join (saat ini tombolnya disembunyikan di UI utama publik).
   - Jika user **sudah login dan merupakan member**: User diarahkan ke "Member View".
3. **Resonance / Presence**: Di Member View, HP user akan terus mengirim *heartbeat* secara real-time via WebSocket/Supabase Realtime. Dot/avatar milik user akan menyala dan berputar di layar. Jika semua/banyak member online bersama, animasi akan bereaksi (merged/accelerating).

## 4. Apakah Perlu Login atau Tidak
- Untuk **sekadar melihat** status Circle dari luar (Guest View): **Tidak perlu login**.
- Untuk **menjadi bagian dari visualisasi (dot menyala)** dan bergabung: **Harus login**.

## 5. Apakah Join Otomatis atau Manual
- Jika user melakukan proses klaim NFC Tag fisik yang *sudah terasosiasi* (di-assigned) ke sebuah circle, user akan di-join-kan ke circle tersebut secara **otomatis** oleh backend (`api/tags/[id]` atau `api/tags/claim`).
- Jika gabung lewat invite link biasa, harus dengan proses manual memasukkan/mengonfirmasi kode.

---

# Circle Concept

## Definisi "Circle" di Rifelo
Di Rifelo, sebuah "Circle" adalah ruang kehadiran (Presence Room) tertutup dengan penekanan pada estetika dan respon komunal, alih-alih fitur utilitas berat (seperti manajemen folder atau chat). 

Fitur ini **lebih mirip** dengan perpaduan antara:
- **Event Room / Social Circle**: Tempat nongkrong virtual.
- **Gamified Attendance**: Memiliki status "Resonance" yang aktif ketika indikator kehadiran terpenuhi, lebih dari sekadar daftar hadir biasa.
- **Exclusive Club**: Circle bersifat private/tertutup dan menggunakan invite code.

Fitur ini **bukan** sebuah *networking room* profesional, juga tidak terasa kaku seperti alat produktivitas *community management* konvensional.

---

# Current UI Structure

## Daftar Halaman Terkait Circle
1. **Pusat Pengelolaan (Admin)**: `/admin/circles`
2. **Manajemen Circle (Member / Owner)**: `/circle`
3. **Penyetelan Konfigurasi Interaksi Tag**: `/tags`
4. **Halaman Publik / Live View**: `/c/[slug]` atau UnifiedCirclePage
5. **Widget Profil (Opsional)**: Komponen `CircleRealtimeView` yang dirender di halaman Profil Publik `u/[username]` (jika URL mengandung flag `?circle=...`).

## Form / Input & Labels (di menu `/circle` & `/admin/circles`)
- **Circle Name** (Placeholder: "Circle Name", "E.g. Squad", dll di versi lama)
- **Circle Slug** (Placeholder: "Circle slug (URL-friendly)")
- **Circle Description** / Bio
- **Invite Code / Claim Token** (Kode unik untuk join manual).
- Konfigurasi Warna (Resonance Color Picker).

## Button Text
- "Create Circle"
- "Save Changes"
- "Add Link / Platforms"
- Di halaman public, tombol "Join" atau "Enter Code" bergantung modenya.

## UI Elements & States
- **Empty States**: "No circles found. Create one to get started."
- **Visual Nodes (Live View)**: 
  - *Phase: pulsing, rotating, accelerating, merged*. 
  - Tulisan indikator: "Private Live Space", "Resonating...", atau glowing "Resonance Active".
  - Tracker: "3 / 5 Active".

---

# Emotional Direction

## Tone yang Diinginkan
- **Social & Fun**: Diperkuat dengan keberadaan warna-warni orbit.
- **Exclusive**: Vibes "secret club" melalui penggunaan Background Gelap (`#0c0e0b`), efek Glow, dan penggunaan Invite Codes.
- **Gamified / Aesthetic**: Sangat kental dengan transisi framer motion (`motion/react`), physics animasi (orbit sentripetal, rotasi, peleburan elemen menjadi "Giant Merged Circle").
- **Mysterious / Edgy**: Penggunaan elemen minimalis, typography "font-black tracking-widest uppercase".

Sistem ini **tidak terlihat professional/kaku**. Ini menjauh dari kesan B2B atau LinkedIn, dan mencondong ke arah *pop-culture*, Discord/Zenly vibes, atau modern techno-festival app.

---

# Current Problems

## Evaluasi & *Friction*
1. **Confusing / Kurang Konteks**:
   - Jika orang awam melihat layar bulat dengan titik-titik berputar (Orbit Visual), mereka mungkin bingung kegunaan pastinya. Apakah itu game? Apakah itu tracker?
2. **Friction Tinggi Pada Onboarding**:
   - Terlalu banyak abstraksi. "Resonance Active", "Pulsing". Untuk pengguna reguler, metafora ini bisa terasa terlalu *niche*.
3. **Missing "Join" Flow untuk Publik**:
   - Pada `UnifiedCirclePage.tsx` saat ini, view `isMember = false` (Public View) hanya merender animasi statik dari member yang ada. Fitur untuk gabung (`handleJoinClick()`) saat ini mati atau tidak ada titik klik (UI-nya) di public screen. Jika orang luar nge-tap NFC, ia hanya bisa "melihat" namun bingung cara joinnya kalau belum diundang otomatis.
4. **Awkward**:
   - Kadang bentrok dengan nuansa halaman utama Profil yang tadi kaku (misal ada profile yang pakai jabatan profesional tapi tag NFC-nya me-redirect ke animasi Orbit ini).

---

# Visual Context

- **Layout Live Room (`/c/[slug]`)**:
  - Full Black screen (`#0c0e0b`) dengan aksen Font Putih.
  - Teks Top-Bar: Tombol "Dashboard" kecil & live count "X / Y Active" (dengan green pulsing dot).
  - Teks Tengah: Nama Circle Besar (Uppercase, Bold, Spasi lebar). Di bawahnya terdapat status (e.g. "Private Live Space").
  - Visual Center: Lintasan melingkar tak terlihat berisi lingkaran/titik (dot) kecil yang bergerak memutar (rotate). Titik ini merepresentasikan tiap-tiap member. Semakin banyak yang online, rotasi semakin cepat hingga akhirnya melebur (Merge) ke posisi sentral membentuk lingkaran super besar (Resonance glow effect).
  - Bawah: Daftar member ditampilkan vertikal dengan bullet dot warna warni (menyala merah/hijau/biru jika online, redup jika offline).

---

# Technical Constraints
- **Mobile-First**: Tampilan difokuskan untuk layar vertikal portrait (`w-[300px]`, sentral alignment). Desktop terlihat rapi berkat grid centering.
- **Real-Time Berat**: Menggunakan `supabase.channel`, `presence`, dan `postgres_changes`. Rentan memory leak jika tab ditinggal terbuka lama tanpa cleanup `last_heartbeat`. Animasi dihandle frame-by-frame oleh `framer-motion` (`useAnimationFrame`).
- **Wording Harus Pendek**: Lebar dari *CircleNameDisplay* terbatas agar muat di tengah lingkaran orbit. Text terlalu panjang akan patah secara otomatis berdasarkan *maxLineLength*. Wording UI pada layar animasi juga sangat ringkas (Uppercase text kecil).
