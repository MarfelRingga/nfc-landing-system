import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "What is Rifelo? - Digital Identity Platform",
  description: "Rifelo is a simple way to connect with people in real life. Learn how to tap and connect instantly.",
};

export default function WhatIsRifelo() {
  return (
    <main className="min-h-screen bg-[#F4F3EE] text-[#0c0e0b] font-sans py-16 px-6 md:px-12">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#aaafbc]/20">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
              <img 
                src="https://i.ibb.co.com/20WNbGMp/favicon-192x192.png" 
                alt="rifelo Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer" 
              />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#0c0e0b]">Rifelo</span>
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-[#0c0e0b]">
          What is Rifelo?
        </h1>
        
        <div className="text-[#0c0e0b]/80 space-y-6 md:text-lg leading-relaxed content-area">
          <p>
            Rifelo is a simple way to connect with people in real life.
          </p>
          <p>
            Instead of sharing contacts manually, you just tap — and your profile opens instantly. Others can see your information and connect with you right away.
          </p>
          <p className="font-medium">
            No apps, no complicated steps. Just tap and connect.
          </p>
        </div>
      </article>
    </main>
  );
}
