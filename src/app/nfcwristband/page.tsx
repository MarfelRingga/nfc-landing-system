'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Instagram } from 'lucide-react';

export default function NfcWristbandComingSoon() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none"></div>
      
      {/* Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#a299af]/20 blur-[100px] rounded-full pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-[#0c0e0b] mb-6">
            COMING SOON
          </h1>
          <p className="text-base sm:text-lg text-[#0c0e0b]/60 leading-relaxed max-w-lg mx-auto mb-10 font-medium">
            We're building the future of physical networking. The Rifelo NFC Wristband will seamlessly connect your digital identity with the real world.
          </p>

          <Link 
            href="https://instagram.com/rifelo.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] text-white rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:bg-[#0c0e0b] transition-all shadow-xl hover:shadow-2xl active:scale-95 group border border-[#1A1A1A]"
          >
            <Instagram className="w-4 h-4" />
            Stay updated on Instagram
          </Link>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-0 w-full text-center"
      >
        <p className="text-[10px] text-[#0c0e0b]/30 uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} Rifelo Inc. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
