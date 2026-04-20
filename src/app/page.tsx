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
  Sparkles,
  Lock,
  Briefcase,
  Mail,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const [contactLink, setContactLink] = useState('mailto:support@rifelo.com');
  const [getYoursNowLink, setGetYoursNowLink] = useState('mailto:support@rifelo.com');
  const [globalLinks, setGlobalLinks] = useState<{id: string, title: string, url: string, is_visible?: boolean}[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [circleView, setCircleView] = useState<'public' | 'member'>('public');
  const [resonanceStatus, setResonanceStatus] = useState<'idle' | 'activating' | 'merged'>('idle');
  const [activeIndexes, setActiveIndexes] = useState<number[]>([0, 1]); // initial 2 members active state
  
  const handleResonanceDemo = async () => {
    if (resonanceStatus !== 'idle') {
      setResonanceStatus('idle');
      setActiveIndexes([0, 1]);
      return;
    }
    
    setResonanceStatus('activating');
    
    // Animate inactive dots becoming active 1 by 1
    const totalDots = 6;
    for (let i = 2; i < totalDots; i++) {
        await new Promise(r => setTimeout(r, 400));
        setActiveIndexes(prev => [...prev, i]);
    }
    
    // Quick delay after all are active then merge
    await new Promise(r => setTimeout(r, 600));
    setResonanceStatus('merged');

    // Reset back to idle after 5 seconds
    setTimeout(() => {
      setResonanceStatus('idle');
      setActiveIndexes([0, 1]);
    }, 5000);
  };

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
          .in('id', ['contact_support_link', 'get_yours_now_link', 'global_platforms_links']);
        
        if (!error && data) {
          const contactSetting = data.find(s => s.id === 'contact_support_link');
          const getYoursSetting = data.find(s => s.id === 'get_yours_now_link');
          const globalLinksSetting = data.find(s => s.id === 'global_platforms_links');
          
          if (contactSetting?.value) setContactLink(contactSetting.value);
          if (getYoursSetting?.value) setGetYoursNowLink(getYoursSetting.value);
          if (globalLinksSetting?.value) {
            try {
              setGlobalLinks(JSON.parse(globalLinksSetting.value));
            } catch(e) {}
          }
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
            <img 
              src="https://i.ibb.co.com/20WNbGMp/favicon-192x192.png" 
              alt="rifelo Logo" 
              className="w-full h-full object-contain"
             referrerPolicy="no-referrer" />
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
            <div className="flex-1 flex justify-end items-center min-w-0 pointer-events-none">
              <motion.div 
                layout
                animate={{ 
                  scale: isConnected ? 0.97 : 1,
                  opacity: isConnected ? 1 : 0.8
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="relative z-10 shrink-0 flex items-center justify-center w-[35vw] max-w-[140px] md:w-full md:max-w-[200px] aspect-[4/5] pointer-events-auto"
              >
                <Image
                  src="https://i.ibb.co.com/vvsX17bc/wristband.png"
                  alt="Rifelo NFC bracelet"
                  fill
                  sizes="(max-width: 768px) 35vw, 200px"
                  priority
                  className="object-contain"
                  referrerPolicy="no-referrer" />
              </motion.div>
            </div>

            {/* Center: Button */}
            <AnimatePresence mode="popLayout">
              {!isConnected && (
                <motion.div 
                  key="connect-btn-old"
                  layout
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col items-center justify-center z-[100] shrink-0 mx-2 relative cursor-pointer pointer-events-auto"
                >
                  <button 
                    onClick={() => setIsConnected(true)}
                    disabled={isConnected}
                    className="flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base bg-[#1A1A1A] text-white rounded-full font-medium hover:bg-[#0c0e0b] transition-all shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap cursor-pointer z-[100] pointer-events-auto relative"
                  >
                    Tap to connect
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right: Phone Mockup */}
            <div className="flex-1 flex justify-start items-center min-w-0 pointer-events-none">
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
                className="relative z-30 shrink-0 flex items-center justify-center w-[45vw] max-w-[180px] md:w-full md:max-w-[260px] aspect-[1/2] pointer-events-auto"
              >
                <Image
                  src="https://i.ibb.co.com/JRyHX9JW/phone.png"
                  alt="Rifelo phone demo"
                  fill
                  sizes="(max-width: 768px) 45vw, 260px"
                  priority
                  className="object-contain"
                  referrerPolicy="no-referrer" />
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll Hint */}
          <div className="py-4 flex items-center justify-center mt-4">
            <AnimatePresence>
              {isConnected && (
                <motion.button
                  onClick={() => document.getElementById('demo-box')?.scrollIntoView({ behavior: 'smooth' })}
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

      {/* 2.5. Circle Demo Section */}
      <section id="circle-demo-section" className="min-h-[100dvh] flex flex-col items-center justify-center pt-8 pb-12 px-4 sm:px-6 w-full relative z-10 bg-[#F4F3EE]">

        {/* Interactive Mockup */}
        <div id="demo-box" className="w-full max-w-[420px] mx-auto bg-white rounded-[2rem] pt-3 pb-6 px-3 shadow-[0_12px_40px_-12px_rgba(162,153,175,0.15)] border border-[#aaafbc]/20 scroll-mt-[5px]">
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-full flex items-center gap-4 bg-[#F4F3EE]/50 px-4 py-2.5 rounded-full border border-[#aaafbc]/10 mb-6 shrink-0">
              <div className="flex gap-1.5 shrink-0 opacity-80">
                <div className="w-3 h-3 rounded-full bg-[#FF3B30]"/>
                <div className="w-3 h-3 rounded-full bg-[#FF9500]"/>
                <div className="w-3 h-3 rounded-full bg-[#28C840]"/>
              </div>
              <div className="flex-1 bg-white shadow-sm text-center text-[11px] sm:text-xs font-semibold text-[#0c0e0b]/50 py-1.5 rounded-full flex items-center justify-center gap-1.5 border border-[#aaafbc]/10">
                <Lock className="w-3 h-3" /> rifelo.id/c/rifelo
              </div>
              <div className="w-12 shrink-0" />
            </div>
            
            {/* View Switcher */}
            <div className="flex bg-[#F4F3EE] p-1.5 rounded-full relative w-full h-[52px]">
              {/* Highlight background */}
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#1A1A1A] rounded-full transition-all duration-300 ease-out shadow-sm`}
                style={{ left: circleView === 'public' ? '6px' : 'calc(50%)' }}
              />
              <button 
                onClick={() => setCircleView('public')}
                className={`relative z-10 w-1/2 flex items-center justify-center text-sm font-semibold transition-colors ${circleView === 'public' ? 'text-white' : 'text-[#0c0e0b]/60 hover:text-[#0c0e0b]'}`}
              >
                Tampilan Publik
              </button>
              <button 
                onClick={() => setCircleView('member')}
                className={`relative z-10 w-1/2 flex items-center justify-center text-sm font-semibold transition-colors ${circleView === 'member' ? 'text-white' : 'text-[#0c0e0b]/60 hover:text-[#0c0e0b]'}`}
              >
                Tampilan Member
              </button>
            </div>
          </div>

          <div className="bg-[#0c0e0b] rounded-[2rem] border border-[#a299af]/20 overflow-hidden h-[680px] w-full relative shadow-2xl">
             <AnimatePresence mode="wait">
               {circleView === 'public' ? (
                 <motion.div
                   key="public"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.3 }}
                   className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#0c0e0b] overflow-y-auto scrollbar-hide"
                 >
                    {/* Active Resonance Glow effect (Shared with member view for visual sync) */}
                    <AnimatePresence>
                      {resonanceStatus === 'merged' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <div 
                            className="w-[300px] h-[300px] rounded-full blur-[80px] opacity-20"
                            style={{ backgroundColor: '#a299af' }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Header */}
                    <div className="text-center z-20 mt-12 mb-10 shrink-0">
                      <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-2">
                        rifelo
                      </h1>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest transition-colors duration-1000">
                        {resonanceStatus === 'merged' ? (
                          <span style={{ color: '#a299af', textShadow: `0 0 10px #a299af` }}>
                            Resonance Active
                          </span>
                        ) : resonanceStatus === 'activating' ? (
                          <span className="text-white">Resonating...</span>
                        ) : "Private Live Space"}
                      </p>
                    </div>

                    {/* Circular Presence Visual */}
                    <div className="relative w-[200px] h-[200px] flex flex-col items-center justify-center mb-10 shrink-0">
                      {/* Center Circle Name & Giant Merged Circle */}
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div
                          className={`absolute w-32 h-32 rounded-full flex items-center justify-center text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/10 ${
                            resonanceStatus === 'merged' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          }`}
                          style={{
                            background: `radial-gradient(circle, #a299af 0%, transparent 80%)`,
                            boxShadow: `0 0 60px #a299af, inset 0 0 20px rgba(255,255,255,0.1)`
                          }}
                        >
                          <div className="absolute inset-0 rounded-full animate-pulse" style={{ boxShadow: `0 0 40px #a299af` }} />
                        </div>
                        <div className="font-black text-sm tracking-widest text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] z-20 text-center flex flex-col items-center justify-center leading-tight">
                          rifelo
                        </div>
                      </div>

                      <motion.div
                        animate={{ 
                          rotate: 360,
                          scale: resonanceStatus === 'merged' ? 1.1 : 1
                        }}
                        transition={{ 
                          rotate: { repeat: Infinity, duration: resonanceStatus === 'merged' ? 8 : 25, ease: "linear" },
                          scale: { duration: 2, ease: "easeInOut" }
                        }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        {[0, 1, 2, 3, 4, 5].map((i) => {
                          const angle = (i / 6) * Math.PI * 2;
                          const radius = 70;
                          const x = (Math.cos(angle) * radius).toFixed(2);
                          const y = (Math.sin(angle) * radius).toFixed(2);
                          const color = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF'][i];
                          const isActive = activeIndexes.includes(i);
                          
                          return (
                            <div
                              key={i}
                              className={`absolute transition-all duration-700 ${resonanceStatus === 'merged' ? 'opacity-0' : 'opacity-100'}`}
                              style={{ transform: `translate(${resonanceStatus === 'merged' ? 0 : x}px, ${resonanceStatus === 'merged' ? 0 : y}px)` }}
                            >
                              {/* Light Trail when Resonance is Active */}
                              {resonanceStatus === 'merged' && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 0.8, scale: 1.5 }}
                                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                                  className="absolute inset-0 rounded-full blur-[6px]"
                                  style={{ backgroundColor: color }}
                                />
                              )}
                              <motion.div
                                animate={{
                                  opacity: isActive ? 1 : 0.3,
                                  scale: isActive ? 1.2 : 1,
                                }}
                                transition={{
                                  scale: { duration: 0.5, ease: "easeInOut" }
                                }}
                                className="relative w-3 h-3 rounded-full border border-white/20"
                                style={{ 
                                  backgroundColor: color,
                                  boxShadow: isActive ? `0 0 15px ${color}` : 'none',
                                }}
                              />
                            </div>
                          );
                        })}
                      </motion.div>
                    </div>

                    {/* Minimal Member List */}
                    <div className="w-full flex flex-col items-center gap-3 mb-10 shrink-0">
                      {[0, 1, 2, 3, 4, 5].map((i) => {
                          const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF'];
                          const names = ['You', 'Alex Carter', 'Sarah Jin', 'Mike Ross', 'Emma DW', 'David Kim'];
                          const isActive = activeIndexes.includes(i);
                          const color = colors[i];
                          
                          return (
                            <div key={i} className="flex items-center gap-2.5">
                              <div 
                                className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                                style={{ 
                                  backgroundColor: isActive ? color : 'rgba(255,255,255,0.15)',
                                  boxShadow: isActive ? `0 0 8px ${color}` : 'none'
                                }}
                              />
                              <span className={`text-[10px] font-medium tracking-widest uppercase transition-colors duration-500 ${isActive ? 'text-white/90' : 'text-white/30'}`}>
                                {names[i]}
                              </span>
                            </div>
                          );
                      })}
                    </div>

                    {/* Context Text */}
                    <p className="text-[9px] text-white/20 font-medium tracking-widest uppercase mt-auto mb-4 shrink-0">
                      You are viewing this circle
                    </p>
                 </motion.div>
               ) : (
                 <motion.div
                   key="member"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.3 }}
                   className="absolute inset-0 flex flex-col items-center justify-center text-center bg-[#0c0e0b] text-white overflow-hidden"
                 >
                    {/* Active Resonance Glow effect */}
                    <AnimatePresence>
                      {resonanceStatus === 'merged' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                        >
                          <div 
                            className="w-[300px] h-[300px] rounded-full blur-[80px] opacity-20"
                            style={{ backgroundColor: '#a299af' }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Top Navigation */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
                      <div className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors cursor-pointer">
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Dashboard</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">
                          {activeIndexes.length} / 6 Active
                        </span>
                      </div>
                    </div>

                    {/* Visualization Hub */}
                    <div className="relative w-[300px] h-[300px] flex items-center justify-center z-10">
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          scale: resonanceStatus === 'merged' ? 1.1 : 1
                        }}
                        transition={{ 
                          rotate: { repeat: Infinity, duration: resonanceStatus === 'merged' ? 8 : 25, ease: "linear" },
                          scale: { duration: 1.5, ease: "easeInOut" }
                        }}
                        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                      >
                        {[0, 1, 2, 3, 4, 5].map((i) => {
                          const angle = (i / 6) * Math.PI * 2;
                          const radius = 90;
                          const x = (Math.cos(angle) * radius).toFixed(2);
                          const y = (Math.sin(angle) * radius).toFixed(2);
                          const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF'];
                          const color = colors[i];
                          const isActive = activeIndexes.includes(i);
                          const names = ['You', 'Alex Carter', 'Sarah Jin', 'Mike Ross', 'Emma DW', 'David Kim'];
                          
                          return (
                            <div
                              key={i}
                              className={`absolute shadow-lg group transition-all duration-700 pointer-events-auto cursor-help ${resonanceStatus === 'merged' ? 'opacity-0' : (isActive ? 'opacity-100' : 'opacity-30')}`}
                              style={{ 
                                transform: `translate(${resonanceStatus === 'merged' ? 0 : x}px, ${resonanceStatus === 'merged' ? 0 : y}px) scale(${isActive && resonanceStatus !== 'merged' ? 1.2 : 1})` 
                              }}
                            >
                              <div
                                className="relative w-5 h-5 rounded-full border border-white/20 transition-all duration-700"
                                style={{ 
                                  backgroundColor: color, 
                                  boxShadow: isActive && resonanceStatus !== 'merged' ? `0 0 20px ${color}80` : 'none',
                                }}
                              />
                              {/* Tooltip */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                <span className="text-[10px] font-bold whitespace-nowrap bg-black/90 px-2 py-1 rounded border border-white/10 text-white shadow-xl">
                                  {names[i]}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>

                      {/* Giant Merged Circle */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer z-30"
                        onClick={handleResonanceDemo}
                        role="button"
                      >
                        <div
                          className={`absolute w-32 h-32 rounded-full flex items-center justify-center p-4 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/10 ${
                            resonanceStatus === 'merged' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          }`}
                          style={{
                            background: `radial-gradient(circle, #a299af 0%, transparent 80%)`,
                            boxShadow: `0 0 80px #a299af, inset 0 0 20px rgba(255,255,255,0.1)`
                          }}
                        >
                          <div className="absolute inset-0 rounded-full animate-pulse" style={{ boxShadow: `0 0 60px #a299af` }} />
                        </div>
                        <div className={`font-black text-sm tracking-widest text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] z-40 text-center flex flex-col items-center justify-center leading-tight transition-opacity duration-500 hover:opacity-80`}>
                          rifelo
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status (Absolute) */}
                    <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex flex-col items-center"
                      >
                        <div className="text-xl font-bold tracking-widest uppercase mb-2">
                          rifelo
                        </div>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                          {resonanceStatus === 'merged' ? 'Circle Synchronized' : 
                           resonanceStatus === 'activating' ? 'Resonating...' : 'Establishing Connection...'}
                        </p>
                      </motion.div>
                    </div>

                    {/* Small Resonance CTA */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50">
                      <button 
                        onClick={handleResonanceDemo}
                        disabled={resonanceStatus === 'activating' || resonanceStatus === 'merged'}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase shadow-lg transition-all duration-500 border ${
                          resonanceStatus === 'merged' || resonanceStatus === 'activating'
                            ? 'bg-[#1A1A1A] text-white/40 border-white/5 opacity-50'
                            : 'bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md active:scale-95'
                        }`}
                      >
                        {resonanceStatus === 'merged' ? 'Resonance Active' : resonanceStatus === 'activating' ? 'Synchronizing...' : 'Trigger Resonance'}
                      </button>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 3. Demo Section */}
      <section id="demo-section" className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Text */}
          <div className="order-2 lg:order-1 flex flex-col items-start text-left max-w-lg mx-auto lg:mx-0">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#0c0e0b] mb-6">
              Your Professional Identity, <br/><span className="text-[#0c0e0b]/50">Instantly Shared.</span>
            </h2>
            <p className="text-[#0c0e0b]/70 leading-relaxed mb-8">
              Satu sentuhan sederhana pada gelang RIFELO ke smartphone apa pun, dan profil digital Anda langsung terbuka tanpa memerlukan aplikasi tambahan. Elegan, instan, dan selalu siap sedia.
            </p>
            <ul className="space-y-4 mb-8 w-full">
              {[
                { title: 'No App Required', desc: 'Kompatibel dengan semua smartphone modern (iOS & Android).' },
                { title: 'Dynamic Profile', desc: 'Ubah kontak, portofolio, dan sosial media kapan saja secara real-time.' },
                { title: 'Privacy First', desc: 'Anda memiliki kontrol penuh atas informasi yang ingin dibagikan.' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-[#F4F3EE]/50 border border-[#aaafbc]/10">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#0c0e0b]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[#0c0e0b]">{item.title}</h4>
                    <p className="text-xs text-[#0c0e0b]/60 mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-full font-medium hover:bg-[#0c0e0b] transition-all shadow-md active:scale-95 text-sm"
            >
              Get Your RIFELO <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right Digital Profile Mockup */}
          <div className="order-1 lg:order-2 flex items-center justify-center h-full relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#a299af]/20 rounded-full blur-[80px]" />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[320px] aspect-[9/19] bg-white rounded-[2.5rem] p-2 shadow-2xl border-4 border-[#F4F3EE] overflow-hidden"
            >
              {/* Screen Content */}
              <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-y-auto overflow-x-hidden flex flex-col relative border border-[#aaafbc]/10 scrollbar-hide">
                {/* Simulated Notch */}
                <div className="sticky top-0 left-1/2 -translate-x-1/2 w-[40%] h-6 bg-white rounded-b-xl max-w-[120px] z-50 mb-4 mx-auto"></div>
                
                {/* Public Profile Lookalike */}
                <div className="px-5 pb-6 flex flex-col gap-6 font-sans">
                  {/* Header */}
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Alex Carter</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Senior Designer at RIFELO
                    </p>
                  </div>
                  
                  {/* Bio */}
                  <div className="space-y-2">
                    <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-wider">About</h2>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">I create seamless digital experiences bridging physical and virtual worlds. Passionate about minimalist design.</p>
                  </div>
                  
                  {/* Details */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center text-slate-600 bg-white shadow-sm p-3 rounded-xl border border-slate-100">
                      <Briefcase className="w-4 h-4 mr-3 text-slate-400 shrink-0" />
                      <span className="truncate text-[11px] font-medium text-slate-700">RIFELO</span>
                    </div>
                    <div className="flex items-center text-slate-600 bg-white shadow-sm p-3 rounded-xl border border-slate-100">
                      <Mail className="w-4 h-4 mr-3 text-slate-400 shrink-0" />
                      <span className="truncate text-[11px] font-medium text-slate-700">alex@rifelo.com</span>
                    </div>
                  </div>
                  
                  {/* Links */}
                  <div className="space-y-2">
                    <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-wider">Platforms & Links</h2>
                    <div className="space-y-2">
                      {/* Link 1 */}
                      <div className="flex items-center justify-between p-3 bg-white shadow-sm border border-slate-100 rounded-xl">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mr-3 text-[#E1306C]">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.88z"/>
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-[11px]">Instagram</span>
                            <span className="text-[9px] text-slate-500">@alexcarter</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                      </div>
                      
                      {/* Link 2 */}
                      <div className="flex items-center justify-between p-3 bg-white shadow-sm border border-slate-100 rounded-xl">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mr-3 text-[#0077b5]">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-[11px]">LinkedIn</span>
                            <span className="text-[9px] text-slate-500">Alex Carter</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                      </div>
                      
                      {/* Link 3 */}
                      <div className="flex items-center justify-between p-3 bg-white shadow-sm border border-slate-100 rounded-xl">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mr-3 text-slate-600">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-[11px]">Portfolio</span>
                            <span className="text-[9px] text-slate-500">alexcarter.design</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
                  <img 
                    src="https://i.ibb.co.com/20WNbGMp/favicon-192x192.png" 
                    alt="rifelo Logo" 
                    className="w-full h-full object-contain"
                   referrerPolicy="no-referrer" />
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
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
              {globalLinks.length > 0 ? (
                globalLinks.filter(l => l.is_visible !== false).map((link) => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-[#0c0e0b] transition-colors"
                  >
                    {link.title}
                  </a>
                ))
              ) : (
                <>
                  <Link href="#" className="hover:text-[#0c0e0b] transition-colors">Twitter (X)</Link>
                  <Link href="#" className="hover:text-[#0c0e0b] transition-colors">Instagram</Link>
                  <Link href="#" className="hover:text-[#0c0e0b] transition-colors">LinkedIn</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
