'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, ArrowLeft, RefreshCw, UserPlus, Globe, LogIn, Users, FileText, Zap, X } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useAnimationFrame, animate } from 'motion/react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyAndJoinCircle } from '@/app/actions/circle';

const MEMBER_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', 
  '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55',
  '#00C7BE', '#32ADE6', '#AF52DE', '#FF2D55'
];

const CircleNameDisplay = ({ name, isVisible }: { name: string, isVisible: boolean }) => {
  const lines = (name || 'Untitled').split('\n').slice(0, 3);
  
  // Calculate length to determine font size dynamically
  const maxLineLength = Math.max(...lines.map(l => l.length));
  let textSizeClass = 'text-xl';
  if (maxLineLength > 10 || lines.length === 3) textSizeClass = 'text-base';
  if (maxLineLength > 15) textSizeClass = 'text-sm';
  if (maxLineLength > 20) textSizeClass = 'text-xs';

  return (
    <div className={`font-black ${textSizeClass} tracking-widest text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] relative z-20 transition-opacity duration-500 delay-300 px-2 text-center flex flex-col items-center justify-center leading-tight w-full h-full ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {lines.map((line, idx) => (
        <span key={idx} className="block w-full break-words">
          {line}
        </span>
      ))}
    </div>
  );
};

interface UnifiedCirclePageProps {
  circle: any;
  isMember: boolean;
  userRole: string | null;
  session: any;
  leadProfile: any;
  initialMembers?: any[];
  initialVaultItems?: any[];
}

export default function UnifiedCirclePage({ 
  circle, 
  isMember: initialIsMember, 
  userRole: initialUserRole, 
  session: initialSession,
  leadProfile,
  initialMembers = [],
  initialVaultItems = []
}: UnifiedCirclePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isJoining, setIsJoining] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  
  const [session, setSession] = useState<any>(initialSession);
  const [isMember, setIsMember] = useState<boolean>(initialIsMember);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Visualization State
  const [members, setMembers] = useState<any[]>(initialMembers || []);
  const [activeProfileIds, setActiveProfileIds] = useState<string[]>([]);
  const [phase, setPhase] = useState<'pulsing' | 'rotating' | 'accelerating' | 'merged'>('pulsing');
  
  const rotation = useMotionValue(0);
  const speed = useMotionValue(36);

  const activeCount = members.filter(m => activeProfileIds.includes(m.profile_id)).length;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
          }
          setSession(null);
          setIsMember(false);
          setIsLoadingAuth(false);
          return;
        }

        setSession(currentSession);
        
        if (currentSession) {
        const { data: membership, error: memberError } = await supabase
          .from('circle_members')
          .select('id, role')
          .eq('circle_id', circle.id)
          .eq('profile_id', currentSession.user.id)
          .maybeSingle();
          
        if (membership) {
          setIsMember(true);
          localStorage.setItem('activeWorkspaceId', circle.id);
          window.dispatchEvent(new Event('workspace-changed'));
        } else if (!memberError) {
          setIsMember(false);
          
          // Check for invite code in URL
          const codeFromUrl = searchParams.get('code');
          if (codeFromUrl) {
            handleJoinWithCode(codeFromUrl, currentSession.user.id);
          }
        }
      } else {
        setIsMember(false);
      }
      setIsLoadingAuth(false);
    } catch (err) {
      console.error('Unexpected error during checkAuth:', err);
      await supabase.auth.signOut();
      setSession(null);
      setIsMember(false);
      setIsLoadingAuth(false);
    }
  };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        checkAuth();
      } else {
        setIsMember(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [circle.id]);

  // Parse branding
  let branding = { resonanceColor: '#a299af', originalDescription: '' };
  if (circle.description?.startsWith('{')) {
    try {
      const parsed = JSON.parse(circle.description);
      branding = { ...branding, ...parsed };
    } catch (e) {}
  } else {
    branding.originalDescription = circle.description || '';
  }

  const channelRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!circle.id) return;

    const fetchMembers = async () => {
      let rosterData: any = null;
      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          id,
          role,
          color,
          profile_id,
          last_tapped_at,
          profiles (
            id,
            full_name,
            username
          )
        `)
        .eq('circle_id', circle.id);

      if (error && error.message.includes('color')) {
        const { data: fallbackData } = await supabase
          .from('circle_members')
          .select(`
            id,
            role,
            profile_id,
            last_tapped_at,
            profiles (
              id,
              full_name,
              username
            )
          `)
          .eq('circle_id', circle.id);
        rosterData = fallbackData;
      } else {
        rosterData = data;
      }
      setMembers(rosterData || []);
    };

    // Initial fetch ONLY
    fetchMembers();

    // Update last_tapped_at once for history/fallback
    if (isMember && session?.user?.id) {
      supabase
        .from('circle_members')
        .update({ last_tapped_at: new Date().toISOString() })
        .eq('circle_id', circle.id)
        .eq('profile_id', session.user.id)
        .then();
    }

    // Set up Realtime Channel for Presence and DB Changes
    const setupPresence = () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      
      const channel = supabase.channel(`circle_presence_${circle.id}`);
      channelRef.current = channel;

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const activeIds = new Set<string>();
          const now = Date.now();
          
          for (const id in state) {
            state[id].forEach((presence: any) => {
              // Filter out ghost online (no heartbeat for >30s)
              if (presence.profile_id && presence.last_heartbeat && (now - presence.last_heartbeat < 30000)) {
                activeIds.add(presence.profile_id);
              }
            });
          }
          const idsArray = Array.from(activeIds);
          
          // Avoid redundant renders
          setActiveProfileIds(prev => {
            if (prev.length === idsArray.length && prev.every((v, i) => v === idsArray[i])) return prev;
            return idsArray;
          });
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'circle_members',
            filter: `circle_id=eq.${circle.id}`
          },
          (payload) => {
            // ONLY update local state via payload to prevent infinite fetch API calls
            setMembers((prev) => {
              if (payload.eventType === 'INSERT') {
                if (prev.some((m) => m.id === payload.new.id)) return prev;
                return [...prev, payload.new as any];
              }
              if (payload.eventType === 'UPDATE') {
                return prev.map((m) => m.id === payload.new.id ? { ...m, ...payload.new } : m);
              }
              if (payload.eventType === 'DELETE') {
                return prev.filter((m) => m.id !== payload.old.id);
              }
              return prev;
            });
          }
        )
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED' && isMember && session?.user?.id) {
            const trackPresence = async () => {
              await channel.track({
                profile_id: session.user.id,
                online_at: new Date().toISOString(),
                last_heartbeat: Date.now()
              });
            };
            
            await trackPresence();
            
            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = setInterval(trackPresence, 15000);
          }
        });
    };

    setupPresence();

    // Auto disconnect on tab idle/background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        if (channelRef.current && isMember) channelRef.current.untrack();
      } else {
        // Resume presence safely, DO NOT trigger fetchMembers
        if (channelRef.current?.state === 'joined' && isMember && session?.user?.id) {
          const trackPresence = async () => {
             await channelRef.current.track({
                profile_id: session.user.id,
                last_heartbeat: Date.now()
             });
          };
          trackPresence();
          if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = setInterval(trackPresence, 15000);
        } else {
          setupPresence();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [circle.id, isMember, session?.user?.id]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (members.length > 0) {
      const shouldMerge = activeCount === members.length && members.length > 1;
      
      if (shouldMerge) {
        if (phase === 'rotating') {
          setPhase('accelerating');
        } else if (phase === 'accelerating') {
          timeout = setTimeout(() => {
            setPhase('merged');
          }, 3000);
        } else if (phase === 'pulsing') {
          setPhase('merged');
        }
      } else {
        if (phase === 'accelerating' || phase === 'merged') {
          setPhase('rotating');
        } else if (phase === 'pulsing') {
          setPhase('rotating');
        }
      }
    }
    return () => clearTimeout(timeout);
  }, [members.length, activeCount, phase]);

  useEffect(() => {
    if (phase === 'rotating') {
      animate(speed, 36, { duration: 1, ease: "easeOut" });
    } else if (phase === 'accelerating') {
      animate(speed, 1164, { duration: 3, ease: "easeIn" });
    } else if (phase === 'merged') {
      animate(speed, 18, { duration: 2, ease: "easeOut" });
    }
  }, [phase, speed]);

  useAnimationFrame((t, delta) => {
    rotation.set(rotation.get() + (speed.get() * (delta / 1000)));
  });



  const handleJoinWithCode = async (code: string, userId: string) => {
    setIsJoining(true);
    setJoinError('');
    try {
      const result = await verifyAndJoinCircle(circle.id, userId, code);
      if (result.success) {
        setIsMember(true);
        localStorage.setItem('activeWorkspaceId', circle.id);
        window.dispatchEvent(new Event('workspace-changed'));
        window.location.reload();
      } else {
        setJoinError(result.error || 'Invalid invite code');
      }
    } catch (err) {
      console.error('Error joining circle:', err);
      setJoinError('Failed to join circle. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinClick = () => {
    if (!session) {
      router.push(`/login?redirect=/c/${circle.slug}`);
      return;
    }
    setIsJoinModalOpen(true);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0c0e0b] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW: MEMBER (LOGGED IN AND MEMBER)
  // ---------------------------------------------------------------------------
  if (isMember) {
    return (
      <div className="min-h-screen bg-[#0c0e0b] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
          <Link 
            href="/circle" 
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
              {activeCount} / {members.length} Active
            </span>
          </div>
        </div>

        {/* Visualization Hub */}
        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
          {/* Orbit Balls Container */}
          <motion.div
            style={{ rotate: rotation }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {members.map((member, i) => {
              const angle = (i / members.length) * Math.PI * 2;
              const radius = 100;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const color = member.color || MEMBER_COLORS[i % MEMBER_COLORS.length];
              
              // Check if this specific member is active via presence
              const isActive = activeProfileIds.includes(member.profile_id);
              
              const isMerged = phase === 'merged';

              return (
                <div
                  key={member.id}
                  className={`absolute w-6 h-6 rounded-full shadow-lg group transition-all duration-300 border border-white/10 ${
                    isMerged ? 'opacity-0' : (isActive ? 'opacity-100' : 'opacity-30')
                  }`}
                  style={{ 
                    backgroundColor: color,
                    boxShadow: isActive && !isMerged ? `0 0 15px ${color}80` : 'none',
                    transform: `translate(${isMerged ? 0 : x}px, ${isMerged ? 0 : y}px) scale(${isActive && !isMerged ? 1.2 : 1})`
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <span className="text-[10px] font-bold whitespace-nowrap bg-black/90 px-2 py-1 rounded border border-white/10 text-white">
                      {member.profiles?.full_name || member.profiles?.username}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* The Giant Merged Circle */}
          <div
            className={`absolute w-40 h-40 rounded-full z-10 flex items-center justify-center p-4 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/10 ${
              phase === 'merged' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
            style={{
              background: `radial-gradient(circle, ${branding.resonanceColor} 0%, transparent 80%)`,
              boxShadow: `0 0 80px ${branding.resonanceColor}, inset 0 0 20px rgba(255,255,255,0.1)`
            }}
          >
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                boxShadow: `0 0 60px ${branding.resonanceColor}`
              }}
            />
            <CircleNameDisplay name={circle.name} isVisible={phase === 'merged'} />
          </div>
        </div>

        {/* Bottom Status */}
        <div className="absolute bottom-12 left-0 right-0 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex flex-col items-center"
          >
            <div className="text-xl font-bold tracking-widest uppercase mb-2">
              {(circle.name || 'Untitled').split('\n').slice(0, 3).map((line: string, i: number) => (
                <span key={i} className="block">{line}</span>
              ))}
            </div>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
              {phase === 'merged' ? 'Circle Synchronized' : 
               phase === 'accelerating' ? 'Resonating...' : 'Establishing Connection...'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW: PUBLIC (NOT LOGGED IN OR NOT A MEMBER)
  // ---------------------------------------------------------------------------
  const publicActiveCount = members.filter(m => activeProfileIds.includes(m.profile_id)).length;
  const isResonanceActive = phase === 'merged';

  return (
    <div className="min-h-screen bg-[#0c0e0b] flex flex-col items-center justify-center py-12 px-4 sm:px-6 font-sans relative overflow-hidden">
      {/* Resonance Glow Background */}
      <AnimatePresence>
        {isResonanceActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div 
              className="w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
              style={{ backgroundColor: branding.resonanceColor || '#ffffff' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-widest uppercase mb-2">
            {circle.name}
          </h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest transition-colors duration-1000">
            {phase === 'merged' ? (
              <span style={{ color: branding.resonanceColor || '#ffffff', textShadow: `0 0 10px ${branding.resonanceColor || '#ffffff'}` }}>
                Resonance Active
              </span>
            ) : phase === 'accelerating' ? (
              <span className="text-white">Resonating...</span>
            ) : "Private Live Space"}
          </p>
        </div>

        {/* Circular Presence Visual */}
        <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-16">
          {/* Center Circle Name & Giant Merged Circle */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div
              className={`absolute w-40 h-40 rounded-full flex items-center justify-center p-4 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/10 ${
                phase === 'merged' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
              style={{
                background: `radial-gradient(circle, ${branding.resonanceColor} 0%, transparent 80%)`,
                boxShadow: `0 0 80px ${branding.resonanceColor}, inset 0 0 20px rgba(255,255,255,0.1)`
              }}
            >
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  boxShadow: `0 0 60px ${branding.resonanceColor}`
                }}
              />
            </div>
            <CircleNameDisplay name={circle.name} isVisible={true} />
          </div>

          <motion.div
            style={{ rotate: rotation }}
            animate={{ 
              scale: phase === 'merged' ? 1.1 : 1
            }}
            transition={{
              scale: { duration: 2, ease: "easeInOut" }
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {members.map((member, i) => {
              const angle = (i / members.length) * Math.PI * 2;
              const radius = 100;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const color = member.color || MEMBER_COLORS[i % MEMBER_COLORS.length];
              const isActive = activeProfileIds.includes(member.profile_id);

              const isMerged = phase === 'merged';

              return (
                <div
                  key={member.id}
                  className={`absolute transition-all duration-700 ${isMerged ? 'opacity-0' : 'opacity-100'}`}
                  style={{ 
                    transform: `translate(${isMerged ? 0 : x}px, ${isMerged ? 0 : y}px)`
                  }}
                >
                  {/* Light Trail when Resonance is Active */}
                  {isResonanceActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 0.8, scale: 1.5 }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                      className="absolute inset-0 rounded-full blur-[8px]"
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
                    className="relative w-4 h-4 rounded-full border border-white/20"
                    style={{ 
                      backgroundColor: color,
                      boxShadow: isActive ? `0 0 20px ${color}` : 'none',
                    }}
                  />
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Minimal Member List */}
        <div className="w-full flex flex-col items-center gap-4 mb-16">
          {members.map((member) => {
            const isActive = activeProfileIds.includes(member.profile_id);
            const color = member.color || '#ffffff';
            return (
              <div key={member.id} className="flex items-center gap-3">
                <div 
                  className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: isActive ? color : 'rgba(255,255,255,0.15)',
                    boxShadow: isActive ? `0 0 8px ${color}` : 'none'
                  }}
                />
                <span className={`text-xs font-medium tracking-widest uppercase transition-colors duration-500 ${isActive ? 'text-white/90' : 'text-white/30'}`}>
                  {member.profiles?.full_name || member.profiles?.username || 'Unknown'}
                </span>
              </div>
            );
          })}
          {members.length === 0 && (
            <span className="text-xs font-medium tracking-widest uppercase text-white/30">
              No members yet
            </span>
          )}
        </div>

        {/* Context Text */}
        <p className="text-[10px] text-white/20 font-medium tracking-widest uppercase mb-8">
          You are viewing this circle
        </p>
      </div>
    </div>
  );
}
