import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Fitur Rifelo — Platform Circle Interaktif Modern",
  description: "Rifelo menyediakan fitur untuk pengalaman komunitas digital yang lebih hidup dengan real-time presence dan interaksi instan.",
};

export default function RifeloFeatures() {
  return (
    <main className="min-h-screen bg-[#F4F3EE] text-[#0c0e0b] font-sans py-16 px-6 md:px-12">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#aaafbc]/20">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#0c0e0b]/60 hover:text-[#0c0e0b] transition-colors">
            &larr; Kembali ke Beranda
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-[#0c0e0b]">
          Fitur Utama Rifelo
        </h1>
        
        <div className="text-[#0c0e0b]/80 space-y-6 md:text-lg leading-relaxed">
          <p>
            Rifelo menyediakan fitur untuk pengalaman komunitas digital yang lebih hidup. 
            Nikmati fitur-fitur yang didesain secara elegan untuk kemudahan koneksi.
          </p>

          <div className="space-y-8 mt-12">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#0c0e0b] mb-3 tracking-tight">Real-Time Presence</h2>
              <p>Status online langsung terlihat. Melalui Rifelo, tidak ada batas jeda antara kehadiran Anda dan circle Anda.</p>
            </div>
            
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#0c0e0b] mb-3 tracking-tight">Circle Interface</h2>
              <p>Tampilan visual berbasis lingkaran yang menyajikan representasi komunitas yang indah, dinamis, dan intuitif.</p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#0c0e0b] mb-3 tracking-tight">Respons Instan</h2>
              <p>Nikmati pergerakan tanpa hambatan. Perubahan status di Rifelo terjadi tanpa perlunya <i className="opacity-80">reload</i> atau refresh sama sekali.</p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#0c0e0b] mb-3 tracking-tight">Mobile Friendly</h2>
              <p>Dari desain hingga pengalaman penggunaan, semua disesuaikan agar terasa ringan dan <i>native</i> pada <i>smartphone</i> Anda.</p>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
