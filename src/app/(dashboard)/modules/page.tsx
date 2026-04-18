'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { 
  Camera, 
  ScanLine, 
  Map, 
  Terminal, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const modules = [
  {
    id: 'photobooth',
    title: 'Smart Photobooth',
    description: 'AI-powered photo experiences with instant digital delivery and branded overlays.',
    icon: Camera,
    colSpan: 'md:col-span-2',
    rowSpan: 'md:row-span-2',
    isHero: true,
  },
  {
    id: 'rfid',
    title: 'RFID Scanning',
    description: 'High-throughput access control and cashless payments using NFC wristbands.',
    icon: ScanLine,
    colSpan: 'md:col-span-1',
    rowSpan: 'md:row-span-1',
    isHero: false,
  },
  {
    id: 'heatmap',
    title: 'Live Heatmap',
    description: 'Real-time crowd density tracking and flow analysis for optimizing venue layouts.',
    icon: Map,
    colSpan: 'md:col-span-1',
    rowSpan: 'md:row-span-1',
    isHero: false,
  },
  {
    id: 'api',
    title: 'Developer API',
    description: 'Direct programmatic access to your event data for custom integrations.',
    icon: Terminal,
    colSpan: 'md:col-span-2',
    rowSpan: 'md:row-span-1',
    isHero: false,
  }
];

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-[#F4F3EE] font-sans selection:bg-[#a299af]/30 selection:text-[#0c0e0b] p-6 md:p-12 lg:p-16">
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-[#aaafbc]/30 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-[#a299af]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#0c0e0b]">
            Mode Modules
          </h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg text-[#0c0e0b]/70 max-w-2xl leading-relaxed"
        >
          Enhance your events with powerful integrations. Discover premium tools designed to elevate the attendee experience and streamline your operations.
        </motion.p>
      </div>

      {/* Bento Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
          {modules.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.1 * index, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.3, ease: 'easeOut' }
                }}
                className={`group relative bg-white rounded-3xl p-8 flex flex-col justify-between overflow-hidden border border-[#aaafbc]/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-8px_rgba(162,153,175,0.2)] hover:border-[#a299af]/50 transition-all duration-300 ${mod.colSpan} ${mod.rowSpan}`}
              >
                {/* Subtle Glow Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#a299af]/0 to-[#a299af]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Top Section: Icon & Content */}
                <div className="relative z-10">
                  <div className={`mb-6 flex items-center justify-center rounded-2xl bg-[#F4F3EE] border border-[#aaafbc]/20 ${mod.isHero ? 'w-20 h-20' : 'w-14 h-14'}`}>
                    <Icon className={`${mod.isHero ? 'w-10 h-10' : 'w-7 h-7'} text-[#a299af]`} strokeWidth={1.5} />
                  </div>
                  
                  <h3 className={`font-semibold text-[#0c0e0b] tracking-tight mb-3 ${mod.isHero ? 'text-3xl' : 'text-xl'}`}>
                    {mod.title}
                  </h3>
                  
                  <p className={`text-[#0c0e0b]/70 leading-relaxed ${mod.isHero ? 'text-lg max-w-md' : 'text-sm'}`}>
                    {mod.description}
                  </p>
                </div>

                {/* Bottom Section: CTA */}
                <div className="relative z-10 mt-8 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#0c0e0b]/50 group-hover:text-[#a299af] transition-colors duration-300">
                    Explore Module
                  </span>
                  <Link href="/signup" className="w-10 h-10 rounded-full bg-[#F4F3EE] border border-[#aaafbc]/30 flex items-center justify-center text-[#0c0e0b] group-hover:bg-[#1A1A1A] group-hover:text-white group-hover:border-[#1A1A1A] transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
