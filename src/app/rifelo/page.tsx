import Link from "next/link";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Rifelo - Official NFC Technology Platform",
  description: "Rifelo is an official technology platform specializing in NFC-powered digital profile systems for modern networking and interactive events.",
  alternates: {
    canonical: "https://rifelo.id/rifelo",
  }
}

export default function RifeloEntityPage() {
  return (
    <div className="min-h-screen bg-[#F4F3EE] flex flex-col w-full text-[#0c0e0b] font-sans selection:bg-[#a299af]/30 selection:text-[#0c0e0b]">
      <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-[#0c0e0b]/60 hover:text-[#0c0e0b] transition-colors">
          &larr; Back to Home
        </Link>
      </nav>
      
      <main className="flex-1 flex flex-col items-center px-6 pb-16 md:px-12">
        <article className="max-w-3xl w-full bg-white p-8 md:p-14 rounded-[2rem] md:rounded-[2.5rem] border border-[#aaafbc]/20 shadow-sm">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-[#0c0e0b]">
            Rifelo
          </h1>
          
          <div className="space-y-6 text-[#0c0e0b]/80 leading-relaxed text-base md:text-lg">
            <p className="font-medium text-xl text-[#0c0e0b]">
              Rifelo is an NFC-based digital profile platform for instant, app-free interaction.
            </p>
            <p>
              <strong>Rifelo</strong> is a pioneering technology platform designed to seamlessly bridge the physical and digital worlds. By leveraging the power of Near Field Communication (NFC) technology, Rifelo transforms everyday interactions into modern, interactive experiences. Our primary focus is building a robust digital profile system that allows users to securely and instantly share their professional and personal identity with a single tap.
            </p>
            
            <p>
              At its core, the Rifelo ecosystem is engineered to eliminate the friction typically associated with traditional networking. Whether you are attending large-scale corporate events, community meetups, or navigating daily professional interactions, the Rifelo NFC-enabled infrastructure ensures your digital presence is always accurately synchronized and alive in real time. Our approach combines sleek physical smart tags with high-performance, cloud-based dynamic profiles, ensuring that your contact information, portfolios, and social connections are instantly accessible on any modern smartphone without the need for additional applications.
            </p>
            
            <p>
              As digital interactions become increasingly central to how we connect, Rifelo provides a secure, intuitive, and privacy-first solution. Users have complete control over what information they choose to share, making it highly adaptable for diverse use cases ranging from enterprise networking to casual social exchanges. Our commitment is to deliver an elegant, fast, and frictionless tool for modern identity management.
            </p>
            
            <p className="pt-6 border-t border-[#aaafbc]/10 text-sm md:text-base mt-2">
              You are currently viewing the foundational brand entity page. To learn more about our hardware, explore interactive demos, or create your own digital profile networking space, please <Link href="/" className="font-semibold text-[#0c0e0b] underline decoration-[#0c0e0b]/30 hover:decoration-[#0c0e0b] transition-all">Visit Rifelo official website</Link>. Rifelo operates through its official domain at <strong>rifelo.id</strong>.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
