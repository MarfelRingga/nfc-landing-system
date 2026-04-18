'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Hash, Briefcase, CheckCircle2 } from 'lucide-react';

interface CircleRealtimeViewProps {
  inviteCode: string;
  slug?: string;
  profileId: string;
  profileName: string;
}

export default function CircleRealtimeView({ inviteCode, slug, profileId, profileName }: CircleRealtimeViewProps) {
  const [status, setStatus] = useState<'loading' | 'invalid' | 'denied' | 'ready'>('loading');
  const [circleData, setCircleData] = useState<{ id: string; name: string } | null>(null);
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [isVisitorMember, setIsVisitorMember] = useState(false);
  const [activeProfileIds, setActiveProfileIds] = useState<string[]>([]);

  // Refs for batching updates
  const pendingVaultUpdates = useRef<any[]>([]);
  const vaultUpdateTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for realtime channels
  const channelsRef = useRef<{ vault: any; roster: any; presence: any }>({ vault: null, roster: null, presence: null });
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRef = useRef<any>(null);

  const fetchVault = useCallback(async (circleId: string) => {
    const { data } = await supabase
      .from('vault_items')
      .select('id, title, content, type, created_at')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false });
    return data || [];
  }, []);

  const fetchRoster = useCallback(async (circleId: string) => {
    const { data } = await supabase
      .from('circle_members')
      .select('id, role, profile_id, profiles!inner(full_name)')
      .eq('circle_id', circleId);
    return data || [];
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeCircle = async () => {
      try {
        // 1. Fetch circle by invite code (First step, needed for ID)
        const { data: circle, error: circleError } = await supabase
          .from('circles')
          .select('id, name')
          .eq('invite_code', inviteCode.toUpperCase())
          .single();

        if (circleError || !circle) {
          if (isMounted) setStatus('invalid');
          return;
        }

        // 2. PARALLEL FETCHING (Remove Waterfall)
        const [
          { data: isProfileMember },
          { data: { session } },
          initialVault,
          initialRoster
        ] = await Promise.all([
          supabase.from('circle_members').select('id').eq('circle_id', circle.id).eq('profile_id', profileId).maybeSingle(),
          supabase.auth.getSession(),
          fetchVault(circle.id),
          fetchRoster(circle.id)
        ]);

        if (!isProfileMember) {
          if (isMounted) setStatus('denied');
          return;
        }

        sessionRef.current = session;

        // 3. Check visitor membership if logged in
        if (session) {
          const { data: visitorMembership } = await supabase
            .from('circle_members')
            .select('id')
            .eq('circle_id', circle.id)
            .eq('profile_id', session.user.id)
            .maybeSingle();
          if (isMounted) setIsVisitorMember(!!visitorMembership);
        }

        if (isMounted) {
          setVaultItems(initialVault);
          setRoster(initialRoster);
          setCircleData(circle);
          setStatus('ready');
        }

        // 4. Setup Realtime Subscriptions
        const setupChannels = () => {
          // Cleanup existing channels
          if (channelsRef.current.vault) supabase.removeChannel(channelsRef.current.vault);
          if (channelsRef.current.roster) supabase.removeChannel(channelsRef.current.roster);
          if (channelsRef.current.presence) supabase.removeChannel(channelsRef.current.presence);

          // Vault Channel with Batching
          channelsRef.current.vault = supabase.channel(`public:vault_items:circle_id=eq.${circle.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vault_items', filter: `circle_id=eq.${circle.id}` }, (payload) => {
              pendingVaultUpdates.current.push(payload);
              
              if (vaultUpdateTimer.current) clearTimeout(vaultUpdateTimer.current);
              
              vaultUpdateTimer.current = setTimeout(() => {
                if (!isMounted) return;
                
                setVaultItems(prev => {
                  let next = [...prev];
                  pendingVaultUpdates.current.forEach(p => {
                    if (p.eventType === 'INSERT') next.push(p.new);
                    else if (p.eventType === 'DELETE') next = next.filter(item => item.id !== p.old.id);
                    else if (p.eventType === 'UPDATE') next = next.map(item => item.id === p.new.id ? p.new : item);
                  });
                  pendingVaultUpdates.current = [];
                  return next.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                });
              }, 200); // 200ms debounce
            })
            .subscribe();

          // Roster Channel
          channelsRef.current.roster = supabase.channel(`public:circle_members:circle_id=eq.${circle.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'circle_members', filter: `circle_id=eq.${circle.id}` }, async () => {
              const updatedRoster = await fetchRoster(circle.id);
              if (isMounted) setRoster(updatedRoster);
            })
            .subscribe();

          // Presence Channel
          channelsRef.current.presence = supabase.channel(`circle_presence_${circle.id}`);
          channelsRef.current.presence
            .on('presence', { event: 'sync' }, () => {
              const state = channelsRef.current.presence.presenceState();
              const activeIds = new Set<string>();
              const now = Date.now();
              
              for (const id in state) {
                state[id].forEach((presence: any) => {
                  // Filter out ghost online (no heartbeat for > 60s)
                  if (presence.profile_id && presence.last_heartbeat && (now - presence.last_heartbeat < 60000)) {
                    activeIds.add(presence.profile_id);
                  }
                });
              }
              if (isMounted) setActiveProfileIds(Array.from(activeIds));
            })
            .subscribe(async (status: string) => {
              if (status === 'SUBSCRIBED' && sessionRef.current) {
                const trackPresence = async () => {
                  await channelsRef.current.presence.track({
                    profile_id: sessionRef.current.user.id,
                    online_at: new Date().toISOString(),
                    last_heartbeat: Date.now()
                  });
                };
                
                await trackPresence();
                
                // Heartbeat every 30 seconds
                if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = setInterval(trackPresence, 30000);
              }
            });
        };

        setupChannels();

        // 5. Handle visibility change to save connection
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'hidden') {
            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
            if (channelsRef.current.presence) channelsRef.current.presence.untrack();
            if (channelsRef.current.vault) supabase.removeChannel(channelsRef.current.vault);
            if (channelsRef.current.roster) supabase.removeChannel(channelsRef.current.roster);
          } else {
            setupChannels();
            // Re-fetch to ensure no missed updates while hidden
            fetchVault(circle.id).then(data => { if (isMounted) setVaultItems(data); });
            fetchRoster(circle.id).then(data => { if (isMounted) setRoster(data); });
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };

      } catch (err) {
        console.error('Error initializing realtime circle:', err);
        if (isMounted) setStatus('invalid');
      }
    };

    initializeCircle();

    return () => {
      isMounted = false;
      if (vaultUpdateTimer.current) clearTimeout(vaultUpdateTimer.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (channelsRef.current.vault) supabase.removeChannel(channelsRef.current.vault);
      if (channelsRef.current.roster) supabase.removeChannel(channelsRef.current.roster);
      if (channelsRef.current.presence) supabase.removeChannel(channelsRef.current.presence);
    };
  }, [inviteCode, profileId, fetchVault, fetchRoster]);

  // Memoize rendered items to stabilize render
  const renderedVaultItems = useMemo(() => vaultItems.map((item) => (
    <div key={item.id} className="p-4 rounded-xl bg-[#F4F3EE]/50 border border-[#aaafbc]/10 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="font-bold text-[#0c0e0b] text-sm mb-1">{item.title}</h3>
      {item.type === 'link' ? (
        <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all">
          {item.content}
        </a>
      ) : (
        <p className="text-xs text-[#aaafbc] whitespace-pre-wrap">{item.content}</p>
      )}
    </div>
  )), [vaultItems]);

  const renderedRoster = useMemo(() => roster.map((member: any) => {
    const isOnline = activeProfileIds.includes(member.profile_id);
    return (
      <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F4F3EE]/50 border border-[#aaafbc]/10 animate-in fade-in">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
          </div>
          <span className="font-medium text-sm text-[#0c0e0b]">{member.profiles?.full_name || 'Unknown'}</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#a299af] bg-white px-2 py-1 rounded-md border border-[#aaafbc]/20">
          {member.role}
        </span>
      </div>
    );
  }), [roster, activeProfileIds]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F4F3EE] font-sans py-12 px-4 flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-8">
          {/* Skeleton Header */}
          <div className="bg-[#0c0e0b] rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
            <div className="animate-pulse flex items-center justify-between mb-4">
              <div className="h-5 w-24 bg-white/20 rounded-md"></div>
              <div className="h-8 w-24 bg-white/20 rounded-xl"></div>
            </div>
            <div className="animate-pulse h-8 w-48 bg-white/20 rounded-md mb-2"></div>
            <div className="animate-pulse h-4 w-64 bg-white/20 rounded-md"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skeleton Vault */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#aaafbc]/20">
              <div className="animate-pulse h-5 w-32 bg-slate-200 rounded-md mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#F4F3EE]/50 border border-[#aaafbc]/10">
                    <div className="animate-pulse h-4 w-3/4 bg-slate-200 rounded-md mb-2"></div>
                    <div className="animate-pulse h-3 w-1/2 bg-slate-200 rounded-md"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skeleton Roster */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#aaafbc]/20">
              <div className="animate-pulse h-5 w-32 bg-slate-200 rounded-md mb-6"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#F4F3EE]/50 border border-[#aaafbc]/10">
                    <div className="animate-pulse h-4 w-32 bg-slate-200 rounded-md"></div>
                    <div className="animate-pulse h-5 w-16 bg-slate-200 rounded-md"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-[#F4F3EE] font-sans py-12 px-4 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#0c0e0b] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0c0e0b]">Invalid Link</h1>
          <p className="text-[#aaafbc]">The circle invite code provided is invalid or inactive.</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="min-h-screen bg-[#F4F3EE] font-sans py-12 px-4 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#0c0e0b] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0c0e0b]">Access Denied</h1>
          <p className="text-[#aaafbc]">{profileName} is not a member of this circle.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F3EE] font-sans py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Hub Header */}
        <div className="bg-[#0c0e0b] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#a299af]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#a299af]">
                  Secure Hub
                </span>
                <span className="ml-2 flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              {(!isVisitorMember || !sessionRef.current) && (
                <a 
                  href={`/c/${slug || inviteCode}`}
                  className="bg-white text-[#0c0e0b] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-[#aaafbc] transition-colors"
                >
                  Join Circle
                </a>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{circleData?.name}</h1>
            <p className="text-[#aaafbc]">Shared resources and roster for this collective. Live updates enabled.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* The Vault */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#aaafbc]/20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0c0e0b] mb-6 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              The Vault
            </h2>
            <div className="space-y-4">
              {renderedVaultItems}
              {vaultItems.length === 0 && (
                <p className="text-xs text-[#aaafbc] text-center py-4">Vault is empty.</p>
              )}
            </div>
          </div>

          {/* The Roster */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#aaafbc]/20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0c0e0b] mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              The Roster
            </h2>
            <div className="space-y-3">
              {renderedRoster}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
