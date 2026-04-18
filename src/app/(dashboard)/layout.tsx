'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ScanLine, 
  Camera, 
  CalendarDays,
  LogOut,
  ChevronDown,
  Building2,
  User,
  Ticket,
  Plus,
  X,
  CircleDot,
  RefreshCw,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { supabase } from '@/lib/supabase';

type WorkspaceRole = 'personal' | 'circle' | 'admin';

type Workspace = {
  id: string;
  type: WorkspaceRole;
  name: string;
  subtitle: string;
  inviteCode?: string;
  slug?: string;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Default state: Only Personal Account exists
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'personal', type: 'personal', name: 'Personal Account', subtitle: 'My Account' }
  ]);
  const [isWorkspacesLoaded, setIsWorkspacesLoaded] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
          }
          router.push('/login');
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
        
        // Ensure profile exists in profiles table
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (!profileData) {
          // Create profile if it doesn't exist (e.g. if trigger failed)
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 'User',
              username: session.user.user_metadata?.username || `user_${session.user.id.slice(0, 5)}`,
              phone: session.user.phone
            })
            .select()
            .single();
          
          if (!createError) {
            profileData = newProfile;
          }
        }
        
        if (profileData) {
          setProfile(profileData);
          
          const fetchJoinedCircles = async () => {
            const { data: joinedCircles } = await supabase
              .from('circle_members')
              .select('circle_id, role, circles(id, name, description, invite_code, slug)')
              .eq('profile_id', session.user.id);

            setWorkspaces(prev => {
              const baseWorkspaces = prev.filter(w => w.type === 'personal');
              const adminWorkspaces = profileData.is_admin ? [{ id: 'admin', type: 'admin' as WorkspaceRole, name: 'Admin Dashboard', subtitle: 'System Management' }] : [];
              
              const circleWorkspaces = (joinedCircles || [])
                .filter((jc: any) => jc.circles) // Ensure circle exists
                .map((jc: any) => ({
                  id: jc.circles.id,
                  type: 'circle' as WorkspaceRole,
                  name: jc.circles.name,
                  subtitle: jc.role || 'Member',
                  inviteCode: jc.circles.invite_code,
                  slug: jc.circles.slug
                }));
              
              return [...baseWorkspaces, ...adminWorkspaces, ...circleWorkspaces];
            });
            setIsWorkspacesLoaded(true);
            setIsLoading(false);
          };

          fetchJoinedCircles();

          // Subscribe to membership changes
          const channel = supabase
            .channel(`user-memberships-${session.user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'circle_members',
                filter: `profile_id=eq.${session.user.id}`
              },
              () => {
                fetchJoinedCircles();
              }
            )
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
        } else {
          setIsLoading(false);
        }
      } else {
        router.push('/login');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Unexpected error during checkUser:', err);
      await supabase.auth.signOut();
      router.push('/login');
      setIsLoading(false);
    }
  };

  checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);
  
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('personal');
  const [isWorkspaceLoaded, setIsWorkspaceLoaded] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('activeWorkspaceId');
    if (saved) setActiveWorkspaceId(saved);
    setIsWorkspaceLoaded(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activeWorkspaceId' && e.newValue) {
        setActiveWorkspaceId(e.newValue);
      }
    };
    
    // Also listen to custom event for same-tab changes
    const handleCustomChange = () => {
      const saved = localStorage.getItem('activeWorkspaceId');
      if (saved) setActiveWorkspaceId(saved);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('workspace-changed', handleCustomChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('workspace-changed', handleCustomChange);
    };
  }, []);

  const handleWorkspaceChange = (id: string) => {
    setActiveWorkspaceId(id);
    localStorage.setItem('activeWorkspaceId', id);
    setIsWorkspaceMenuOpen(false);
    window.dispatchEvent(new Event('workspace-changed'));
    
    // Load last path for this workspace or use default
    const lastPath = localStorage.getItem(`lastPath_${id}`);
    const ws = workspaces.find(w => w.id === id);
    
    if (lastPath) {
      router.push(lastPath);
    } else {
      // Auto-navigate based on workspace type if no last path
      if (ws?.type === 'circle') router.push(`/c/${ws.slug || ws.inviteCode}`);
      else if (ws?.type === 'admin') router.push('/admin/users');
      else if (ws?.type === 'personal') router.push('/profile');
    }
  };

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  // Define menu items based on the active workspace
  const getMenuItems = () => {
    switch (activeWorkspace.type) {
      case 'circle':
        return [
          { name: 'Circle Hub', href: `/c/${activeWorkspace.slug || activeWorkspace.inviteCode}`, icon: Sparkles, show: true },
          { name: 'Circle Management', href: '/circle', icon: CircleDot, show: true },
          { name: 'NFC Tags', href: '/tags', icon: ScanLine, show: true },
          { name: 'Settings', href: '/settings', icon: Settings, show: true },
        ];
      case 'admin':
        return [
          { name: 'Users', href: '/admin/users', icon: Users, show: true },
          { name: 'NFC Tags', href: '/admin/tags', icon: ScanLine, show: true },
          { name: 'Circles', href: '/admin/circles', icon: CircleDot, show: true },
          { name: 'System Settings', href: '/admin/settings', icon: Settings, show: true },
        ];
      case 'personal':
      default:
        return [
          { name: 'My Digital ID', href: '/profile', icon: User, show: true },
          { name: 'Inbox', href: '/inbox', icon: MessageSquare, show: true },
          { name: 'NFC Tags', href: '/tags', icon: ScanLine, show: true },
          { name: 'Settings', href: '/settings', icon: Settings, show: true },
        ];
    }
  };

  const menuItems = getMenuItems();

  useEffect(() => {
    if (isWorkspaceLoaded && activeWorkspaceId && pathname) {
      // Don't save paths that are not part of the dashboard menu (like login)
      const isDashboardPath = menuItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));
      if (isDashboardPath) {
        localStorage.setItem(`lastPath_${activeWorkspaceId}`, pathname);
      }
    }
  }, [pathname, activeWorkspaceId, isWorkspaceLoaded, menuItems]);

  useEffect(() => {
    if (isWorkspaceLoaded && isWorkspacesLoaded && workspaces.length > 0) {
      // Check if the current workspace actually exists in the loaded workspaces
      const workspaceExists = workspaces.some(w => w.id === activeWorkspaceId);
      
      // If the saved workspace doesn't exist (e.g., user was removed from circle), fallback to personal
      if (!workspaceExists && activeWorkspaceId !== 'personal') {
        setActiveWorkspaceId('personal');
        localStorage.setItem('activeWorkspaceId', 'personal');
        router.push('/profile');
        return;
      }

      const isValidPath = menuItems.some(item => {
        if (item.href === '/') return pathname === '/';
        return pathname === item.href || pathname.startsWith(item.href + '/');
      });
      
      if (!isValidPath) {
        router.push(menuItems[0].href);
      }
    }
  }, [activeWorkspaceId, pathname, workspaces, isWorkspaceLoaded, isWorkspacesLoaded]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.toUpperCase().trim();
    console.log('Joining workspace with code:', code);
    setIsLoading(true);
    
    try {
      // Dynamic Circle Join
      const { data: circle, error: circleError } = await supabase
        .from('circles')
        .select('*')
        .eq('invite_code', code)
        .maybeSingle();
        
      console.log('Circle found:', circle);
      if (circleError) console.error('Circle error:', circleError);
      if (!circle) {
        setErrorMessage('Invalid invite code. Circle not found.');
        setIsLoading(false);
        return;
      }
      
      // Join circle
      if (user) {
        console.log('Joining circle:', circle.id, 'for user:', user.id);
        const { error: joinError } = await supabase
          .from('circle_members')
          .upsert({ 
            circle_id: circle.id, 
            profile_id: user.id,
            role: 'Member'
          }, { onConflict: 'circle_id,profile_id' });
          
        if (joinError) {
          console.error('Join error:', joinError);
          throw joinError;
        }
        console.log('Successfully joined circle');
      } else {
        console.warn('No user found, cannot join circle');
      }
      
      const newWs: Workspace = { 
        id: circle.id, 
        type: 'circle', 
        name: circle.name, 
        subtitle: 'Member',
        inviteCode: circle.invite_code,
        slug: circle.slug
      };
      setWorkspaces(prev => {
        if (!prev.find(w => w.id === newWs.id)) return [...prev, newWs];
        return prev;
      });
      
      handleWorkspaceChange(circle.id);
      window.dispatchEvent(new Event('workspace-joined'));
      alert('Successfully joined mode!');
    } catch (err: any) {
      console.error('Error joining mode:', err?.message || err);
      setErrorMessage(`Error joining mode: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsJoinModalOpen(false);
      setJoinCode('');
      setIsWorkspaceMenuOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        {/* Mode Switcher */}
        <div className="relative p-4 border-b border-slate-100">
          <button 
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                {activeWorkspace.type === 'personal' ? <User className="w-4 h-4" /> : 
                 activeWorkspace.type === 'admin' ? <ShieldAlert className="w-4 h-4" /> : 
                 <Building2 className="w-4 h-4" />}
              </div>
              <div className="text-left truncate">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {activeWorkspace.name}
                </p>
                <p className="text-xs text-slate-500 capitalize">{activeWorkspace.subtitle}</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {isWorkspaceMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsWorkspaceMenuOpen(false)}
              />
              <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 overflow-hidden">
                <input type="hidden" name="activeWorkspaceId" value={activeWorkspaceId} />
                <ul className="flex flex-col">
                  <li className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Your Modes
                  </li>
                
                {workspaces.map((ws) => (
                  <li 
                    key={ws.id}
                    onClick={() => handleWorkspaceChange(ws.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${activeWorkspaceId === ws.id ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                  >
                    {ws.type === 'personal' ? <User className="w-4 h-4 mr-3 text-slate-400" /> : 
                     ws.type === 'admin' ? <ShieldAlert className="w-4 h-4 mr-3 text-slate-400" /> : 
                     <Building2 className="w-4 h-4 mr-3 text-slate-400" />}
                    <div className="text-left truncate">
                      <span className="block truncate">{ws.name}</span>
                    </div>
                  </li>
                ))}

                <li className="h-px bg-slate-100 my-2" />
                
                <li 
                  onClick={() => { setIsJoinModalOpen(true); setIsWorkspaceMenuOpen(false); }}
                  className="w-full flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-gray-100 hover:text-slate-900 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 mr-3 text-slate-400" />
                  Join with Code
                </li>
                </ul>
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.filter(item => item.show).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
              {profile?.full_name?.charAt(0) || user?.phone?.charAt(1) || '?'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.phone || user?.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <LogOut className="w-5 h-5 mr-3 text-slate-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-40 relative">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6">
              <img 
                src="https://i.ibb.co.com/20WNbGMp/favicon-192x192.png" 
                alt="rifelo Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">rifelo</span>
          </div>
          
          {/* Mobile Mode Switcher */}
          <div className="relative">
            <button 
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                {activeWorkspace.type === 'personal' ? <User className="w-3 h-3" /> : 
                 activeWorkspace.type === 'admin' ? <ShieldAlert className="w-3 h-3" /> : 
                 <Building2 className="w-3 h-3" />}
              </div>
              <span className="text-sm font-semibold text-slate-900 max-w-[100px] truncate">
                {activeWorkspace.name}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
              {isWorkspaceMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsWorkspaceMenuOpen(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 overflow-hidden"
                  >
                    <input type="hidden" name="activeWorkspaceIdMobile" value={activeWorkspaceId} />
                    <ul className="flex flex-col">
                      <li className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Your Modes
                      </li>
                    
                    {workspaces.map((ws) => (
                      <li 
                        key={ws.id}
                        onClick={() => handleWorkspaceChange(ws.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${activeWorkspaceId === ws.id ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                      >
                        {ws.type === 'personal' ? <User className="w-4 h-4 mr-3 text-slate-400" /> : 
                         ws.type === 'admin' ? <ShieldAlert className="w-4 h-4 mr-3 text-slate-400" /> : 
                         <Building2 className="w-4 h-4 mr-3 text-slate-400" />}
                        <div className="text-left truncate">
                          <span className="block truncate">{ws.name}</span>
                        </div>
                      </li>
                    ))}

                    <li className="h-px bg-slate-100 my-2" />
                    
                    <li 
                      onClick={() => { setIsJoinModalOpen(true); setIsWorkspaceMenuOpen(false); }}
                      className="w-full flex items-center px-4 py-3 text-sm text-slate-600 hover:bg-gray-100 hover:text-slate-900 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-3 text-slate-400" />
                      Join with Code
                    </li>

                    <li className="h-px bg-slate-100 my-2" />

                    <li 
                      onClick={handleSignOut} 
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-red-500" />
                      Sign Out
                    </li>
                    </ul>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-40">
          <div className="flex items-center justify-around px-2 h-16">
            {menuItems.filter(item => item.show).map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                    isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : ''}`} />
                  <span className="text-[10px] font-medium truncate max-w-full px-1">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </main>

      {/* Join Mode Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Join Mode</h3>
              <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleJoinWorkspace} className="p-6">
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                Enter Invite or Activation Code
              </label>
              <input
                id="code"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter invite code"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all uppercase"
                required
              />
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Enter a valid invite code to join a Circle.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-4">
                {errorMessage && (
                  <span className="flex items-center text-sm text-red-600 font-medium animate-in fade-in slide-in-from-right-4">
                    <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
                    {errorMessage}
                  </span>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsJoinModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                    {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Join Mode
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Modal */}
    </div>
  );
}
