import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Rifelo Features - Digital Identity & NFC Interaction",
  description: "Explore Rifelo features: Digital Profiles, Tap to Connect, and Real-Time Circles.",
};

export default function RifeloFeatures() {
  return (
    <main className="min-h-screen bg-[#F4F3EE] text-[#0c0e0b] font-sans py-16 px-6 md:px-12">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#aaafbc]/20">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
              <img 
                src="https://i.ibb.co.com/20WNbGMp/favicon-192x192.png" 
                alt="Rifelo Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer" 
              />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#0c0e0b]">Rifelo</span>
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-[#0c0e0b]">
          Rifelo Features
        </h1>
        
        <div className="text-[#0c0e0b]/80 space-y-6 md:text-lg leading-relaxed">
          <div className="space-y-8 mt-12">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#0c0e0b] mb-3 tracking-tight">Digital Profile</h2>
              <p>Create a simple profile that represents who you are and keeps everything in one place.</p>
            </div>
            
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#0c0e0b] mb-3 tracking-tight">Tap to Connect</h2>
              <p>Share your profile instantly using a simple tap on any smartphone.</p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#0c0e0b] mb-3 tracking-tight">Circle</h2>
              <p>See who is active around you and connect naturally in real-world spaces.</p>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
