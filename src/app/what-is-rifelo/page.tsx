import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Apa itu Rifelo? Platform Circle Interaktif Real-Time",
  description: "Rifelo adalah platform circle interaktif real-time yang memungkinkan pengguna terhubung dalam satu ruang digital secara langsung.",
};

export default function WhatIsRifelo() {
  return (
    <main className="min-h-screen bg-[#F4F3EE] text-[#0c0e0b] font-sans py-16 px-6 md:px-12">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#aaafbc]/20">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#0c0e0b]/60 hover:text-[#0c0e0b] transition-colors">
            &larr; Kembali ke Beranda
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-[#0c0e0b]">
          Apa itu Rifelo?
        </h1>
        
        <div className="text-[#0c0e0b]/80 space-y-6 md:text-lg leading-relaxed content-area">
          <p>
            Rifelo adalah platform circle interaktif real-time yang memungkinkan pengguna terhubung dalam satu ruang digital secara langsung. 
            Berbeda dari platform komunitas biasa, Rifelo menghadirkan interaksi berbasis kehadiran (presence) yang terasa hidup dan responsif.
          </p>
          <p>
            Dengan Rifelo, setiap anggota dalam sebuah circle dapat terlihat aktif secara visual.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold text-[#0c0e0b] mt-12 mb-6 tracking-tight">
            Kenapa Rifelo berbeda?
          </h2>
          
          <ul className="list-disc pl-6 space-y-3">
            <li><strong className="text-[#0c0e0b]">Real-time presence:</strong> Melihat aktivitas orang terdekat dalam hitungan detik.</li>
            <li><strong className="text-[#0c0e0b]">Interaksi visual berbasis circle:</strong> Hubungan digital yang disajikan secara sentral dan organik.</li>
            <li><strong className="text-[#0c0e0b]">Respons cepat tanpa reload:</strong> Tetap terus tersambung dengan mulus.</li>
            <li><strong className="text-[#0c0e0b]">Mobile friendly:</strong> Desain sempurna untuk layar dalam genggaman.</li>
          </ul>
        </div>
      </article>
    </main>
  );
}
