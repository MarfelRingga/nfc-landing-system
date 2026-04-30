import Link from "next/link";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Rifelo - Your Identity, Instantly Shared",
  description: "Rifelo is a digital identity platform that makes it easy to share who you are and connect instantly.",
  alternates: {
    canonical: "https://rifelo.id/rifelo",
  }
}

export default function RifeloEntityPage() {
  return (
    <div className="min-h-screen bg-[#F4F3EE] flex flex-col w-full text-[#0c0e0b] font-sans selection:bg-[#a299af]/30 selection:text-[#0c0e0b]">
      <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
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
      </nav>
      
      <main className="flex-1 flex flex-col items-center px-6 pb-16 md:px-12">
        <article className="max-w-3xl w-full bg-white p-8 md:p-14 rounded-[2rem] md:rounded-[2.5rem] border border-[#aaafbc]/20 shadow-sm">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-[#0c0e0b]">
            Rifelo
          </h1>
          
          <div className="space-y-6 text-[#0c0e0b]/80 leading-relaxed text-base md:text-lg">
            <p>
              <strong>Rifelo</strong> is a digital identity platform that makes it easy to share who you are and connect instantly.
            </p>
            <p>
              With a simple tap, your profile opens and allows others to view your information, explore your links, and interact with you right away.
            </p>
            <p>
              Rifelo is designed for real-world situations where speed and simplicity matter. Whether you're at school, events, or meeting new people, Rifelo removes friction and makes interaction effortless.
            </p>
            <p>
              By combining physical access (like NFC) with dynamic digital profiles, Rifelo creates a seamless bridge between the physical and digital world.
            </p>
            <p className="pt-6 border-t border-[#aaafbc]/10 text-sm md:text-base mt-2">
              Rifelo operates through its official domain at <strong>rifelo.id</strong>.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
