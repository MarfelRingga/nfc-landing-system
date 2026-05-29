'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useMotionValue, useAnimation, animate } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Database, 
  Cpu, 
  Sparkles,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Briefcase,
  Mail,
  Globe,
  MessageCircle,
  Twitter,
  ListOrdered,
  BarChart3,
  Users,
  Instagram,
  Linkedin,
  Github,
  AtSign,
  Music,
  Link as LinkIcon,
  Zap,
  Smartphone,
  RefreshCw,
  Activity,
  Inbox,
  Radio
} from 'lucide-react';

import { decodeMessageSettings } from '@/lib/messageSettings';
import { getPlatformInfo } from '@/lib/platforms';

function SpecialCustomDirectMockup() {
  const [urlText, setUrlText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fullText = 'rifelo.id/nfcwristband';
    let isMounted = true;
    
    const runCycle = async () => {
      while (isMounted) {
        // Typing
        for (let i = 0; i <= fullText.length; i++) {
          if (!isMounted) return;
          setUrlText(fullText.substring(0, i));
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
        
        // Hold
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        if (!isMounted) return;
        setIsSaved(true);
        
        // Hold saved state
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        if (!isMounted) return;
        setIsSaved(false);
        
        // Backspacing
        for (let i = fullText.length; i >= 0; i--) {
          if (!isMounted) return;
          setUrlText(fullText.substring(0, i));
          await new Promise((resolve) => setTimeout(resolve, 40));
        }
        
        // Hold empty
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    };

    runCycle();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-[85%] max-w-[190px] mx-auto bg-white rounded-lg shadow-md border border-slate-100 p-2.5 relative z-10 select-none text-left">
      <div className="flex justify-between items-center mb-1.5 animate-fade-in">
         <div className="text-[9px] font-bold text-slate-800">Edit Tag</div>
         <div className="w-3.5 h-3.5 rounded-full bg-slate-50 flex items-center justify-center">
            <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
         </div>
      </div>

      <div className="mb-1.5">
         <div className="text-[6.5px] font-medium text-slate-400 mb-0.5">Interaction Mode</div>
         <div className="flex items-center justify-between w-full px-1.5 py-1 rounded-md border border-slate-200 bg-white">
            <span className="text-[7.5px] font-medium text-slate-800 truncate">Custom URL Redirect</span>
            <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400"><polyline points="6 9 12 15 18 9"></polyline></svg>
         </div>
      </div>

      <div className="space-y-1">
         <div>
            <div className="text-[6.5px] font-medium text-slate-400 mb-0.5">Custom URL</div>
            <div className={`w-full px-1.5 py-1 rounded-md border transition-all duration-300 ${isSaved ? 'border-emerald-500/50 bg-emerald-50/40 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]' : 'border-purple-500/50 bg-purple-50/30 shadow-[0_0_0_1px_rgba(168,85,247,0.1)]'} flex items-center overflow-hidden`}>
               <div className="flex items-center min-w-max">
                  <span className={`text-[7.5px] font-medium font-mono transition-colors duration-300 ${isSaved ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {urlText}
                  </span>
                  <motion.div 
                     animate={{ opacity: [1, 0] }}
                     transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                     className={`w-px h-2.5 ml-0.5 ${isSaved ? 'bg-emerald-600' : 'bg-slate-800'}`}
                  />
               </div>
            </div>
         </div>
      </div>
      
      <div className="mt-2.5">
         <motion.div 
            animate={isSaved ? { scale: [1, 0.95, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-full text-white rounded-md py-1 flex items-center justify-center gap-1 shadow-sm transition-all duration-300 ${isSaved ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}`}
         >
            <span className="text-[7.5px] font-bold pb-px">
              {isSaved ? 'Changes Saved' : 'Save Changes'}
            </span>
         </motion.div>
      </div>
    </div>
  );
}

interface PremiumDesignCardProps {
  item: {
    title: string;
    badge: string;
    desc: string;
    img: string;
  };
  index: number;
  activeCarouselSlide: number;
  setActiveCarouselSlide: React.Dispatch<React.SetStateAction<number>>;
  isFront: boolean;
  diff: number;
}

function PremiumDesignCard({ item, index, activeCarouselSlide, setActiveCarouselSlide, isFront, diff }: PremiumDesignCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  const targetZIndex = isFront ? 30 : diff === 1 ? 20 : 10;
  const [zIndexVal, setZIndexVal] = useState(targetZIndex);

  useEffect(() => {
    if (isFront) {
      setZIndexVal(30);
    } else if (diff === 1) {
      setZIndexVal(20);
    } else {
      // Keep z-index higher (e.g., 25) to slide underneath the top card (30) 
      // but stay on top of the middle card (20) during transit, then settle to 10
      setZIndexVal(25);
      const timer = setTimeout(() => {
        setZIndexVal(10);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isFront, diff]);

  const scaleVal = diff === 0 ? 1 : diff === 1 ? 0.94 : 0.88;
  const yVal = diff === 0 ? 0 : diff === 1 ? 16 : 32;

  const handleDragEnd = (event: any, info: any) => {
    if (!isFront) return;
    const swipeOffset = info.offset.x;
    const swipeVelocity = info.velocity.x;

    // Menentukan jika drag melewati batas sehingga digeser
    if (swipeOffset < -60 || swipeVelocity < -200) {
      setActiveCarouselSlide((prev) => (prev + 1) % 3);
    } else if (swipeOffset > 60 || swipeVelocity > 200) {
      setActiveCarouselSlide((prev) => (prev - 1 + 3) % 3);
    }
  };

  return (
    <motion.div
      style={{
        zIndex: zIndexVal,
        x,
        rotate,
        willChange: "transform",
      }}
      animate={{
        scale: scaleVal,
        y: yVal,
        x: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 1,
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={isFront ? 0.8 : 0}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (!isFront) {
          setActiveCarouselSlide(index);
        }
      }}
      className={`absolute inset-0 bg-white rounded-[2.5rem] p-5 shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-[#0c0e0b]/5 flex flex-col items-center group ${isFront ? 'cursor-grab active:cursor-grabbing hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)]' : 'cursor-pointer'}`}
    >
      <div className="w-full aspect-square relative rounded-[1.75rem] overflow-hidden bg-[#F4F3EE]/40 mb-4 flex items-center justify-center border border-black/5 shadow-inner select-none pointer-events-none">
         <Image src={item.img} alt={item.title} fill className={`${item.title === 'Versatile Style' ? 'object-contain p-2' : 'object-cover'} select-none pointer-events-none`} referrerPolicy="no-referrer" />
      </div>
      
      <div className="text-left w-full px-3 pb-1 flex-grow flex flex-col justify-between select-none pointer-events-none">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#a299af]/90 mb-2 block">{item.badge}</span>
          <h3 className="text-lg font-bold tracking-tight text-[#0c0e0b] mb-2">{item.title}</h3>
          <p className="text-xs sm:text-sm text-[#0c0e0b]/70 leading-relaxed font-medium line-clamp-3">{item.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

  const leftXDesktop = useTransform(scrollYProgress, [0, 0.7], [-600, -5]);
  const leftXMobile = useTransform(scrollYProgress, [0, 0.7], [-350, -5]);
  const rightXDesktop = useTransform(scrollYProgress, [0, 0.7], [600, 5]);
  const rightXMobile = useTransform(scrollYProgress, [0, 0.7], [350, 5]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.7 && !isConnected) {
      setIsConnected(true);
    } else if (latest < 0.7 && isConnected) {
      setIsConnected(false);
    }
  });

  const [contactLink, setContactLink] = useState('mailto:support@rifelo.com');
  const [getYoursNowLink, setGetYoursNowLink] = useState('/rifelo');
  const [globalLinks, setGlobalLinks] = useState<{id: string, title: string, url: string, is_visible?: boolean}[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [circleView, setCircleView] = useState<'public' | 'member'>('public');
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [resonanceStatus, setResonanceStatus] = useState<'idle' | 'activating' | 'merged'>('idle');
  const [activeIndexes, setActiveIndexes] = useState<number[]>([0, 1]); // initial 2 members active state
  const [mounted, setMounted] = useState(false);
  const [demoProfile, setDemoProfile] = useState<any>(null);
  const [showDemoMessage, setShowDemoMessage] = useState(true);
  const [demoCircleMembers, setDemoCircleMembers] = useState<any[]>([]);
  
  const [activeCarouselSlide, setActiveCarouselSlide] = useState(0);

  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail })
      });
    } catch (err) {
      console.log('Newsletter subscription api error:', err);
    }
    setSubscribeStatus('success');
  };

  const getDemoMemberName = (index: number) => {
    const defaultNames = ['You', 'Marfel Ringga', 'Sarah Jin', 'Mike Ross', 'Emma DW', 'David Kim'];
    if (demoCircleMembers && demoCircleMembers[index] && demoCircleMembers[index].profiles) {
      if (index === 0) return 'You'; // Always show 'You' for the first dot on demo
      const profile = demoCircleMembers[index].profiles;
      return profile.full_name || profile.username || defaultNames[index];
    }
    return defaultNames[index];
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rifelo",
    "url": "https://rifelo.id",
    "sameAs": [
      "https://instagram.com/rifelo.id"
    ],
    "description": "Rifelo is a dynamic profile platform that lets you share your profile with a single tap using NFC."
  };

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
    setMounted(true);
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

    const fetchDemoProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*, profile_links(*)')
          .ilike('username', 'marfel')
          .maybeSingle();

        if (data) {
          const links = data.profile_links || [];
          links.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
          data.profile_links = links.filter((l: any) => l.is_visible !== false);
          
          const decodedSettings = decodeMessageSettings(data.message_placeholder_name || '');
          setShowDemoMessage(decodedSettings.isEnabled);
          
          setDemoProfile(data);
        }
      } catch (err) {}
    };

    const fetchDemoCircle = async () => {
      try {
        const { data: circle } = await supabase
          .from('circles')
          .select('id')
          .eq('slug', 'rifelo')
          .maybeSingle();
        if (circle?.id) {
          const { data: members } = await supabase
            .from('circle_members')
            .select('profile_id, profiles(full_name, username)')
            .eq('circle_id', circle.id)
            .limit(6);
          if (members && members.length > 0) {
            setDemoCircleMembers(members);
          }
        }
      } catch (err) {}
    };

    fetchSettings();
    fetchDemoProfile();
    fetchDemoCircle();
  }, []);

  // Update carousel center item on mount
  useEffect(() => {
    // IntersectionObserver handles initial state naturally
  }, []);

  useEffect(() => {
    if (isConnected) {
      const timeout = setTimeout(() => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([150, 150, 150]);
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isConnected]);

  // Derived transforms based on mobile state
  const leftX = isMobile ? leftXMobile : leftXDesktop;
  const rightX = isMobile ? rightXMobile : rightXDesktop;

  return (
    <div className="min-h-screen bg-[#F4F3EE] font-sans selection:bg-[#a299af]/30 selection:text-[#0c0e0b] flex flex-col w-full relative">
      {/* 1. Navbar (Minimalist) */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center bg-[#F4F3EE]/60 backdrop-blur-md border-b border-[#0c0e0b]/5">
        <nav className="w-full flex items-center justify-between py-2.5 px-4 md:px-12 max-w-7xl">
          <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-7 h-7 transition-transform group-hover:scale-105">
            <img 
              src="https://i.ibb.co.com/20WNbGMp/favicon-192x192.png" 
              alt="Rifelo Logo" 
              className="w-full h-full object-contain"
             referrerPolicy="no-referrer" />
          </div>
          <span className="font-semibold text-base tracking-tight text-[#0c0e0b]">Rifelo</span>
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
            className="text-sm font-medium px-3 py-1.5 sm:px-4 sm:py-2 bg-[#1A1A1A] text-white rounded-md hover:bg-[#0c0e0b] transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>
      </div>

      {/* 2. Hero Section */}
      <main ref={containerRef} className="relative w-full h-[260vh]">
        <div className="sticky top-0 flex flex-col items-center justify-center overflow-hidden w-full h-[100svh]">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square w-full max-w-[600px] bg-[#a299af]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 relative z-10 w-full flex-1 flex flex-col items-center justify-center">
          
          <div className="relative w-full flex items-center justify-center">
            {/* Center: Text Replaces CTA */}
            <motion.div 
              style={{ opacity: textOpacity, scale: textScale }}
              className="absolute z-50 flex flex-col items-center justify-center text-center w-[90vw] max-w-2xl pointer-events-none"
            >
              <h1 className="font-semibold tracking-tight text-[#0c0e0b] leading-tight flex flex-col items-center justify-center w-full mb-4">
                <span className="text-[28px] min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1 lg:mb-2 text-center">Tap Once.</span>
                <span className="text-[#0c0e0b]/30 text-[26px] min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center">Share Everything.</span>
              </h1>
              
              <p className="text-[#0c0e0b]/60 max-w-lg mx-auto leading-relaxed text-sm sm:text-base font-medium">
                No App Required. Instantly share your dynamic profile, portfolio, and contact info with any smartphone.
              </p>
              
              <p className="text-[10px] text-[#0c0e0b]/30 uppercase tracking-widest font-semibold mt-6">
                Replace business cards. Connect instantly. Stay remembered.
              </p>
            </motion.div>

            {/* Devices Container */}
            <div className="flex flex-row items-center justify-center w-full relative h-[350px] sm:h-[450px]">
              {/* Connection Glow */}
              <AnimatePresence>
                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square w-full max-w-[192px] bg-[#a299af]/30 blur-3xl rounded-full pointer-events-none z-0"
                  />
                )}
              </AnimatePresence>

              {/* Left: NFC Bracelet */}
              <motion.div style={{ x: leftX, willChange: 'transform' }} className="flex-1 flex justify-end items-center pointer-events-none relative z-10 w-1/2">
                <motion.div 
                  animate={{ 
                    scale: isConnected ? 0.97 : 1,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ willChange: 'transform' }}
                  className="relative shrink-0 flex items-center justify-center w-[35vw] max-w-[140px] sm:max-w-[180px] lg:max-w-[200px] aspect-[4/5] pointer-events-auto"
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
              </motion.div>

              {/* Right: Phone Mockup */}
              <motion.div style={{ x: rightX, willChange: 'transform' }} className="flex-1 flex justify-start items-center pointer-events-none relative z-30 w-1/2">
                <motion.div 
                  animate={{ 
                    scale: isConnected ? 1.02 : 1,
                    rotate: isConnected ? [0, -1, 1, -1, 0] : 0
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeInOut",
                  }}
                  style={{ willChange: 'transform' }}
                  className="relative shrink-0 flex items-center justify-center w-[45vw] max-w-[170px] sm:max-w-[240px] lg:max-w-[260px] aspect-[1/2] pointer-events-auto"
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
              </motion.div>
            </div>
          </div>

          {/* Scroll Hint */}
          <div className="py-4 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-[#0c0e0b]/40 hover:text-[#0c0e0b]/70 transition-colors text-[10px] sm:text-xs font-medium tracking-wide uppercase cursor-pointer"
              onClick={() => document.getElementById('circle-demo-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Scroll to explore ↓
            </motion.div>
          </div>
        </div>
      </div>
      </main>

      {/* 2.2 What is Rifelo Section */}
      <section className="pt-8 pb-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-[#0c0e0b]">
            One Identity. Everything Connected.
          </h2>
          <p className="text-[#0c0e0b]/70 leading-relaxed text-sm sm:text-base">
            Rifelo brings your contact info, social links, and portfolio into one dynamic profile. Update it anytime, and share it anywhere — instantly.
          </p>
        </motion.div>
      </section>

      {/* 2.5. Circle Demo Section */}
      <section id="circle-demo-section" className="min-h-screen flex flex-col items-center justify-center py-16 md:py-24 px-4 sm:px-6 md:px-12 w-full relative z-10 bg-[#F4F3EE]">

        {/* View Switcher */}
        <div className="flex bg-white/50 backdrop-blur-md p-[4px] rounded-full relative w-[280px] h-[44px] mb-8 shadow-[0_8px_24px_rgba(12,14,11,0.04)] border border-[#0c0e0b]/10 shrink-0">
          {/* Highlight background */}
          <div 
            className={`absolute top-[4px] bottom-[4px] w-[calc(50%-4px)] bg-white/90 backdrop-blur-sm rounded-full transition-all duration-300 ease-out shadow-sm border border-[#0c0e0b]/5`}
            style={{ left: circleView === 'public' ? '4px' : 'calc(50%)' }}
          />
          <button 
            onClick={() => setCircleView('public')}
            className={`relative z-10 w-1/2 flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all duration-300 ${circleView === 'public' ? 'text-[#0c0e0b]' : 'text-[#0c0e0b]/45 hover:text-[#0c0e0b]'}`}
          >
            Digital identity
          </button>
          <button 
            onClick={() => setCircleView('member')}
            className={`relative z-10 w-1/2 flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all duration-300 ${circleView === 'member' ? 'text-[#0c0e0b]' : 'text-[#0c0e0b]/45 hover:text-[#0c0e0b]'}`}
          >
            Circle
          </button>
        </div>

        {/* Interactive Mockup + Text Container */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 w-full max-w-6xl">
          {/* Interactive Mockup */}
          <div className="relative flex items-center justify-center w-full max-w-[320px] shrink-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#a299af]/20 rounded-full blur-[80px]" />
            <div id="demo-box" className="relative w-full max-w-[320px] aspect-[9/19] bg-white rounded-[2.5rem] p-2 shadow-2xl border-4 border-[#F4F3EE] overflow-hidden scroll-mt-[100px] shrink-0">
              
              <div className="w-full h-full bg-[#0c0e0b] rounded-[2rem] overflow-hidden flex flex-col relative border border-[#aaafbc]/10 hide-scrollbar">
               <AnimatePresence mode="wait">
                 {circleView === 'public' ? (
                   <motion.div
                     key="public"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.3 }}
                     className="flex-1 w-full bg-slate-50 relative flex flex-col overflow-hidden"
                   >
                     {/* Browser Header (Identity Demo) */}
                     <div className="w-full bg-[#f8f9fa] pt-5 pb-2 px-4 flex flex-col items-center shrink-0 relative z-50 border-b border-[#aaafbc]/20">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-4 bg-white rounded-b-xl max-w-[120px] pointer-events-none"></div>
                       <Link href="/u/marfel" className="w-full bg-white hover:bg-slate-50 transition-colors rounded-md py-1 flex items-center justify-center mt-1 border border-[#aaafbc]/10 shadow-sm cursor-pointer">
                         <Lock className="w-2 h-2 text-[#aaafbc] mr-1.5" />
                         <span className="text-[9px] text-[#0c0e0b]/70 font-medium tracking-wide">rifelo.id/u/marfel</span>
                       </Link>
                     </div>
                     
                     {/* Public Profile Lookalike */}
                     <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 font-sans hide-scrollbar w-full relative z-10">
                       <div className="w-full bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-5 space-y-6">
                         {/* Header */}
                         <div className="flex items-center justify-between">
                           <div>
                             <h1 className="text-xl font-bold tracking-tight text-slate-900">{demoProfile?.full_name || 'Marfel Ringga P'}</h1>
                             <p className="text-[11px] text-slate-500 mt-1">
                               {demoProfile?.job_title ? `${demoProfile.job_title} at ${demoProfile.company || 'Rifelo'}` : 'Founder at Rifelo'}
                             </p>
                           </div>
                         </div>
                         
                         {/* Bio */}
                         {demoProfile?.bio !== '' && (
                           <div className="space-y-2">
                             <h2 className="text-[9px] font-semibold text-slate-900 uppercase tracking-wider">About</h2>
                             <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">{demoProfile?.bio || 'Your profile is always ready. Share your name, links, social media, or anything that represents you — all in one simple page. No need to repeat yourself.'}</p>
                           </div>
                         )}

                         {/* Details */}
                         <div className="grid grid-cols-1 gap-2">
                           {demoProfile?.company !== '' && (
                             <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                               <Briefcase className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                               <span className="text-[11px] truncate">{demoProfile?.company || 'Rifelo'}</span>
                             </div>
                           )}
                           {demoProfile?.email !== '' && (
                             <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                               <Mail className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                               <span className="text-[11px] truncate">{demoProfile?.email || 'support@rifelo.com'}</span>
                             </div>
                           )}
                         </div>
                         
                         {/* Links */}
                         <div className="space-y-3">
                           <h2 className="text-[9px] font-semibold text-slate-900 uppercase tracking-wider">Platforms & Links</h2>
                           <div className="space-y-2">
                             {demoProfile?.profile_links && demoProfile.profile_links.length > 0 ? demoProfile.profile_links.map((link: any, idx: number) => {
                               const platformInfo = getPlatformInfo(link.title, link.url);
                               const Icon = platformInfo?.icon || LinkIcon;
                               const iconColor = platformInfo?.color || 'text-slate-600';
                               const displayUrl = platformInfo?.username || link.url.replace(/^https?:\/\//,'');

                               return (
                                 <div key={link.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                   <div className="flex items-center break-all text-ellipsis overflow-hidden">
                                     <div className={`w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center mr-3 shadow-sm shrink-0 ${iconColor}`}>
                                       <Icon className="w-4 h-4" />
                                     </div>
                                     <div className="flex flex-col overflow-hidden">
                                       <span className="font-bold text-slate-900 text-[11px] truncate">{link.title}</span>
                                       <span className="text-[9px] text-slate-500 truncate">{displayUrl}</span>
                                     </div>
                                   </div>
                                   <LinkIcon className="w-3 h-3 text-slate-300 shrink-0 ml-1" />
                                 </div>
                               );
                             }) : (
                               <>
                                 <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                   <div className="flex items-center break-all text-ellipsis overflow-hidden">
                                     <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center mr-3 shadow-sm shrink-0 text-[#E1306C]">
                                       <Instagram className="w-4 h-4" />
                                     </div>
                                     <div className="flex flex-col overflow-hidden">
                                       <span className="font-bold text-slate-900 text-[11px] truncate">Instagram</span>
                                       <span className="text-[9px] text-slate-500 truncate">@rifelo.id</span>
                                     </div>
                                   </div>
                                   <LinkIcon className="w-3 h-3 text-slate-300 shrink-0 ml-1" />
                                 </div>
                                 <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                   <div className="flex items-center break-all text-ellipsis overflow-hidden">
                                     <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center mr-3 shadow-sm shrink-0 text-[#0077B5]">
                                       <Linkedin className="w-4 h-4" />
                                     </div>
                                     <div className="flex flex-col overflow-hidden">
                                       <span className="font-bold text-slate-900 text-[11px] truncate">LinkedIn</span>
                                       <span className="text-[9px] text-slate-500 truncate">in/marfelringga</span>
                                     </div>
                                   </div>
                                   <LinkIcon className="w-3 h-3 text-slate-300 shrink-0 ml-1" />
                                 </div>
                               </>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 ) : (
                   <motion.div
                     key="member"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.3 }}
                     className="flex-1 w-full relative flex flex-col items-center justify-center p-0 bg-[#0c0e0b] overflow-hidden"
                   >
                     {/* Browser Header (Circle Demo) */}
                     <div className="w-full bg-[#1A1A1A] pt-5 pb-2 px-4 flex flex-col items-center shrink-0 relative z-50 border-b border-white/5">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-4 bg-[#0c0e0b] rounded-b-xl max-w-[120px] pointer-events-none"></div>
                       <Link href="/c/rifelo" className="w-full cursor-pointer bg-white/5 hover:bg-white/10 transition-colors rounded-md py-1 flex items-center justify-center mt-1 border border-white/5">
                         <Lock className="w-2 h-2 text-white/40 mr-1.5" />
                         <span className="text-[9px] text-white/60 font-medium tracking-wide">rifelo.id/c/rifelo</span>
                       </Link>
                     </div>

                     <div className="flex-1 w-full relative flex flex-col items-center text-center text-white overflow-y-auto overflow-x-hidden hide-scrollbar pt-6 pb-6">
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
                      <div className="w-full px-4 pt-4 pb-2 flex justify-between items-center z-50 shrink-0">
                        <div className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors cursor-pointer">
                          <ArrowLeft className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Dashboard</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/50">
                            6 / 6 Active
                          </span>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="text-center z-20 mt-6 mb-4 shrink-0">
                        <h1 className="text-xl font-black text-white tracking-widest uppercase mb-1">
                          Rifelo
                        </h1>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest transition-colors duration-1000">
                          {resonanceStatus === 'merged' ? (
                            <span style={{ color: '#a299af', textShadow: `0 0 10px #a299af` }}>
                              Resonance Active
                            </span>
                          ) : resonanceStatus === 'activating' ? (
                            <span className="text-white">Resonating...</span>
                          ) : "Private Live Space"}
                        </p>
                      </div>

                      {/* Visualization Hub */}
                      <div className="relative w-[180px] h-[180px] flex items-center justify-center z-10 shrink-0 mb-6">
                        <motion.div
                          animate={{ 
                            rotate: 360,
                            scale: resonanceStatus === 'merged' ? 1.1 : 1
                          }}
                          transition={{ 
                            rotate: { repeat: Infinity, duration: resonanceStatus === 'merged' ? 8 : 25, ease: "linear" },
                            scale: { duration: 1.5, ease: "easeInOut" }
                          }}
                          style={{ willChange: 'transform' }}
                          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                        >
                          {[0, 1, 2, 3, 4, 5].map((i) => {
                            const angle = (i / 6) * Math.PI * 2;
                            const radius = 64;
                            const x = (Math.cos(angle) * radius).toFixed(2);
                            const y = (Math.sin(angle) * radius).toFixed(2);
                            const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF'];
                            const color = colors[i];
                            const isActive = activeIndexes.includes(i);
                            const memberName = getDemoMemberName(i);
                            
                            return (
                              <div
                                key={i}
                                className={`absolute shadow-lg group transition-all duration-700 pointer-events-auto cursor-help ${resonanceStatus === 'merged' ? 'opacity-0' : (isActive ? 'opacity-100' : 'opacity-30')}`}
                                style={{ 
                                  transform: `translate(${resonanceStatus === 'merged' ? 0 : x}px, ${resonanceStatus === 'merged' ? 0 : y}px) scale(${isActive && resonanceStatus !== 'merged' ? 1.2 : 1})` 
                                }}
                              >
                                <div
                                  className="relative w-4 h-4 rounded-full border border-white/20 transition-all duration-700"
                                  style={{ 
                                    backgroundColor: color, 
                                    boxShadow: isActive && resonanceStatus !== 'merged' ? `0 0 20px ${color}80` : 'none',
                                  }}
                                />
                                {/* Tooltip */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                  <span className="text-[10px] font-bold whitespace-nowrap bg-black/90 px-2 py-1 rounded border border-white/10 text-white shadow-xl">
                                    {memberName}
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
                            className={`absolute w-28 h-28 rounded-full flex items-center justify-center p-4 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/10 ${
                              resonanceStatus === 'merged' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                            }`}
                            style={{
                              background: `radial-gradient(circle, #a299af 0%, transparent 80%)`,
                              boxShadow: `0 0 80px #a299af, inset 0 0 20px rgba(255,255,255,0.1)`
                            }}
                          >
                            <div className="absolute inset-0 rounded-full animate-pulse" style={{ boxShadow: `0 0 60px #a299af` }} />
                          </div>
                          <div className={`font-black text-xs tracking-widest text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] z-40 text-center flex flex-col items-center justify-center leading-tight transition-opacity duration-500 hover:opacity-80`}>
                            Rifelo
                          </div>
                        </div>
                      </div>

                      {/* Minimal Member List */}
                      <div className="w-full flex flex-col items-center gap-2 pb-6 shrink-0 z-20">
                        {[0, 1, 2, 3, 4, 5].map((i) => {
                          const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF'];
                          const isActive = activeIndexes.includes(i);
                          const color = colors[i];
                          const memberName = getDemoMemberName(i);
                          
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
                                {memberName}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Small Resonance CTA */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
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
                    </div>
                   </motion.div>
                 )}
               </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Text Description Container */}
          <div className="text-center lg:text-left max-w-xl flex flex-col items-center lg:items-start px-4 shrink-0">
            <h2 className="font-semibold tracking-tight text-[#0c0e0b] mb-4 leading-tight flex flex-col items-center lg:items-start">
              <span className="text-[22px] min-[400px]:text-2xl sm:text-3xl md:text-4xl">
                {circleView === 'public' ? 'Dynamic Profile' : 'Circle Resonance'}
              </span>
            </h2>
            <p className="text-[#0c0e0b]/70 leading-relaxed text-sm sm:text-base mb-8 lg:mb-10 lg:max-w-md">
              {circleView === 'public' 
                ? 'Your complete professional identity in one scan. Share your contact info, social links, and portfolio with anyone, anywhere — no app required.' 
                : 'Resonance happens when your circle comes alive. Bring everyone in, stay active together, and watch the connection build in real time.'}
            </p>

            {/* Feature Highlights to fill empty vertical space on desktop */}
            <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-md mb-10 lg:mb-12">
              {circleView === 'public' ? (
                <>
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#0c0e0b]/5 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4 text-[#0c0e0b]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0c0e0b] text-sm mb-1">No App Required</h4>
                      <p className="text-xs text-[#0c0e0b]/60 leading-relaxed">Works instantly with any modern smartphone using NFC technology. Just tap and share.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#0c0e0b]/5 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4 text-[#0c0e0b]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0c0e0b] text-sm mb-1">Real-Time Updates</h4>
                      <p className="text-xs text-[#0c0e0b]/60 leading-relaxed">Change your contact info, portfolio, or social links anytime. Your wristband updates instantly.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#0c0e0b]/5 flex items-center justify-center shrink-0">
                      <Inbox className="w-4 h-4 text-[#0c0e0b]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0c0e0b] text-sm mb-1">Direct Inbox</h4>
                      <p className="text-xs text-[#0c0e0b]/60 leading-relaxed">Receive messages straight to your profile. Keep your personal contact details private and secure.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#0c0e0b]/5 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-[#0c0e0b]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0c0e0b] text-sm mb-1">Instant Group Sync</h4>
                      <p className="text-xs text-[#0c0e0b]/60 leading-relaxed">Connect multiple wristbands simultaneously. Create a unified digital presence for your circle.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#0c0e0b]/5 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-[#0c0e0b]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0c0e0b] text-sm mb-1">Live Activity</h4>
                      <p className="text-xs text-[#0c0e0b]/60 leading-relaxed">Watch connections build as members interact. Perfect for community events and networking.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#0c0e0b]/5 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4 text-[#0c0e0b]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0c0e0b] text-sm mb-1">Real-Time Resonance</h4>
                      <p className="text-xs text-[#0c0e0b]/60 leading-relaxed">Experience seamless synchronization across all devices when members interact within the circle.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link 
              href="/join-rifelo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-full font-medium hover:bg-[#0c0e0b] transition-all shadow-md active:scale-95 text-sm"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
      </section>

      {/* 2.5 Premium Model Carousel */}
      <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10 overflow-hidden">
        <div className="flex flex-col items-center mb-8 sm:mb-12 md:mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0c0e0b] mb-4"
          >
            Premium by Design.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#0c0e0b]/60 max-w-2xl text-base sm:text-lg leading-relaxed"
          >
            Every detail is designed to provide maximum comfort and a superior look.
          </motion.p>
        </div>

        {/* Desktop View: Grid of Three Cards */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 xl:gap-8 pb-8 items-stretch py-4 max-w-5xl mx-auto w-full">
          {[
            {
              title: "Adjustable & Clean Look",
              badge: "Ergonomic Design",
              desc: "Easily adjustable strap with a hidden locking mechanism, providing a clean silhouette on your wrist.",
              img: "https://i.ibb.co/k2GRG5p7/strap-wristband.png",
            },
            {
              title: "Versatile Style",
              badge: "Timeless Minimalist",
              desc: "A clean, aesthetic, and premium look. Perfectly suited and easily paired with any outfit for any activity.",
              img: "https://i.ibb.co.com/vvsX17bc/wristband.png",
            },
            {
              title: "Smooth & Lightweight",
              badge: "Premium Comfort",
              desc: "Made from premium materials that are incredibly soft and lightweight. Designed for comfortable all-day wear without irritation.",
              img: "https://i.ibb.co/pjs2hJQD/close-up-wristband.png",
            }
          ].map((item, i) => {
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-white/60 backdrop-blur-md rounded-[2.25rem] p-5 xl:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#0c0e0b]/5 hover:border-[#0c0e0b]/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 flex flex-col items-center group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center"
              >
                <div className="w-full aspect-[1.1/1] relative rounded-[1.5rem] overflow-hidden bg-[#F4F3EE]/40 mb-5 flex items-center justify-center border border-black/5 shadow-inner">
                   <Image src={item.img} alt={item.title} fill className={`${item.title === 'Versatile Style' ? 'object-contain p-2 xl:p-3 group-hover:scale-[1.08]' : 'object-cover group-hover:scale-105'} transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]`} referrerPolicy="no-referrer" />
                </div>
                <div className="text-left w-full px-3 xl:px-4 pb-1 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#a299af]/90 mb-2.5 block">{item.badge}</span>
                    <h3 className="text-xl md:text-2xl tracking-tight font-bold text-[#0c0e0b] mb-3 leading-tight">{item.title}</h3>
                    <p className="text-sm md:text-base text-[#0c0e0b]/70 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View: Stack Carousel Layout like Paper Sheets */}
        <div className="lg:hidden relative flex flex-col items-center justify-center py-12 md:py-16 min-h-[520px] md:min-h-[600px]">
          <div className="relative w-[85vw] sm:w-[360px] md:w-[420px] h-[380px] md:h-[460px] flex items-center justify-center">
            {[
              {
                title: "Adjustable & Clean Look",
                badge: "Ergonomic Design",
                desc: "Strap yang mudah disesuaikan dengan mekanisme pengunci tersembunyi, memberikan siluet yang bersih di pergelangan tangan Anda.",
                img: "https://i.ibb.co/k2GRG5p7/strap-wristband.png",
              },
              {
                title: "Versatile Style",
                badge: "Timeless Minimalist",
                desc: "Tampilan yang clean, estetis, dan premium. Sangat cocok dan mudah dipadukan dengan berbagai pilihan outfit untuk aktivitas apapun.",
                img: "https://i.ibb.co.com/vvsX17bc/wristband.png",
              },
              {
                title: "Smooth & Lightweight",
                badge: "Premium Comfort",
                desc: "Terbuat dari bahan premium yang sangat lembut dan ringan. Dirancang agar nyaman dipakai sepanjang hari tanpa iritasi.",
                img: "https://i.ibb.co/pjs2hJQD/close-up-wristband.png",
              }
            ].map((item, i) => {
              const diff = (i - activeCarouselSlide + 3) % 3;
              const isFront = diff === 0;
              
              return (
                <PremiumDesignCard
                  key={i}
                  item={item}
                  index={i}
                  activeCarouselSlide={activeCarouselSlide}
                  setActiveCarouselSlide={setActiveCarouselSlide}
                  isFront={isFront}
                  diff={diff}
                />
              );
            })}
          </div>

          {/* Interactive Stack Indicators and Prompts */}
          <div className="mt-14 flex flex-col items-center gap-4">
            <span className="text-xs font-semibold text-[#0c0e0b]/45 tracking-wider uppercase select-none touch-none">
              SWIPE
            </span>
            
            <div className="flex items-center gap-2.5">
              {[0, 1, 2].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCarouselSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-500 ${activeCarouselSlide === idx ? 'w-8 bg-[#0c0e0b]' : 'w-2.5 bg-[#0c0e0b]/15 hover:bg-[#0c0e0b]/30'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Demo Section (Timeline Flowcard UI) */}
      <section id="demo-section" className="relative py-24 w-full z-10 bg-[#F9F8F6] overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-gradient-to-b from-white/90 to-transparent blur-3xl pointer-events-none opacity-80"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-[#F4F3EE] to-transparent blur-3xl pointer-events-none opacity-50"></div>
         <div className="px-4 sm:px-6 md:px-12 max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center mb-16 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0c0e0b] mb-4"
            >
              Just Tap. That’s It.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[#0c0e0b]/60 max-w-2xl text-base sm:text-lg leading-relaxed"
            >
              Tap your Rifelo NFC tag to any smartphone and instantly open your digital profile. No apps. No friction. Just seamless interaction.
            </motion.p>
          </div>

          {/* Bento Grid Feature Area */}
          <div className="max-w-5xl mx-auto w-full">
            {/* Mobile: Horizontal scroll/carousel, Desktop: Grid */}
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-12 gap-5 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              
              {/* Feature 1: NFC Wristband */}
              <div className="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto md:col-span-1 lg:col-span-4 bg-white border border-[#0c0e0b]/10 rounded-[2rem] p-6 lg:p-7 flex flex-col justify-between min-h-[440px] sm:min-h-[460px] md:min-h-[390px] lg:min-h-[430px] relative overflow-hidden snap-center group hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] hover:border-[#0c0e0b]/20 transition-all duration-300">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                 
                 <div className="flex justify-center items-start mb-4 md:mb-5 relative z-10 text-center">
                     <div className="w-full h-40 sm:h-44 md:h-36 lg:h-40 rounded-3xl overflow-hidden bg-slate-50 border border-black/5 relative group-hover:shadow-inner transition-all duration-500">
                        <Image 
                           src="https://i.ibb.co/pjs2hJQD/close-up-wristband.png"
                           alt="NFC Wristband"
                           fill
                           className="object-cover group-hover:scale-105 transition-transform duration-700"
                           referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60" />
                     </div>
                  </div>
                 <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0c0e0b] mb-1.5">NFC Wristband</h3>
                    <p className="text-[#0c0e0b]/60 leading-relaxed text-sm sm:text-base font-medium">
                      One tap, instant share. Your wristband becomes the fastest way to exchange your identity—no typing, no apps, no friction.
                    </p>
                 </div>
              </div>

              {/* Feature 2: Digital Identity */}
              <div className="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto md:col-span-2 lg:col-span-8 bg-white border border-[#0c0e0b]/10 rounded-[2rem] p-6 lg:p-7 flex flex-col md:flex-row gap-5 sm:gap-6 md:gap-8 justify-between min-h-[440px] sm:min-h-[460px] md:min-h-[390px] lg:min-h-[430px] relative overflow-hidden snap-center group hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] hover:border-[#0c0e0b]/20 transition-all duration-300">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
                 
                 <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
                   <div className="relative z-10 w-full mb-1">
                     <h3 className="text-xl sm:text-2xl font-bold text-[#0c0e0b] mb-1.5">Dynamic Profile</h3>
                     <p className="text-[#0c0e0b]/60 leading-relaxed text-sm sm:text-base font-medium max-w-md mt-2">
                       Create once, update forever. Your profile card reflects who you are—customize links, bio, colors, and contacts in real-time from your dashboard.
                     </p>
                   </div>
                 </div>

                 {/* Image Area - Digital Identity Mockup */}
                 <div className="relative z-10 w-full md:w-[260px] lg:w-[280px] h-52 md:h-auto rounded-3xl overflow-hidden bg-slate-50 flex-shrink-0 border border-black/5 flex items-center justify-center p-3 text-center group-hover:scale-[1.02] transition-transform duration-500">
                     {/* UI Mockup matching the actual Digital Identity */}
                     <div className="w-[85%] max-w-[195px] h-[95%] max-h-full bg-white rounded-xl shadow-[0_4px_10px_-4px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col pt-3 px-3 relative overflow-hidden text-left">
                       {/* Header */}
                       <div className="mb-3">
                         <div className="font-bold text-[11px] tracking-tight text-slate-900 leading-none">Marfel Ringga P</div>
                         <div className="text-[7.5px] text-slate-500 mt-0.5">Founder at Rifelo</div>
                       </div>
                       
                       {/* Contact Details */}
                       <div className="flex flex-col gap-1 mb-2">
                         <div className="flex items-center text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                           <Briefcase className="w-2.5 h-2.5 mr-1 text-slate-400 shrink-0" />
                           <span className="text-[7px] font-medium truncate">Rifelo</span>
                         </div>
                         <div className="flex items-center text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                           <Mail className="w-2.5 h-2.5 mr-1 text-slate-400 shrink-0" />
                           <span className="text-[7px] font-medium truncate flex-1">support@rifelo.com</span>
                         </div>
                       </div>

                       {/* Links */}
                       <div className="flex gap-2">
                         <div className="w-16 h-6 bg-slate-50 border border-slate-100 rounded-md flex items-center px-1.5 shadow-sm">
                           <Instagram className="w-2.5 h-2.5 text-[#E1306C] mr-0.5 shrink-0" />
                           <span className="text-[7px] font-bold text-slate-900 truncate">Instagram</span>
                         </div>
                         <div className="w-16 h-6 bg-slate-50 border border-slate-100 rounded-md flex items-center px-1.5 shadow-sm">
                           <Linkedin className="w-2.5 h-2.5 text-[#0077B5] mr-0.5 shrink-0" />
                           <span className="text-[7px] font-bold text-slate-900 truncate">LinkedIn</span>
                         </div>
                       </div>

                       <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent" />
                     </div>
                 </div>
              </div>

              {/* Feature 3: Privacy First Control */}
              <div className="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto md:col-span-1 lg:col-span-4 bg-white border border-[#0c0e0b]/10 rounded-[2rem] p-6 lg:p-7 flex flex-col justify-between min-h-[440px] sm:min-h-[460px] md:min-h-[390px] lg:min-h-[430px] relative overflow-hidden snap-center group hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] hover:border-[#0c0e0b]/20 transition-all duration-300">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/15 transition-all duration-700"></div>
                 
                 <div className="flex justify-center items-start mb-4 md:mb-5">
                   {/* Image Area - Privacy Shield/Toggle */}
                   <div className="relative z-10 w-full h-40 sm:h-44 md:h-36 lg:h-40 rounded-[1.5rem] overflow-hidden bg-slate-50 border border-black/5 flex items-center justify-center p-3 text-center group-hover:bg-emerald-50/50 transition-colors duration-500">
                     <div className="flex flex-col items-center gap-3 w-full px-4">
                       <div className="w-full bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <motion.div 
                             animate={{ backgroundColor: ["#f1f5f9", "#d1fae5", "#f1f5f9"] }}
                             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", times: [0, 0.5, 1] }}
                             className="w-6 h-6 rounded-full flex items-center justify-center"
                           >
                              <motion.div
                                animate={{ color: ["#64748b", "#059669", "#64748b"] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", times: [0, 0.5, 1] }}
                              >
                               <Lock className="w-3 h-3" />
                              </motion.div>
                           </motion.div>
                           <div className="flex flex-col items-start gap-1">
                             <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
                             {/* Fading element to represent hiding/showing */}
                             <motion.div 
                               animate={{ opacity: [0.1, 1, 0.1] }}
                               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", times: [0, 0.5, 1] }}
                               className="w-16 h-1 bg-slate-400 rounded-full" 
                             />
                           </div>
                         </div>
                         {/* Animated Toggle */}
                         <motion.div 
                           animate={{ backgroundColor: ["#e2e8f0", "#10b981", "#e2e8f0"] }}
                           transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", times: [0, 0.5, 1] }}
                           className="w-8 h-4.5 rounded-full relative p-0.5"
                         >
                           <motion.div 
                             animate={{ x: [0, 14, 0] }}
                             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", times: [0, 0.5, 1] }}
                             className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                           />
                         </motion.div>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="relative z-10">
                   <h3 className="text-xl sm:text-2xl font-bold text-[#0c0e0b] mb-1.5">Privacy First Control</h3>
                   <p className="text-[#0c0e0b]/60 leading-relaxed text-sm sm:text-base font-medium">
                     You decide what's visible. Toggle who sees what—public, private, or circle-exclusive—with zero data leaks.
                   </p>
                 </div>
              </div>
              
              {/* Feature 4: Custom Direct */}
              <div className="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto md:col-span-1 lg:col-span-4 bg-[#0c0e0b] border border-transparent rounded-[2rem] p-6 lg:p-7 flex flex-col justify-between min-h-[445px] sm:min-h-[470px] md:min-h-[400px] lg:min-h-[440px] relative overflow-hidden snap-center group shadow-[0_12px_32px_-4px_rgba(0,0,0,0.2)]">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-amber-500/20 transition-all duration-700"></div>
                 
                 <div className="relative z-10 mb-4 md:mb-5">
                   <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5">Custom Direct</h3>
                   <p className="text-white/70 leading-relaxed text-sm sm:text-base font-medium">
                     Skip the profile, go straight to the point. Redirect users directly to any URL—your latest video, campaign, or portfolio.
                   </p>
                 </div>

                 <div className="flex justify-center items-start mt-1 md:mt-2">
                   {/* Image Area - Custom Direct Mockup from /tags */}
                   <div className="relative z-10 w-full h-40 sm:h-44 md:h-36 lg:h-40 rounded-[1.5rem] overflow-hidden bg-white/5 border border-white/10 flex flex-col justify-center p-3">
                      
                      {/* Mockup of Edit Tag Form */} <SpecialCustomDirectMockup /> <div className="hidden pb-0 select-none pointer-events-none"> {/* */}
                      <div className="w-full max-w-[200px] mx-auto bg-white rounded-xl shadow-lg border border-slate-100 p-3 relative z-10">
                        <div className="flex justify-between items-center mb-2">
                           <div className="text-[10px] font-bold text-slate-800">Edit Tag</div>
                           <div className="w-4 h-4 rounded-full hover:bg-slate-100 flex items-center justify-center">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                           </div>
                        </div>

                        <div className="mb-2">
                           <div className="text-[7px] font-medium text-slate-500 mb-1">Interaction Mode</div>
                           <div className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white">
                              <span className="text-[8px] font-medium text-slate-800 truncate">Custom URL Redirect</span>
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><polyline points="6 9 12 15 18 9"></polyline></svg>
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <div>
                              <div className="text-[7px] font-medium text-slate-500 mb-1">Custom URL</div>
                              <div className="w-full px-2 py-1.5 rounded-lg border border-purple-500/50 bg-purple-50/30 flex items-center shadow-[0_0_0_1px_rgba(168,85,247,0.1)] overflow-hidden">
                                 <div className="flex items-center min-w-max">
                                    <span className="text-[8px] text-slate-800 font-medium font-mono">https://rifelo.com/my-latest-video</span>
                                    <motion.div 
                                       animate={{ opacity: [1, 0] }}
                                       transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                       className="w-px h-3 bg-slate-800 ml-0.5"
                                    ></motion.div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        
                        <div className="mt-3">
                           <div className="w-full bg-slate-900 text-white rounded-lg py-1.5 flex items-center justify-center gap-1 shadow-sm transition-transform hover:scale-95 cursor-default">
                              <span className="text-[8px] font-bold pb-px">Save Changes</span>
                           </div>
                        </div>
                      </div>

                      {/* */} </div> {/* Decoration floating elements */}
                      <div className="absolute rounded-full w-20 h-20 bg-purple-500/20 blur-xl top-0 left-0 group-hover:bg-purple-500/30 transition-colors duration-500 delay-100"></div>
                   </div>
                 </div>
              </div>

              {/* Feature 5: Inbox */}
              <div className="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto md:col-span-1 lg:col-span-4 bg-white border border-[#0c0e0b]/10 rounded-[2rem] p-6 lg:p-7 flex flex-col justify-between min-h-[445px] sm:min-h-[470px] md:min-h-[400px] lg:min-h-[440px] relative overflow-hidden snap-center group hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] hover:border-[#0c0e0b]/20 transition-all duration-300">
                 <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/15 group-hover:scale-110 transition-all duration-700"></div>
                 
                 <div className="flex justify-center items-start mb-4 md:mb-5">
                   {/* Image Area - Inbox Mockup */}
                   <div className="relative z-10 w-full h-52 sm:h-56 md:h-48 lg:h-52 rounded-[1.5rem] overflow-hidden bg-slate-100/50 border border-black/5 flex items-center justify-center flex-col perspective-1000">
                     
                      {/* Custom Inbox Animation */}
                      <div className="relative w-full h-full">
                        {/* 1. Sender View (Leave a Message) */}
                        <motion.div 
                          animate={{ opacity: [1, 1, 0, 0, 1], y: [0, 0, -10, 10, 0] }}
                          transition={{ repeat: Infinity, duration: 6, times: [0, 0.4, 0.45, 0.95, 1], ease: "easeInOut" }}
                          className="absolute inset-0 flex items-center justify-center p-4"
                        >
                          <div className="w-[90%] bg-white border border-slate-200 rounded-2xl p-3 sm:p-3.5 shadow-sm flex flex-col gap-2 sm:gap-2.5 relative">
                            <div>
                              <div className="text-[10px] font-bold text-slate-900 mb-0.5">Leave a Message</div>
                              <div className="text-[8px] text-slate-500">Send a secret message or say hello.</div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {/* Pseudo Name Input */}
                              <div className="w-full h-6 border border-slate-200 rounded-lg bg-slate-50 flex items-center px-2">
                                <div className="w-16 h-1.5 bg-slate-300 rounded-full" />
                              </div>
                              {/* Pseudo Textarea */}
                              <div className="w-full h-12 border border-slate-200 rounded-lg bg-slate-50 p-2 flex flex-col gap-1.5">
                                <div className="w-[80%] h-1.5 bg-slate-300 rounded-full" />
                                <div className="w-[60%] h-1.5 bg-slate-300 rounded-full" />
                              </div>
                              {/* Send Button */}
                              <motion.div 
                                animate={{ scale: [1, 1, 0.95, 1, 1], backgroundColor: ["#0f172a", "#0f172a", "#3b82f6", "#0f172a", "#0f172a"] }}
                                transition={{ repeat: Infinity, duration: 6, times: [0, 0.25, 0.3, 0.35, 1] }}
                                className="w-full h-7 bg-slate-900 rounded-lg flex items-center justify-center gap-1 mt-1 shadow-sm"
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                  <line x1="22" y1="2" x2="11" y2="13"></line>
                                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                                <span className="text-white text-[9px] font-medium">Send Message</span>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>

                        {/* 2. Receiver Inbox View */}
                        <motion.div 
                          animate={{ opacity: [0, 0, 1, 1, 0], y: [10, 10, 0, 0, -10] }}
                          transition={{ repeat: Infinity, duration: 6, times: [0, 0.45, 0.5, 0.9, 1], ease: "easeInOut" }}
                          className="absolute inset-0 flex items-center justify-center flex-col px-4"
                        >
                          {/* Background message card */}
                          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[85%] bg-white border border-slate-200 rounded-2xl p-4 flex flex-col scale-90 opacity-60 z-0">
                             <div className="flex justify-between items-start mb-2">
                               <div className="flex flex-col">
                                 <div className="w-16 h-2 rounded-full bg-slate-200 mb-1" />
                                 <div className="w-10 h-1.5 rounded-full bg-slate-100" />
                               </div>
                               <div className="w-4 h-4 rounded hover:bg-red-50 text-slate-300" />
                             </div>
                             <div className="bg-slate-50 rounded-xl p-2 h-8" />
                          </div>

                          {/* Foreground new message card */}
                          <motion.div 
                            animate={{ y: [0, 0, -15, -15, 0], scale: [0.95, 0.95, 1, 1, 0.95], opacity: [0, 0, 1, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 6, times: [0, 0.45, 0.5, 0.9, 1] }}
                            className="relative w-[90%] bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-4 flex flex-col z-10 shadow-lg mt-4 sm:mt-6"
                          >
                            <div className="flex justify-between items-start mb-2 pr-4 relative">
                              <button className="absolute top-0 right-0 text-slate-300 hover:text-red-500">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </button>
                              <div>
                                <h3 className="font-semibold text-slate-900 text-[10px]">Sarah Jenkins</h3>
                                <div className="flex items-center text-[8px] text-slate-400 mt-0.5">
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                  </svg>
                                  Just now
                                </div>
                              </div>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl text-slate-700 text-[9px] leading-relaxed">
                              Hi! I loved your portfolio. I would like to discuss a potential collaboration...
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>

                   </div>
                 </div>

                 <div className="relative z-10">
                   <h3 className="text-xl sm:text-2xl font-bold text-[#0c0e0b] mb-1.5">Inbox</h3>
                   <p className="text-[#0c0e0b]/60 leading-relaxed text-sm sm:text-base font-medium">
                     Receive messages, inquiries, and connections straight from your digital profile. Centralize your network effortlessly.
                   </p>
                 </div>
              </div>

              {/* Feature 6: Circle Management */}
              <div className="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto md:col-span-2 lg:col-span-12 bg-white border border-[#0c0e0b]/10 rounded-[2rem] p-6 lg:p-7 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 md:gap-8 relative overflow-hidden snap-center group hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] hover:border-[#0c0e0b]/20 transition-all duration-300">
                 <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-700"></div>
                 <div className="flex-1 relative z-10 max-w-2xl">
                   <h3 className="text-xl sm:text-2xl font-bold text-[#0c0e0b] mb-1.5">Circle Management</h3>
                   <p className="text-[#0c0e0b]/60 leading-relaxed text-sm sm:text-base font-medium">
                     Different worlds, one identity. Create circles for work, friends, events—share different versions of you with different people.
                   </p>
                 </div>
                 {/* Image Area - Circle Management Graphic */}
                 <div className="relative z-10 w-full md:w-[340px] h-64 md:h-auto self-stretch rounded-3xl overflow-hidden bg-slate-900 flex-shrink-0 border border-black/5 flex items-center justify-center p-4 text-center group-hover:bg-slate-800 transition-colors duration-500">
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                       {/* Resonance Animation */}
                       <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-28 md:h-28 lg:w-28 lg:h-28 xl:w-28 xl:h-28 flex items-center justify-center mx-auto my-auto mt-4 mb-4">
                          {/* Base Glow */}
                          <div
                            className="absolute inset-0 rounded-full transition-all duration-700"
                            style={{
                              background: `radial-gradient(circle, #a855f7 0%, transparent 80%)`,
                              boxShadow: `0 0 55px #a855f7, inset 0 0 15px rgba(255,255,255,0.1)`
                            }}
                          />
                          
                          {/* Pulse Glow */}
                          <div
                            className="absolute inset-0 rounded-full animate-pulse"
                            style={{ boxShadow: `0 0 45px #a855f7` }}
                          />
                          
                          {/* Orbiting Aura Circle */}
                          <div 
                            className="absolute inset-[-18px] md:inset-[-14px] rounded-full animate-[spin_6s_linear_infinite]"
                          >
                            <div 
                              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg"
                              style={{ 
                                backgroundColor: '#10b981',
                                boxShadow: `0 0 10px #10b981, 0 0 20px #10b981`
                              }}
                            />
                          </div>
                          
                          {/* Text inside the circle */}
                          <div className="relative w-full h-full flex items-center justify-center z-20">
                             <div className="text-white font-bold tracking-widest text-[12px] uppercase">Rifelo</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Use Case Section */}
      <section className="py-28 md:py-40 lg:py-52 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto relative z-10 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[480px] lg:min-h-[560px]">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="text-center flex flex-col items-center justify-center"
        >
          <h2 className="text-[22px] sm:text-3xl md:text-4xl font-semibold mb-6 text-[#0c0e0b]">
            Built for Real-World Interaction.
          </h2>
          <p className="text-[#0c0e0b]/70 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto mb-8">
            From school and communities to business and networking events, Rifelo helps you share who you are without effort. No more missed connections.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link 
              href="/nfcwristband"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#1A1A1A] text-white rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase hover:bg-[#0c0e0b] transition-all shadow-md active:scale-95 border border-[#1A1A1A]"
            >
              Coming Soon
            </Link>
          </motion.div>
        </motion.div>
      </section>






      {/* 4.9 Sand Transition */}
      <div className="w-full h-32 relative pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* 5. Footer (Graphy Inspired Style) */}
      <footer className="relative pt-24 pb-20 px-4 sm:px-6 md:px-12 mt-auto overflow-hidden">
        {/* Giant Background Text */}
        <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 pointer-events-none select-none">
          <span className="text-[25vw] font-bold text-[#0c0e0b]/[0.02] leading-none tracking-tighter">
            RIFELO
          </span>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-[#0c0e0b]/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] p-6 sm:p-10 md:p-16">
            <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-16">
              {/* Brand Section */}
              <div className="max-w-xs w-full">
                <Link href="/" className="flex items-center gap-2 mb-6 group">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-105">
                    <Image 
                      src="https://i.ibb.co.com/20WNbGMp/favicon-192x192.png" 
                      alt="Rifelo Logo" 
                      fill
                      sizes="32px"
                      className="object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-bold text-xl sm:text-2xl tracking-tight text-[#0c0e0b]">Rifelo</span>
                </Link>
                <p className="text-sm text-[#0c0e0b]/50 leading-relaxed font-medium mb-8">
                  Designing the future of intentional connections. Rifelo is an NFC-powered dynamic profile platform for modern networking.
                </p>
                <div className="flex gap-4 sm:gap-5">
                  {[
                    { icon: Instagram, href: "https://instagram.com/rifelo.id", label: "Instagram" },
                    { icon: AtSign, href: "https://threads.net/@rifelo_id", label: "Threads" },
                    { icon: Music, href: "https://tiktok.com/@rifelo_id", label: "TikTok" }
                  ].map((social, i) => (
                    <Link 
                      key={i} 
                      href={social.href} 
                      target="_blank" 
                      title={social.label}
                      className="p-2 rounded-xl bg-[#F4F3EE] text-[#0c0e0b]/40 hover:text-white hover:bg-[#1A1A1A] transition-all duration-300"
                    >
                      <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Links & Newsletter Grid */}
              <div className="flex flex-col sm:flex-row gap-12 lg:gap-24">
                {/* Links Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-10 sm:gap-16">
                  {/* Product */}
                  <div>
                    <h4 className="font-bold text-[#0c0e0b] mb-5 text-sm uppercase tracking-wider">Product</h4>
                    <ul className="space-y-3 text-sm text-[#0c0e0b]/50 font-medium">
                      <li><Link href="/what-is-rifelo" className="hover:text-[#0c0e0b] transition-colors">Features</Link></li>
                      <li><Link href="/rifelo-features" className="hover:text-[#0c0e0b] transition-colors">Pricing</Link></li>
                      <li><Link href="/join-rifelo" className="hover:text-[#0c0e0b] transition-colors">Dynamic Profile</Link></li>
                    </ul>
                  </div>

                  {/* Support & Legal Combined on mobile maybe? No, let's keep it clear */}
                  <div className="space-y-10">
                    <div>
                      <h4 className="font-bold text-[#0c0e0b] mb-5 text-sm uppercase tracking-wider">Support</h4>
                      <ul className="space-y-3 text-sm text-[#0c0e0b]/50 font-medium">
                        <li><Link href="/contact" className="hover:text-[#0c0e0b] transition-colors">Help Center</Link></li>
                        <li><Link href="/contact" className="hover:text-[#0c0e0b] transition-colors">Contact Us</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0c0e0b] mb-5 text-sm uppercase tracking-wider">Legal</h4>
                      <ul className="space-y-3 text-sm text-[#0c0e0b]/50 font-medium">
                        <li><Link href="/privacy" className="hover:text-[#0c0e0b] transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-[#0c0e0b] transition-colors">Terms of Service</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Newsletter Shortcut */}
                <div className="max-w-[280px]">
                   <h4 className="font-bold text-[#0c0e0b] mb-5 text-sm uppercase tracking-wider">Stay Connected</h4>
                   <p className="text-xs text-[#0c0e0b]/50 mb-4 leading-relaxed font-medium">
                     Get the latest updates on NFC features and networking tips.
                   </p>
                   {subscribeStatus === 'success' ? (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="p-4 rounded-xl bg-[#F4F3EE] border border-black/5 flex flex-col items-center text-center gap-1"
                     >
                       <CheckCircle2 className="w-5 h-5 text-green-600 mb-1 animate-bounce" />
                       <span className="text-xs font-bold text-[#0c0e0b]">Subscribed!</span>
                       <span className="text-[10px] text-[#0c0e0b]/50 font-medium leading-normal">
                         Thank you for subscribing to Rifelo updates.
                       </span>
                     </motion.div>
                   ) : (
                     <form onSubmit={handleSubscribe} className="relative group">
                       <input 
                         type="email" 
                         required
                         value={subscribeEmail}
                         onChange={(e) => setSubscribeEmail(e.target.value)}
                         placeholder="Email address" 
                         className="w-full bg-[#F4F3EE] border-0 rounded-xl py-3 pl-4 pr-10 text-xs font-medium focus:ring-2 focus:ring-[#0c0e0b]/10 transition-all outline-none"
                       />
                       <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#1A1A1A] text-white rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                         <ArrowRight className="w-3.5 h-3.5" />
                       </button>
                     </form>
                   )}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-8 border-t border-[#0c0e0b]/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-xs sm:text-sm text-[#0c0e0b]/40 font-medium order-2 sm:order-1">
                © {mounted ? new Date().getFullYear() : '2026'} Rifelo Inc. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-[11px] sm:text-xs font-bold uppercase tracking-widest order-1 sm:order-2">
                <Link href="/privacy" className="text-[#0c0e0b]/30 hover:text-[#0c0e0b] transition-colors">Privacy</Link>
                <Link href="/terms" className="text-[#0c0e0b]/30 hover:text-[#0c0e0b] transition-colors">Terms</Link>
                <div className="w-1 h-1 rounded-full bg-[#0c0e0b]/10 hidden sm:block" />
                <button className="text-[#0c0e0b]/30 hover:text-[#0c0e0b] transition-colors">Cookies</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
