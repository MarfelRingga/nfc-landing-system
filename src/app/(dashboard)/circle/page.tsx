'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Trash2, Save, Sparkles,
  Globe, RefreshCw, Palette,
  Copy, ChevronDown, Search, AlertCircle, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

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

export default function CircleManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'identity' | 'roster' | 'vault'>('identity');
  
  useEffect(() => {
    const savedTab = localStorage.getItem('circleActiveTab');
    if (savedTab && (savedTab === 'identity' || savedTab === 'roster' || savedTab === 'vault')) {
      setActiveTab(savedTab as any);
    }
  }, []);

  const handleTabChange = (tab: 'identity' | 'roster' | 'vault') => {
    setActiveTab(tab);
    localStorage.setItem('circleActiveTab', tab);
  };
  const [activeCircle, setActiveCircle] = useState<any>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Identity State
  const [circleName, setCircleName] = useState('');
  const [circleDescription, setCircleDescription] = useState('');
  const [resonanceColor, setResonanceColor] = useState('#a299af');
  const [myColor, setMyColor] = useState('#a299af');
  
  // Roster State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [origin, setOrigin] = useState('');
  
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Dropdown States
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);
  const [openMemberRoleDropdown, setOpenMemberRoleDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleWorkspaceChange = () => {
      setActiveWorkspaceId(localStorage.getItem('activeWorkspaceId'));
    };
    handleWorkspaceChange();
    window.addEventListener('workspace-changed', handleWorkspaceChange);
    return () => window.removeEventListener('workspace-changed', handleWorkspaceChange);
  }, []);

  useEffect(() => {
    const fetchCircleData = async () => {
      if (!activeWorkspaceId || activeWorkspaceId === 'personal' || activeWorkspaceId === 'admin') {
        if (activeWorkspaceId) router.push('/profile');
        return;
      }
      
      setIsLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (sessionError.message.includes('Refresh Token Not Found') || sessionError.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
            router.push('/login');
            return;
          }
        }
        if (session) {
          setCurrentUser(session.user);
        }

        console.log('Fetching circle data for workspace:', activeWorkspaceId);
        // Fetch circle details
        const { data: circleData, error: circleError } = await supabase
          .from('circles')
          .select('*')
          .eq('id', activeWorkspaceId)
          .single();

        if (circleError) throw circleError;
        setActiveCircle(circleData);
        setCircleName(circleData.name);
        
        // Parse branding from description
        if (circleData.description?.startsWith('{')) {
          try {
            const parsed = JSON.parse(circleData.description);
            setCircleDescription(parsed.originalDescription || '');
            setResonanceColor(parsed.resonanceColor || '#a299af');
          } catch (e) {
            setCircleDescription(circleData.description);
          }
        } else {
          setCircleDescription(circleData.description || '');
        }

        // Fetch members
        let memberData: any = null;
        let memberError: any = null;
        
        const { data: dataWithColor, error: errorWithColor } = await supabase
          .from('circle_members')
          .select(`
            id,
            role,
            color,
            profile_id,
            profiles (
              id,
              full_name,
              username
            )
          `)
          .eq('circle_id', activeWorkspaceId);

        if (errorWithColor && errorWithColor.message.includes('color')) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('circle_members')
            .select(`
              id,
              role,
              profile_id,
              profiles (
                id,
                full_name,
                username
              )
            `)
            .eq('circle_id', activeWorkspaceId);
          memberData = fallbackData;
          memberError = fallbackError;
        } else {
          memberData = dataWithColor;
          memberError = errorWithColor;
        }
          
        if (memberError) {
          console.error('Error fetching members:', memberError);
        }
        console.log('Fetched members raw data:', memberData);
        setMembers(memberData || []);
        
        if (memberData && session?.user) {
          const me = memberData.find((m: any) => m.profile_id === session.user.id);
          if (me && me.color) {
            setMyColor(me.color);
          }
        }

      } catch (error) {
        console.error('Error fetching circle data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCircleData();

    // Subscribe to real-time updates for members
    const channel = supabase
      .channel(`circle-members-${activeWorkspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circle_members',
          filter: `circle_id=eq.${activeWorkspaceId}`
        },
        () => {
          // Re-fetch members on any change
          const fetchMembers = async () => {
            let memberData: any = null;
            let memberError: any = null;
            
            const { data: dataWithColor, error: errorWithColor } = await supabase
              .from('circle_members')
              .select(`
                id,
                role,
                color,
                profile_id,
                profiles (
                  id,
                  full_name,
                  username
                )
              `)
              .eq('circle_id', activeWorkspaceId);

            if (errorWithColor && errorWithColor.message.includes('color')) {
              const { data: fallbackData, error: fallbackError } = await supabase
                .from('circle_members')
                .select(`
                  id,
                  role,
                  profile_id,
                  profiles (
                    id,
                    full_name,
                    username
                  )
                `)
                .eq('circle_id', activeWorkspaceId);
              memberData = fallbackData;
              memberError = fallbackError;
            } else {
              memberData = dataWithColor;
              memberError = errorWithColor;
            }
            
            if (memberError) {
              console.error('Real-time fetch error:', memberError);
            }
            if (memberData) {
              setMembers(memberData);
              if (currentUser) {
                const me = memberData.find((m: any) => m.profile_id === currentUser.id);
                if (me && me.color) {
                  setMyColor(me.color);
                }
              }
            }
          };
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeWorkspaceId, router]);

  const handleSaveIdentity = async () => {
    if (!activeCircle) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      const brandingData = {
        originalDescription: circleDescription,
        resonanceColor
      };
      
      const { error } = await supabase
        .from('circles')
        .update({
          name: circleName,
          description: JSON.stringify(brandingData)
        })
        .eq('id', activeCircle.id);
        
      if (error) throw error;
      
      if (currentUser) {
        const { error: memberError } = await supabase
          .from('circle_members')
          .update({ color: myColor })
          .eq('circle_id', activeCircle.id)
          .eq('profile_id', currentUser.id);
          
        if (memberError) {
          console.error('Error saving member color:', memberError);
          // Don't throw here, as the main circle update succeeded
          // This might fail if the user hasn't run the SQL migration yet
        }
      }
      
      // Update local state
      setActiveCircle({
        ...activeCircle,
        name: circleName,
        description: JSON.stringify(brandingData)
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error: any) {
      console.error('Error saving identity:', error);
      setSaveError(error.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!activeCircle) return;
    
    setIsSaving(true);
    try {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase
        .from('circles')
        .update({ invite_code: newCode })
        .eq('id', activeCircle.id);
        
      if (error) throw error;
      
      setActiveCircle({ ...activeCircle, invite_code: newCode });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error revoking code:', error);
      setSaveError('Failed to revoke invite code.');
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('circle_members')
        .update({ role: newRole })
        .eq('id', memberId);
        
      if (error) throw error;
      
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('id', memberId);
        
      if (error) throw error;
      
      setMembers(members.filter(m => m.id !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member.');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      (member.profiles?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.profiles?.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

if (!activeCircle) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
      <AlertCircle className="w-12 h-12 mb-4 text-slate-300" />
      <p>This space is hidden or unavailable.</p>
    </div>
  );
}

return (
  <div className="max-w-5xl space-y-8 pb-12">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{activeCircle.name}</h1>
        </div>
        <p className="text-sm text-slate-500">Shape your circle's appearance and resonance.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 px-3 py-2 sm:py-1 bg-slate-100 rounded-xl sm:rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">INVITE CODE</span>
            <span className="text-slate-900 text-sm font-mono font-bold tracking-widest">
              {activeCircle.invite_code}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block"></div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeCircle.invite_code);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
              }}
              className="p-1 text-slate-400 hover:text-slate-900 transition-colors rounded-md hover:bg-slate-200"
              title="Copy Code"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleRegenerateCode}
              disabled={isSaving}
              className="p-1 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50 rounded-md hover:bg-slate-200"
              title="Reset Code"
            >
              <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <Link
          href={`/c/${activeCircle.slug || activeCircle.invite_code}`}
          className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          View Resonance
        </Link>
      </div>
    </div>

    {/* Navigation Tabs */}
    <div className="relative inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/50 w-full sm:w-auto min-w-[300px] overflow-hidden">
      {[
        { id: 'identity', label: 'Atmosphere', icon: Palette },
        { id: 'roster', label: 'People', icon: Users }
      ].map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`relative flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-all flex-1 z-10 ${
              isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white shadow-sm rounded-xl"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className="relative z-20 flex items-center">
              <tab.icon className={`w-4 h-4 mr-2 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
              {tab.label}
            </div>
          </button>
        );
      })}
    </div>

    {/* Tab Content */}
    <div className="mt-8">
      {/* IDENTITY TAB */}
      {activeTab === 'identity' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">General Details</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Circle Name</label>
                <textarea 
                  value={circleName}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    if (lines.length <= 3) {
                      setCircleName(e.target.value);
                    }
                  }}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all sm:text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">About</label>
                <textarea 
                  value={circleDescription}
                  onChange={(e) => setCircleDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all sm:text-sm resize-none"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
                <div className="flex flex-row justify-between items-center gap-4 mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Resonance & Aura</h2>
                  <div className="flex items-center gap-3">
                    {saveError && (
                      <span className="flex items-center text-sm text-red-600 font-medium animate-in fade-in slide-in-from-right-4">
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        {saveError}
                      </span>
                    )}
                    {saveSuccess && (
                      <span className="flex items-center text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-right-4">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Saved!
                      </span>
                    )}
                    <button
                      onClick={handleSaveIdentity}
                      disabled={isSaving}
                      className="flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6 flex-1">
                  <div className="max-w-md flex items-center gap-4">
                    <label className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-200/50 cursor-pointer block shadow-sm hover:scale-105 transition-transform relative">
                      <input 
                        type="color" 
                        value={resonanceColor}
                        onChange={(e) => setResonanceColor(e.target.value)}
                        className="w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-0 p-0 absolute top-0 left-0"
                      />
                    </label>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">Circle Resonance</span>
                      <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{resonanceColor}</span>
                    </div>
                  </div>

                  <div className="max-w-md flex items-center gap-4 pt-6 border-t border-slate-100">
                    <label className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-200/50 cursor-pointer block shadow-sm hover:scale-105 transition-transform relative">
                      <input 
                        type="color" 
                        value={myColor}
                        onChange={(e) => setMyColor(e.target.value)}
                        className="w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-0 p-0 absolute top-0 left-0"
                      />
                    </label>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">Personal Aura</span>
                      <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{myColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col items-center justify-center h-full min-h-[300px]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-12 z-50">Resonance Preview</h3>
                
                <div className="relative w-40 h-40 flex items-center justify-center z-10">
                  {/* Base Glow */}
                  <div
                    className="absolute inset-0 rounded-full transition-all duration-700"
                    style={{
                      background: `radial-gradient(circle, ${resonanceColor} 0%, transparent 80%)`,
                      boxShadow: `0 0 80px ${resonanceColor}, inset 0 0 20px rgba(255,255,255,0.1)`
                    }}
                  />
                  
                  {/* Pulse Glow */}
                  <div
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{ boxShadow: `0 0 60px ${resonanceColor}` }}
                  />
                  
                  {/* Orbiting Aura Circle */}
                  <div 
                    className="absolute inset-[-20px] rounded-full"
                    style={{ animation: 'spin 6s linear infinite' }}
                  >
                    <div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg"
                      style={{ 
                        backgroundColor: myColor,
                        boxShadow: `0 0 15px ${myColor}, 0 0 30px ${myColor}`
                      }}
                    />
                  </div>
                  
                  {/* Text Container (No Spin) */}
                  <div className="relative w-full h-full flex items-center justify-center z-20">
                    <CircleNameDisplay name={circleName} isVisible={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ROSTER TAB */}
      {activeTab === 'roster' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all sm:text-sm"
              />
            </div>
            <div className="relative">
              <input type="hidden" name="roleFilter" value={roleFilter} />
              <button
                onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
                className="flex items-center justify-between w-full sm:w-40 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all sm:text-sm"
              >
                <span className="capitalize">{roleFilter === 'all' ? 'All Roles' : roleFilter}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
              </button>
              
              {isRoleFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsRoleFilterOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-full sm:w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                    <ul className="flex flex-col">
                      {['all', 'admin', 'member'].map((role) => (
                        <li
                          key={role}
                          onClick={() => {
                            setRoleFilter(role);
                            setIsRoleFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${roleFilter === role ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                        >
                          {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredMembers.map((member) => (
            <tr key={member.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500 font-medium">
                    {member.profiles?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{member.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">@{member.profiles?.username || 'unknown'}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="relative">
                  <input type="hidden" name={`role-${member.id}`} value={member.role} />
                  <button
                    onClick={() => {
                      if (members.find(m => m.profiles?.id === currentUser?.id)?.role === 'Admin') {
                        setOpenMemberRoleDropdown(openMemberRoleDropdown === member.id ? null : member.id);
                      }
                    }}
                    disabled={members.find(m => m.profiles?.id === currentUser?.id)?.role !== 'Admin'}
                    className="flex items-center justify-between w-28 px-2.5 py-1.5 bg-slate-100 border border-transparent rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-slate-900/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{member.role}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
                  </button>
                  
                  {openMemberRoleDropdown === member.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMemberRoleDropdown(null)} />
                      <div className="absolute left-0 top-full mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                        <ul className="flex flex-col">
                          {['Admin', 'Member'].map((role) => (
                            <li
                              key={role}
                              onClick={() => {
                                handleUpdateRole(member.id, role);
                                setOpenMemberRoleDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${member.role === role ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-600'}`}
                            >
                              {role}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                {members.find(m => m.profiles?.id === currentUser?.id)?.role === 'Admin' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {filteredMembers.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                No people found.
              </td>
            </tr>
          )}
        </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
