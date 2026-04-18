'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  Cpu, 
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const [contactLink, setContactLink] = useState('mailto:support@rifelo.com');
  const [getYoursNowLink, setGetYoursNowLink] = useState('mailto:support@rifelo.com');
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('id, value')
          .in('id', ['contact_support_link', 'get_yours_now_link']);
        
        if (!error && data) {
          const contactSetting = data.find(s => s.id === 'contact_support_link');
          const getYoursSetting = data.find(s => s.id === 'get_yours_now_link');
          
          if (contactSetting?.value) setContactLink(contactSetting.value);
          if (getYoursSetting?.value) setGetYoursNowLink(getYoursSetting.value);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (isConnected) {
      const timeout = setTimeout(() => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([150, 150, 150]);
        }
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-[#F4F3EE] font-sans selection:bg-[#a299af]/30 selection:text-[#0c0e0b] flex flex-col">
      
      {/* 1. Navbar (Minimalist) */}
      <nav className="w-full flex items-center justify-between py-6 px-6 md:px-12 max-w-7xl mx-auto z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
            <Image 
              src="/brand/logos/favicon/icon-192x192.png" 
              alt="rifelo Logo" 
              fill 
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#0c0e0b]">rifelo</span>
        </Link>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <Link 
            href="/login" 
            className="text-sm font-medium text-[#0c0e0b]/70 hover:text-[#0c0e0b] transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/signup" 
            className="text-sm font-medium px-4 py-2 sm:px-5 sm:py-2.5 bg-[#1A1A1A] text-white rounded-full hover:bg-[#0c0e0b] transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <main className="h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden w-full">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square w-full max-w-[600px] bg-[#a299af]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 relative z-10 w-full -mt-16 sm:-mt-24">
          <motion.div 
            layout
            className="flex flex-row items-center justify-center w-full relative gap-4 md:gap-8"
          >
            {/* Connection Glow */}
            <AnimatePresence>
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square w-full max-w-[192px] bg-[#a299af]/30 blur-3xl rounded-full pointer-events-none z-0"
                />
              )}
            </AnimatePresence>

            {/* Left: NFC Bracelet */}
            <div className="flex-1 flex justify-end items-center min-w-0">
              <motion.div 
                layout
                animate={{ 
                  scale: isConnected ? 0.97 : 1,
                  opacity: isConnected ? 1 : 0.8
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="relative z-10 shrink-0 flex items-center justify-center w-[35vw] max-w-[140px] md:w-full md:max-w-[200px]"
              >
                <Image
                  src="/images/wristband.png"
                  alt="Rifelo NFC bracelet"
                  width={600}
                  height={600}
                  className="object-contain"
                  unoptimized
                />
              </motion.div>
            </div>

            {/* Center: Button */}
            <AnimatePresence mode="popLayout">
              {!isConnected && (
                <motion.div 
                  key="connect-btn"
                  layout
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col items-center justify-center z-20 shrink-0"
                >
                  <button 
                    onClick={() => setIsConnected(true)}
                    disabled={isConnected}
                    className="flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base bg-[#1A1A1A] text-white rounded-full font-medium hover:bg-[#0c0e0b] transition-all shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                  >
                    Tap to connect
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right: Phone Mockup */}
            <div className="flex-1 flex justify-start items-center min-w-0">
              <motion.div 
                layout
                animate={{ 
                  scale: isConnected ? 1.02 : 1,
                  x: isConnected ? [0, -1.5, 1.5, -1.5, 0, 0, -1.5, 1.5, -1.5, 0, 0] : 0,
                  rotate: isConnected ? [0, -0.5, 0.5, -0.5, 0, 0, -0.5, 0.5, -0.5, 0, 0] : 0
                }}
                transition={{ 
                  duration: 0.6, 
                  ease: "easeInOut",
                  x: { delay: 0.6, duration: 1.2, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], ease: "easeInOut" },
                  rotate: { delay: 0.6, duration: 1.2, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], ease: "easeInOut" }
                }}
                className="relative z-30 shrink-0 flex items-center justify-center w-[45vw] max-w-[180px] md:w-full md:max-w-[260px]"
              >
                <Image
                  src="/images/phone.png"
                  alt="Rifelo phone demo"
                  width={800}
                  height={1600}
                  className="object-contain"
                  priority
                  quality={100}
                  unoptimized
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll Hint */}
          <div className="py-4 flex items-center justify-center mt-4">
            <AnimatePresence>
              {isConnected && (
                <motion.button
                  onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="text-[#0c0e0b]/40 hover:text-[#0c0e0b]/70 transition-colors text-[10px] sm:text-xs font-medium tracking-wide uppercase cursor-pointer"
                >
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    Scroll to explore ↓
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* 4. Value Proposition (Bento Grid Lite) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div 
            className="group relative bg-white rounded-3xl p-8 border border-[#aaafbc]/30 shadow-sm hover:shadow-[0_12px_30px_-8px_rgba(162,153,175,0.2)] hover:border-[#a299af]/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#a299af]/0 to-[#a299af]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h3 className="text-xl font-semibold text-[#0c0e0b] mb-3">Ultra-Lightweight</h3>
            <p className="text-[#0c0e0b]/70 leading-relaxed text-sm">
              Desain ringan, mendukung aktivitas aktif.
            </p>
          </div>

          {/* Card 2 */}
          <div 
            className="group relative bg-white rounded-3xl p-8 border border-[#aaafbc]/30 shadow-sm hover:shadow-[0_12px_30px_-8px_rgba(162,153,175,0.2)] hover:border-[#a299af]/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#a299af]/0 to-[#a299af]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h3 className="text-xl font-semibold text-[#0c0e0b] mb-3">Smooth</h3>
            <p className="text-[#0c0e0b]/70 leading-relaxed text-sm">
              Permukaan halus, lembut, dan tampilan yang premium.
            </p>
          </div>

          {/* Card 3 */}
          <div 
            className="group relative bg-white rounded-3xl p-8 border border-[#aaafbc]/30 shadow-sm hover:shadow-[0_12px_30px_-8px_rgba(162,153,175,0.2)] hover:border-[#a299af]/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#a299af]/0 to-[#a299af]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h3 className="text-xl font-semibold text-[#0c0e0b] mb-3">Perfectly Adjustable</h3>
            <p className="text-[#0c0e0b]/70 leading-relaxed text-sm">
              Pengunci fleksibel, pas di tangan siapa saja tanpa merusak tampilan.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Footer (SEO Optimized) */}
      <footer className="pt-20 pb-10 px-6 md:px-12 border-t border-[#aaafbc]/20 mt-auto bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
            {/* Brand & SEO Text */}
            <div className="md:col-span-5 lg:col-span-4">
              <Link href="/" className="flex items-center gap-2 group mb-6">
                <div className="relative w-7 h-7 transition-transform group-hover:scale-105">
                  <Image 
                    src="/brand/logos/favicon/icon-192x192.png" 
                    alt="rifelo Logo" 
                    fill 
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="font-semibold text-xl tracking-tight text-[#0c0e0b]">rifelo</span>
              </Link>
              <p className="text-sm text-[#0c0e0b]/60 leading-relaxed mb-6 pe-4">
                The premium NFC wristband and digital ecosystem for smart event management, seamless check-ins, and interactive guest experiences.
              </p>
            </div>

            {/* Links: Product */}
            <div className="md:col-span-3 lg:col-span-2 lg:col-start-6">
              <h4 className="font-semibold text-[#0c0e0b] mb-5 text-xs tracking-widest uppercase">Product</h4>
              <ul className="space-y-4 text-sm text-[#0c0e0b]/60">
                <li><Link href="#" className="hover:text-[#0c0e0b] transition-colors">Smart Wristbands</Link></li>
                <li><Link href="#" className="hover:text-[#0c0e0b] transition-colors">Event Dashboard</Link></li>
                <li><Link href="#" className="hover:text-[#0c0e0b] transition-colors">Live Resonance</Link></li>
                <li><Link href="#" className="hover:text-[#0c0e0b] transition-colors">NFC Technology</Link></li>
              </ul>
            </div>

            {/* Links: Company */}
            <div className="md:col-span-2 lg:col-span-2">
              <h4 className="font-semibold text-[#0c0e0b] mb-5 text-xs tracking-widest uppercase">Company</h4>
              <ul className="space-y-4 text-sm text-[#0c0e0b]/60">
                <li><Link href="#" className="hover:text-[#0c0e0b] transition-colors">About Us</Link></li>
                <li><Link href={contactLink} className="hover:text-[#0c0e0b] transition-colors">Contact Support</Link></li>
                <li><Link href="#" className="hover:text-[#0c0e0b] transition-colors">Partnerships</Link></li>
                <li><Link href="#" className="hover:text-[#0c0e0b] transition-colors">Help Center</Link></li>
              </ul>
            </div>

            {/* Links: Legal */}
            <div className="md:col-span-2 lg:col-span-2">
              <h4 className="font-semibold text-[#0c0e0b] mb-5 text-xs tracking-widest uppercase">Legal</h4>
              <ul className="space-y-4 text-sm text-[#0c0e0b]/60">
                <li><Link href="/privacy" className="hover:text-[#0c0e0b] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#0c0e0b] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#aaafbc]/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#0c0e0b]/40 font-medium">
            <p>© {new Date().getFullYear()} rifelo Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-[#0c0e0b] transition-colors">Twitter (X)</Link>
              <Link href="#" className="hover:text-[#0c0e0b] transition-colors">Instagram</Link>
              <Link href="#" className="hover:text-[#0c0e0b] transition-colors">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
