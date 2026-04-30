import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Join Rifelo — Start Your Circle",
  description: "Start a new experience with Rifelo. Create or join a circle and feel seamless real-time interaction.",
};

export default function JoinRifelo() {
  return (
    <main className="min-h-screen bg-[#F4F3EE] text-[#0c0e0b] font-sans py-16 px-6 md:px-12 flex flex-col justify-center">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#aaafbc]/20 w-full">
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
          Join Rifelo
        </h1>
        
        <div className="text-[#0c0e0b]/80 space-y-6 md:text-lg leading-relaxed">
          <p>
            Start a new experience with Rifelo.
            Create or join a circle and feel seamless real-time interaction.
          </p>

          <div className="bg-[#0c0e0b]/5 rounded-2xl p-6 md:p-8 mt-8 mb-8 border border-[#aaafbc]/20">
            <h2 className="text-xl font-semibold text-[#0c0e0b] mb-4 tracking-tight">Why Join?</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong className="text-[#0c0e0b]">Instant Interaction:</strong> Near-instant connectivity wherever you are.</li>
              <li><strong className="text-[#0c0e0b]">Active Communities:</strong> Build circles with genuine interaction.</li>
              <li><strong className="text-[#0c0e0b]">Modern UI:</strong> Clean, aesthetic, and elegant interface.</li>
              <li><strong className="text-[#0c0e0b]">Mobile Optimized:</strong> Works smoothly like a native app.</li>
            </ul>
          </div>
          
          <div className="pt-6 border-t border-[#aaafbc]/20">
             <Link 
               href="/signup" 
               className="inline-flex justify-center items-center rounded-xl bg-[#1A1A1A] px-6 py-3.5 text-base font-medium text-white shadow-md hover:bg-[#0c0e0b] transition-all active:scale-95"
             >
               Start a Circle
             </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
