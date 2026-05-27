'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useMotionValue, useAnimation } from 'motion/react';
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
  Link as LinkIcon
} from 'lucide-react';

import { decodeMessageSettings } from '@/lib/messageSettings';
import { getPlatformInfo } from '@/lib/platforms';

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

  const zIndexVal = isFront ? 30 : diff === 1 ? 20 : 10;
  const scaleVal = diff === 0 ? 1 : diff === 1 ? 0.94 : 0.88;
  const yVal = diff === 0 ? 0 : diff === 1 ? 16 : 32;

  const handleDragEnd = (event: any, info: any) => {
    if (!isFront) return;
    const swipeOffset = info.offset.x;
    const swipeVelocity = info.velocity.x;

    // Menentukan jika drag melewati batas sehingga digeser
    if (swipeOffset < -80 || swipeVelocity < -200 || swipeOffset > 80 || swipeVelocity > 200) {
      setActiveCarouselSlide((prev) => (prev + 1) % 3);
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
        scale: { type: "tween", ease: "easeOut", duration: 0.25 },
        y: { type: "tween", ease: "easeOut", duration: 0.25 },
        x: { type: "tween", ease: "easeOut", duration: 0.22 },
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
         <Image src={item.img} alt={item.title} fill className={`${item.title === 'Versatile Style' ? 'object-contain p-6' : 'object-cover'} select-none pointer-events-none`} referrerPolicy="no-referrer" />
      </div>
      
      <div className="text-center w-full px-2 pb-1 flex-grow flex flex-col justify-between select-none pointer-events-none">
        <div>
          <span className="text-[9px] uppercase tracking-widest font-bold text-[#a299af] mb-1 block">{item.badge}</span>
          <h3 className="font-bold text-base text-[#0c0e0b] mb-1.5">{item.title}</h3>
          <p className="text-xs text-[#0c0e0b]/60 leading-relaxed font-medium line-clamp-3">{item.desc}</p>
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
  
  const carouselRef = useRef<HTMLDivElement>(null);
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

  const scrollRAFRef = useRef<number | null>(null);

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    if (scrollRAFRef.current) cancelAnimationFrame(scrollRAFRef.current);
    
    scrollRAFRef.current = requestAnimationFrame(() => {
      if (!carouselRef.current) return;
      const parent = carouselRef.current;
      const parentCenter = parent.scrollLeft + parent.clientWidth / 2;
      let closestIndex = 0;
      let minDistance = Infinity;
      
      Array.from(parent.children).forEach((child, index) => {
        const el = child as HTMLElement;
        const childCenter = el.offsetLeft + el.clientWidth / 2;
        const distance = Math.abs(childCenter - parentCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      setActiveCarouselSlide(prev => prev !== closestIndex ? closestIndex : prev);
    });
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
    "description": "Rifelo is a digital identity platform that lets you share your profile with a single tap using NFC."
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
                No App Required. Instantly share your digital identity, portfolio, and contact info with any smartphone.
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
        <div className="flex bg-white p-[4px] rounded-full relative w-[280px] h-[44px] mb-8 shadow-md border border-[#aaafbc]/20 shrink-0">
          {/* Highlight background */}
          <div 
            className={`absolute top-[4px] bottom-[4px] w-[calc(50%-4px)] bg-[#1A1A1A] rounded-full transition-all duration-300 ease-out shadow-sm`}
            style={{ left: circleView === 'public' ? '4px' : 'calc(50%)' }}
          />
          <button 
            onClick={() => setCircleView('public')}
            className={`relative z-10 w-1/2 flex items-center justify-center text-xs font-semibold transition-colors ${circleView === 'public' ? 'text-white' : 'text-[#0c0e0b]/60 hover:text-[#0c0e0b]'}`}
          >
            Digital identity
          </button>
          <button 
            onClick={() => setCircleView('member')}
            className={`relative z-10 w-1/2 flex items-center justify-center text-xs font-semibold transition-colors ${circleView === 'member' ? 'text-white' : 'text-[#0c0e0b]/60 hover:text-[#0c0e0b]'}`}
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
                {circleView === 'public' ? 'Digital Identity' : 'Circle Resonance'}
              </span>
            </h2>
            <p className="text-[#0c0e0b]/70 leading-relaxed text-sm sm:text-base mb-8">
              {circleView === 'public' 
                ? 'Your complete professional identity in one scan. Share your contact info, social links, and portfolio with anyone, anywhere — no app required.' 
                : 'Resonance happens when your circle comes alive. Bring everyone in, stay active together, and watch the connection build in real time.'}
            </p>
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
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 pb-8 items-stretch py-4">
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
                className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#0c0e0b]/5 hover:border-[#0c0e0b]/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 flex flex-col items-center group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center"
              >
                <div className="w-full aspect-square relative rounded-[1.75rem] overflow-hidden bg-[#F4F3EE]/40 mb-6 flex items-center justify-center border border-black/5 shadow-inner">
                   <Image src={item.img} alt={item.title} fill className={`${item.title === 'Versatile Style' ? 'object-contain p-6 group-hover:scale-105' : 'object-cover group-hover:scale-105'} transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]`} referrerPolicy="no-referrer" />
                </div>
                <div className="text-center w-full px-2 pb-2 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#a299af] mb-2 block">{item.badge}</span>
                    <h3 className="font-bold text-lg text-[#0c0e0b] mb-3">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-[#0c0e0b]/60 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View: Stack Carousel Layout like Paper Sheets */}
        <div className="lg:hidden relative flex flex-col items-center justify-center py-12 min-h-[520px]">
          <div className="relative w-[85vw] sm:w-[320px] h-[380px] flex items-center justify-center">
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
      <section id="demo-section" className="py-24 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto w-full relative z-10">
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

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-4 py-8">
          {/* Card 1: NFC Wristband (col-span-1 md:col-span-5) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 md:col-span-5 bg-white/60 backdrop-blur-md hover:bg-white border border-[#0c0e0b]/5 hover:border-[#0c0e0b]/10 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm hover:shadow-[0_12px_45px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full cursor-default"
          >
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#a299af]/5 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100" />
            
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#F4F3EE] flex items-center justify-center border border-[#0c0e0b]/5 shrink-0">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-[#0c0e0b]" />
                </div>
              </div>
              
              <h3 className="font-bold text-sm sm:text-2xl text-[#0c0e0b] mb-1 sm:mb-3">NFC Wristband</h3>
              <p className="text-[10px] sm:text-sm text-[#0c0e0b]/60 leading-relaxed font-medium mb-4 sm:mb-8 line-clamp-3 xs:line-clamp-none">
                Just tap your premium wristband to any phone and your digital identity is shared instantly. Lightweight, skin-friendly, and always active.
              </p>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-lg sm:rounded-2xl overflow-hidden bg-[#F4F3EE]/40 border border-[#0c0e0b]/5 flex items-center justify-center mt-auto animate-fade-in">
              <Image 
                src="https://i.ibb.co.com/vvsX17bc/wristband.png" 
                alt="NFC Wristband"
                fill
                className="object-contain p-2 sm:p-6 group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Card 2: Dynamic Profile (col-span-1 md:col-span-7) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="col-span-1 md:col-span-7 bg-white/60 backdrop-blur-md hover:bg-white border border-[#0c0e0b]/5 hover:border-[#0c0e0b]/10 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm hover:shadow-[0_12px_45px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full cursor-default"
          >
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#a299af]/5 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#F4F3EE] flex items-center justify-center border border-[#0c0e0b]/5 shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0c0e0b]" />
                  </div>
                </div>
                
                <h3 className="font-bold text-sm sm:text-2xl text-[#0c0e0b] mb-1 sm:mb-3">Dynamic Profile</h3>
                <p className="text-[10px] sm:text-sm text-[#0c0e0b]/60 leading-relaxed font-medium mb-4 sm:mb-8 line-clamp-3 xs:line-clamp-none">
                  A comprehensive, customized visual card loads in seconds. Instantly update social links, bio description, customized tag color profiles, or contact info anytime via your web dashboard.
                </p>
              </div>

              <div className="relative w-full aspect-[16/10] rounded-lg sm:rounded-2xl overflow-hidden bg-[#F4F3EE]/40 border border-[#0c0e0b]/5 flex items-center justify-center mt-auto">
                <Image 
                  src="https://i.ibb.co.com/JRyHX9JW/phone.png" 
                  alt="Dynamic Profile App mockup"
                  fill
                  className="object-contain p-2 sm:p-4 group-hover:scale-[1.03] transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Privacy First (col-span-2 md:col-span-12) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="col-span-1 md:col-span-12 bg-white/60 backdrop-blur-md hover:bg-white border border-[#0c0e0b]/5 hover:border-[#0c0e0b]/10 p-5 sm:p-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm hover:shadow-[0_12px_45px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden flex flex-col md:flex-row items-stretch md:items-center gap-6 sm:gap-8 justify-between cursor-default"
          >
            <div className="absolute top-0 right-0 w-36 h-36 sm:w-48 sm:h-48 bg-[#a299af]/5 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="flex-1 max-w-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#F4F3EE] flex items-center justify-center border border-[#0c0e0b]/5 shrink-0">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#0c0e0b]" />
                </div>
              </div>
              
              <h3 className="font-bold text-base sm:text-2xl text-[#0c0e0b] mb-1.5 sm:mb-3">Privacy First Control</h3>
              <p className="text-xs sm:text-sm text-[#0c0e0b]/60 leading-relaxed font-medium">
                You control exactly what you share, always. Complete safety is built directly into our ecosystem with easy-toggle settings, public/private profile options, and strict token encryption.
              </p>
            </div>

            <div 
              className="relative w-full md:w-56 h-36 md:h-44 rounded-xl sm:rounded-2xl overflow-hidden bg-[#F4F3EE]/40 border border-[#0c0e0b]/5 flex flex-col items-center justify-center shrink-0 mt-2 md:mt-0 select-none cursor-pointer group"
              onClick={() => setIsProfilePublic(!isProfilePublic)}
            >
              <button 
                className={`relative w-24 h-12 rounded-full transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-4 focus:ring-[#0c0e0b]/10 ${isProfilePublic ? 'bg-[#0c0e0b] group-hover:bg-[#1a1a1a]' : 'bg-[#e5e5e5] group-hover:bg-[#d4d4d4]'}`}
              >
                <div className="absolute inset-0 rounded-full shadow-inner opacity-20 pointer-events-none" />
                <div 
                  className="absolute top-1 left-1 bg-white w-10 h-10 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(${isProfilePublic ? 48 : 0}px)` }}
                >
                  {isProfilePublic ? (
                     <Globe className="w-5 h-5 text-[#0c0e0b]" />
                  ) : (
                     <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>
              <span className="mt-5 text-[10px] font-bold text-[#0c0e0b]/40 uppercase tracking-widest transition-colors group-hover:text-[#0c0e0b]/60">
                {isProfilePublic ? 'Public Visibility' : 'Private Mode'}
              </span>
            </div>
          </motion.div>

          {/* Card 4: Queue System (col-span-1 md:col-span-4) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="col-span-1 md:col-span-4 bg-white/60 backdrop-blur-md hover:bg-white border border-[#0c0e0b]/5 hover:border-[#0c0e0b]/10 p-5 sm:p-8 rounded-[1.5rem] shadow-sm hover:shadow-[0_12px_45px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden flex flex-col cursor-default"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#F4F3EE] flex items-center justify-center border border-[#0c0e0b]/5 shrink-0">
                <ListOrdered className="w-4 h-4 sm:w-5 sm:h-5 text-[#0c0e0b]" />
              </div>
            </div>
            <h3 className="font-bold text-base sm:text-xl text-[#0c0e0b] mb-2">Queue System</h3>
            <p className="text-xs sm:text-sm text-[#0c0e0b]/60 leading-relaxed font-medium">
              Manage your connections efficiently. Build smart waiting lists and interactive queues without needing any dedicated hardware.
            </p>
          </motion.div>

          {/* Card 5: Analytics (col-span-1 md:col-span-4) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="col-span-1 md:col-span-4 bg-white/60 backdrop-blur-md hover:bg-white border border-[#0c0e0b]/5 hover:border-[#0c0e0b]/10 p-5 sm:p-8 rounded-[1.5rem] shadow-sm hover:shadow-[0_12px_45px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden flex flex-col cursor-default"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#F4F3EE] flex items-center justify-center border border-[#0c0e0b]/5 shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0c0e0b]" />
              </div>
            </div>
            <h3 className="font-bold text-base sm:text-xl text-[#0c0e0b] mb-2">Analytics Insights</h3>
            <p className="text-xs sm:text-sm text-[#0c0e0b]/60 leading-relaxed font-medium">
              See who's engaging with your profile. Gather actionable insights to understand your network and track everyday connection drops.
            </p>
          </motion.div>

          {/* Card 6: Circle Management (col-span-1 md:col-span-4) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="col-span-1 md:col-span-4 bg-white/60 backdrop-blur-md hover:bg-white border border-[#0c0e0b]/5 hover:border-[#0c0e0b]/10 p-5 sm:p-8 rounded-[1.5rem] shadow-sm hover:shadow-[0_12px_45px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden flex flex-col cursor-default"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#F4F3EE] flex items-center justify-center border border-[#0c0e0b]/5 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#0c0e0b]" />
              </div>
            </div>
            <h3 className="font-bold text-base sm:text-xl text-[#0c0e0b] mb-2">Circle Management</h3>
            <p className="text-xs sm:text-sm text-[#0c0e0b]/60 leading-relaxed font-medium">
              Create specific circles for work, events, or social outings. Curate what different groups see in seconds instantly.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 flex justify-center">
          <Link 
            href={getYoursNowLink}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-[#0c0e0b] transition-all shadow-lg active:scale-95 text-base"
          >
            Order Wristband <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 3.5 Use Case Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="text-center"
        >
          <h2 className="text-[22px] sm:text-3xl md:text-4xl font-semibold mb-6 text-[#0c0e0b]">
            Built for Real-World Interaction.
          </h2>
          <p className="text-[#0c0e0b]/70 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
            From school and communities to business and networking events, Rifelo helps you share who you are without effort. No more missed connections.
          </p>
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
                      className="object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-bold text-xl sm:text-2xl tracking-tight text-[#0c0e0b]">Rifelo</span>
                </Link>
                <p className="text-sm text-[#0c0e0b]/50 leading-relaxed font-medium mb-8">
                  Designing the future of intentional connections. Rifelo is an NFC-powered digital identity platform for modern networking.
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
                      <li><Link href="/join-rifelo" className="hover:text-[#0c0e0b] transition-colors">Digital Identity</Link></li>
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
