import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F4F3EE] font-sans text-[#0c0e0b] selection:bg-[#a299af]/30">
      <nav className="w-full flex items-center justify-between py-6 px-6 md:px-12 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
            <Image 
              src="/brand/logos/favicon/icon-192x192.png" 
              alt="rifelo Logo" 
              fill 
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight">rifelo</span>
        </Link>
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm font-medium text-[#0c0e0b]/70 hover:text-[#0c0e0b] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-24">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Kebijakan Privasi</h1>
        <p className="text-[#0c0e0b]/60 mb-12">Terakhir Diperbarui: 17 April 2026</p>

        <div className="space-y-10 leading-relaxed text-[#0c0e0b]/80">
          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">1. Pendahuluan</h2>
            <p>
              Selamat datang di Rifelo. Kami sangat menghargai privasi Anda dan berkomitmen penuh untuk melindungi data pribadi yang Anda bagikan saat menggunakan layanan platform *smart event management* dan gelang pintar NFC kami. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga data Anda.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">2. Informasi yang Kami Kumpulkan</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Data Profil:</strong> Kami mengumpulkan nama lengkap, <i>username</i>, dan nomor telepon seluler (contoh format: +62) Anda saat mendaftar ke layanan kami.</li>
              <li><strong>Data Perangkat dan Interaksi NFC:</strong> Kami dapat mencatat aktivitas <i>tapping</i> gelang NFC Anda pada sesi <i>check-in</i> maupun interaksi antar <i>guest</i>.</li>
              <li><strong>Data Circle & Resonance:</strong> Saat Anda menggunakan fitur "Circle" dan berinteraksi dalam "Resonance", kehadiran digital Anda (seperti preferensi warna Aura) akan disimpan untuk mendukung tampilan real-time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">3. Bagaimana Data Digunakan</h2>
            <p className="mb-2">Data Anda secara spesifik digunakan untuk:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Melakukan autentikasi masuk / <i>login</i> yang aman.</li>
              <li>Menyediakan layanan sinkronisasi waktu nyata pada fitur <i>Live Space Dashboard</i> dan <i>Resonance Preview</i>.</li>
              <li>Memberikan visibilitas identitas (nama / avatar) kepada anggota lain dalam satu <i>Circle</i> yang sama sesuai peran Anda.</li>
              <li>Menganalisis dan meningkatkan kualitas layanan perangkat keras (gelang NFC) maupun perangkat lunak kami.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">4. Berbagi Data dengan Pihak Ketiga</h2>
            <p>
              Rifelo <strong>tidak pernah menjual</strong> data pribadi Anda kepada entitas pihak ketiga. Namun, demi menunjang operasional, kami berpotensi membagikan sebagian data kepada:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Event Organizer (EO):</strong> Pihak penyelenggara di mana Anda resmi terdaftar, guna keperluan kelancaran <i>check-in</i> dan operasional acara.</li>
              <li><strong>Penyedia Infrastruktur:</strong> Kami menggunakan layanan berbasis *cloud* skala besar yang memiliki standar keamanan global (mencakup otentikasi Supabase & Google Cloud) untuk melindungi database.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">5. Retensi Hak dan Penghapusan Data</h2>
            <p>
              Anda berhak setiap saat untuk meminta pembaharuan, pengunduhan, atau penghapusan penuh (<i>account deletion</i>) dari seluruh data pribadi Anda yang ada di jaringan Rifelo. Untuk melakukan penghapusan data secara permanen, silakan menghubungi administrator <i>Circle</i> Anda atau tim dukungan pelanggan kami.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0c0e0b] mb-4">6. Hubungi Kami</h2>
            <p>
              Jika terdapat pertanyaan, keraguan, atau keluhan lain seputar pelindungan data dan kebijakan privasi di platform Rifelo, Anda dapat menyampaikannya secara langsung ke e-mail kami di: <strong>support@rifelo.com</strong>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
