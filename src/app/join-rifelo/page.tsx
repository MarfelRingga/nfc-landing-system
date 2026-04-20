import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Gabung Rifelo — Mulai Circle Kamu",
  description: "Mulai pengalaman baru dengan Rifelo. Buat atau gabung circle dan rasakan interaksi real-time tanpa batas.",
};

export default function JoinRifelo() {
  return (
    <main className="min-h-screen bg-[#F4F3EE] text-[#0c0e0b] font-sans py-16 px-6 md:px-12 flex flex-col justify-center">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#aaafbc]/20 w-full">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#0c0e0b]/60 hover:text-[#0c0e0b] transition-colors">
            &larr; Kembali ke Beranda
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-[#0c0e0b]">
          Gabung ke Rifelo
        </h1>
        
        <div className="text-[#0c0e0b]/80 space-y-6 md:text-lg leading-relaxed">
          <p>
            Mulai pengalaman baru dengan Rifelo.
            Buat atau gabung circle dan rasakan interaksi real-time tanpa batas.
          </p>

          <div className="bg-[#0c0e0b]/5 rounded-2xl p-6 md:p-8 mt-8 mb-8 border border-[#aaafbc]/20">
            <h2 className="text-xl font-semibold text-[#0c0e0b] mb-4 tracking-tight">Kenapa Harus Gabung?</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong className="text-[#0c0e0b]">Interaksi cepat:</strong> Konektivitas hitungan detik di mana pun Anda berada.</li>
              <li><strong className="text-[#0c0e0b]">Komunitas lebih hidup:</strong> Bangun circle dengan interaksi nyata.</li>
              <li><strong className="text-[#0c0e0b]">UI modern:</strong> Pengalaman antarmuka yang clean, estetik, dan elegan.</li>
              <li><strong className="text-[#0c0e0b]">Optimized mobile:</strong> Berfungsi mulus bagai aplikasi bawaan.</li>
            </ul>
          </div>
          
          <div className="pt-6 border-t border-[#aaafbc]/20">
             <Link 
               href="/signup" 
               className="inline-flex justify-center items-center rounded-xl bg-[#1A1A1A] px-6 py-3.5 text-base font-medium text-white shadow-md hover:bg-[#0c0e0b] transition-all active:scale-95"
             >
               Mulai Buat Circle
             </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
