'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ExternalLink, Plus, Trash2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff, Link as LinkIcon, Loader2, Palette } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getPlatformInfo } from '@/lib/platforms';
import { revalidateProfile } from '@/app/actions/revalidate';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { encodeMessageSettings, decodeMessageSettings } from '@/lib/messageSettings';

import { ModeSelector } from '@/components/profile/ModeSelector';
import { ThemeSelector } from '@/components/profile/ThemeSelector';
import { DynamicProfileForm } from '@/components/profile/DynamicProfileForm';
import { ModeSwitchConfirmation } from '@/components/profile/ModeSwitchConfirmation';
import { ProfileMode } from '@/lib/types/profile';
import { migrateFieldData } from '@/lib/profileMigration';
import { getValidationErrors } from '@/lib/validation/profileValidation';
import { getThemesByMode, getTheme } from '@/lib/themePresets';

interface CustomLink {
  id: string;
  title: string;
  url: string;
  is_visible?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();

  // --- STATES ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [expandedLinks, setExpandedLinks] = useState<Record<string, boolean>>({});
  
  const [messagePlaceholderName, setMessagePlaceholderName] = useState('Your Name (Optional)');
  const [messagePlaceholderContent, setMessagePlaceholderContent] = useState('Write a secret message...');
  const [allowMessages, setAllowMessages] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- NEW STATES (Multi-Mode) ---
  const [profileMode, setProfileMode] = useState<ProfileMode>('casual');
  const [themePreset, setThemePreset] = useState<string>('minimal');
  const [showModeSwitchConfirm, setShowModeSwitchConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<ProfileMode | null>(null);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [activeAppearanceTab, setActiveAppearanceTab] = useState<'mode' | 'theme'>('mode');
  const [customTheme, setCustomTheme] = useState<any>({});

  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({
    full_name: '',
    job_title: '',
    company: '',
    email: '',
    phone: '',
    bio: ''
  });

  const [originalStateHash, setOriginalStateHash] = useState<string>('');

  const getCurrentStateHash = (
    u = username, 
    ip = isPublic, 
    pm = profileMode, 
    tp = themePreset, 
    ct = customTheme,
    dv = dynamicValues, 
    ls = links, 
    mpn = messagePlaceholderName, 
    mpc = messagePlaceholderContent, 
    am = allowMessages
  ) => {
    // Strip temporary IDs from links for stable comparison if needed, or just compare as-is.
    const cleanLinks = ls.map(l => ({ title: l.title, url: l.url, is_visible: l.is_visible }));
    return JSON.stringify({ u, ip, pm, tp, dv, cleanLinks, mpn, mpc, am, ct });
  };

  const hasUnsavedChanges = !isLoading && originalStateHash !== '' && originalStateHash !== getCurrentStateHash();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      // Fetch Profile and Links concurrently (Promise.all)
      const [profileResult, linksResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('profile_links')
          .select('*')
          .eq('profile_id', user.id)
          .order('sort_order', { ascending: true })
      ]);

      const { data: profile, error: profileError } = profileResult;
      const { data: linksData, error: linksError } = linksResult;

      if (profileError) throw new Error(`Failed to load profile: ${profileError.message}`);
      if (linksError) throw new Error(`Failed to load profile links: ${linksError.message}`);

      if (profile) {
        setUsername(profile.username || '');
        setIsPublic(profile.is_public !== false);
        
        setProfileMode((profile.profile_mode as ProfileMode) || 'casual');
        setThemePreset(profile.theme_preset || 'minimal');
        setCustomTheme(profile.custom_theme || {});

        setDynamicValues({
          full_name: profile.full_name || '',
          job_title: profile.job_title || '',
          company: profile.company || '',
          email: profile.email || '',
          phone: profile.phone || '',
          bio: profile.bio || '',
        });
        
        const decodedSettings = decodeMessageSettings(profile.message_placeholder_name || 'Your Name (Optional)');
        setAllowMessages(decodedSettings.isEnabled);
        setMessagePlaceholderName(decodedSettings.cleanName);
        setMessagePlaceholderContent(profile.message_placeholder_content || 'Write a secret message...');
      }

      if (linksData) {
        setLinks(linksData.map(l => ({ id: l.id, title: l.title, url: l.url, is_visible: l.is_visible })));
      }

      // Delay state hash capture slightly to let all states settle
      setTimeout(() => {
        setOriginalStateHash(getCurrentStateHash(
          profile?.username || '',
          profile?.is_public !== false,
          (profile?.profile_mode as ProfileMode) || 'casual',
          profile?.theme_preset || 'minimal',
          profile?.custom_theme || {},
          {
            full_name: profile?.full_name || '',
            job_title: profile?.job_title || '',
            company: profile?.company || '',
            email: profile?.email || '',
            phone: profile?.phone || '',
            bio: profile?.bio || '',
          },
          linksData ? linksData.map(l => ({ id: l.id, title: l.title, url: l.url, is_visible: l.is_visible })) : [],
          decodeMessageSettings(profile?.message_placeholder_name || 'Your Name (Optional)').cleanName,
          profile?.message_placeholder_content || 'Write a secret message...',
          decodeMessageSettings(profile?.message_placeholder_name || 'Your Name (Optional)').isEnabled
        ));
      }, 0);

    } catch (error: any) {
      console.error('Initialization error:', error);
      setErrorMsg(error.message || 'Failed to initialize profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges || !originalStateHash) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, originalStateHash, username, isPublic, profileMode, themePreset, customTheme, dynamicValues, links, messagePlaceholderName, messagePlaceholderContent, allowMessages]);

  const updateCustomTheme = (updates: any) => {
    setCustomTheme((prev: any) => ({ ...prev, ...updates }));
  };

  const handleModeChange = (newMode: ProfileMode) => {
    if (newMode === profileMode) return;
    setPendingMode(newMode);
    setShowModeSwitchConfirm(true);
  };

  const confirmModeSwitch = () => {
    if (!pendingMode) return;
    
    // Migrate existing data when mode changes
    setDynamicValues(prev => migrateFieldData(profileMode, pendingMode, prev));
    setProfileMode(pendingMode);
    
    // Auto-switch theme jika tidak kompatibel
    const compatibleThemes = getThemesByMode(pendingMode);
    const isCurrentThemeOK = compatibleThemes.find(t => t.id === themePreset);
    
    let nextTheme = themePreset;
    if (!isCurrentThemeOK && compatibleThemes.length > 0) {
      nextTheme = compatibleThemes[0].id;
      setThemePreset(nextTheme);
    }
    
    setShowModeSwitchConfirm(false);
    setPendingMode(null);
  };

  const handleThemeChange = (newTheme: string) => {
    setThemePreset(newTheme);
  };

  // --- HANDLERS ---
  const handleFieldChange = (field: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [field]: value }));
  };

  const handleAddLink = () => {
    const newId = crypto.randomUUID();
    setLinks([{ id: newId, title: '', url: '' }, ...links]);
    setExpandedLinks(prev => ({ ...prev, [newId]: true }));
  };

  const toggleLinkExpansion = (id: string) => {
    setExpandedLinks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    const link = links.find(l => l.id === id);
    const newVisibility = link?.is_visible === false ? true : false;
    setLinks(links.map(l => l.id === id ? { ...l, is_visible: newVisibility } : l));
  };

  const handleLinkChange = (id: string, field: 'title' | 'url', value: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const cleanLinkValue = (title: string, value: string) => {
    const lowerTitle = title.toLowerCase();
    let cleaned = value.trim();

    if (!cleaned) return cleaned;

    const socialPlatforms = ['instagram', 'twitter', 'x.com', 'tiktok', 'youtube', 'telegram', 'github', 'facebook', 'linkedin'];
    
    if (socialPlatforms.some(p => lowerTitle.includes(p))) {
      if (cleaned.startsWith('@')) {
        cleaned = cleaned.substring(1);
      }

      let urlToParse = cleaned;
      if (!cleaned.startsWith('http') && cleaned.includes('.')) {
        urlToParse = 'https://' + cleaned;
      }

      try {
        if (urlToParse.startsWith('http')) {
          const url = new URL(urlToParse);
          const hostname = url.hostname.toLowerCase();
          if (socialPlatforms.some(p => hostname.includes(p))) {
            const pathParts = url.pathname.split('/').filter(p => p.length > 0);
            
            if (hostname.includes('linkedin')) {
              if (pathParts[0] === 'in' && pathParts[1]) {
                cleaned = pathParts[1];
              } else if (pathParts[0]) {
                cleaned = pathParts[0];
              }
            } else if (hostname.includes('youtube')) {
              if (pathParts[0]) {
                cleaned = pathParts[0].replace(/^@/, '');
              }
            } else {
              if (pathParts[0]) {
                cleaned = pathParts[0];
              }
            }
          }
        }
      } catch (e) {
      }
    }

    if (lowerTitle.includes('whatsapp') || lowerTitle.includes('wa.me')) {
      cleaned = cleaned.replace(/[^0-9]/g, '');
    }

    return cleaned;
  };

  const handleLinkBlur = (id: string) => {
    setLinks(links.map(l => {
      if (l.id === id) {
        let newTitle = l.title;
        let newUrl = cleanLinkValue(l.title, l.url || '');
        
        if (!newTitle && newUrl) {
          const platformInfo = getPlatformInfo('', newUrl);
          if (platformInfo) {
            newTitle = platformInfo.id.charAt(0).toUpperCase() + platformInfo.id.slice(1);
            newUrl = cleanLinkValue(newTitle, l.url || '');
          }
        }
        
        return { ...l, title: newTitle, url: newUrl };
      }
      return l;
    }));
  };

  // --- SAVE LOGIC ---
  const handleSave = async (options: { overrides?: { mode?: ProfileMode; theme?: string } } = {}) => {
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setShowSuccess(false);

      const currentMode = options.overrides?.mode || profileMode;
      const currentTheme = options.overrides?.theme || themePreset;

      const validationErrors = getValidationErrors(dynamicValues, currentMode as ProfileMode);
      if (validationErrors.length > 0) {
        setErrorMsg(validationErrors[0].message);
        setIsSaving(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required to save.');

      if (username.length > 0) {
        const usernameRegex = /^[a-z0-9._]{3,30}$/;
        if (!usernameRegex.test(username)) {
          throw new Error('Username must be between 3-30 characters and can only contain lowercase letters, numbers, dots, and underscores.');
        }
      }

      const encodedMessageName = encodeMessageSettings(messagePlaceholderName, allowMessages);
      
      const payload: any = {
        id: user.id,
        username: username || null,
        full_name: dynamicValues.full_name || '',
        job_title: dynamicValues.job_title || '',
        company: dynamicValues.company || '',
        email: dynamicValues.email || '',
        phone: dynamicValues.phone || null,
        bio: dynamicValues.bio || '',
        profile_mode: currentMode,
        theme_preset: currentTheme,
        custom_theme: customTheme,
        is_public: isPublic,
        message_placeholder_name: encodedMessageName,
        message_placeholder_content: messagePlaceholderContent
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(payload);

      if (profileError) {
        if (profileError.code === '23505') throw new Error('This username is already taken. Please choose another one.');
        throw new Error(`Profile Error: ${profileError.message}`);
      }

      // Links saving
      const validLinks = links.filter(l => l.title.trim() !== '' || l.url.trim() !== '');
      const validLinkIds = validLinks.map(l => l.id);

      if (validLinks.length > 0) {
        const linksToUpsert = validLinks.map((l, index) => ({
          id: l.id,
          profile_id: user.id,
          title: l.title.trim(),
          url: l.url.trim(),
          sort_order: index,
          is_visible: l.is_visible !== false
        }));
        await supabase.from('profile_links').upsert(linksToUpsert);
      }

      if (validLinkIds.length > 0) {
        await supabase.from('profile_links').delete().eq('profile_id', user.id).not('id', 'in', `(${validLinkIds.join(',')})`);
      } else {
        await supabase.from('profile_links').delete().eq('profile_id', user.id);
      }

      setOriginalStateHash(getCurrentStateHash(
        username,
        isPublic,
        currentMode,
        currentTheme,
        customTheme,
        dynamicValues,
        validLinks,
        messagePlaceholderName,
        messagePlaceholderContent,
        allowMessages
      ));

      setShowSuccess(true);
      if (username) await revalidateProfile(username);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error: any) {
      console.error('Save failed:', error);
      setErrorMsg(error.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER ---
  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto pb-20">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Digital ID</h1>
          <p className="text-sm text-slate-500 mt-1">Customize your professional identity and links.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link 
            href={`/u/${username || 'setup-username-first'}`} 
            target="_blank" 
            className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ExternalLink className="w-4 h-4 mr-2 text-slate-400" />
            Preview Profile
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 3: Dynamic Fields */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
          
          <div className="pb-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-900">Public Profile Visibility</label>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 border focus:outline-none ${
                  isPublic 
                    ? 'bg-emerald-500/15 border-emerald-500/30 backdrop-blur-sm' 
                    : 'bg-slate-100/70 border-slate-200 backdrop-blur-sm'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full shadow-md transition-transform duration-300 ${
                  isPublic ? 'translate-x-6 bg-emerald-500' : 'translate-x-1 bg-slate-400'
                }`} />
              </button>
            </div>

            <label className="block text-sm font-medium text-slate-900 mb-2">URL/Username</label>
            <div className="flex items-stretch">
              <span className="flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-medium whitespace-nowrap">
                rifelo.id/u/
              </span>
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Only lowercase letters, numbers, dot (.), and underscore (_).</p>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-4">Profile Information</h2>
          <DynamicProfileForm
            mode={profileMode}
            initialValues={dynamicValues}
            onChange={handleFieldChange}
          />
        </div>

        {/* Section 4: Links & Platforms */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Platforms & Links</h3>
              <p className="text-sm text-slate-500 mt-1">Add your social media, portfolio, or contact links.</p>
            </div>
            <button 
              type="button"
              onClick={handleAddLink}
              className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </button>
          </div>

          <div className="space-y-4">
            {links.map((link) => {
              const isExpanded = expandedLinks[link.id];
              const platformInfo = getPlatformInfo(link.title || '', link.url || '');
              const isUrl = link.url?.startsWith('http://') || link.url?.startsWith('https://');
              
              return (
                <div key={link.id} className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 group relative overflow-hidden transition-all">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => toggleLinkExpansion(link.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 ${platformInfo ? platformInfo.color : 'text-slate-400'}`}>
                        {platformInfo ? (
                          <platformInfo.icon className="w-4 h-4" />
                        ) : isUrl ? (
                          <LinkIcon className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            {link.title ? link.title.charAt(0).toUpperCase() : '#'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {link.title || 'New Link'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {link.url || 'No URL provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleVisibility(link.id); }}
                        className={`p-2 rounded-lg transition-colors ${
                          link.is_visible === false 
                            ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-200' 
                            : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {link.is_visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveLink(link.id); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">Platform Name</label>
                          <input 
                            type="text" 
                            placeholder="Instagram, Portfolio..." 
                            value={link.title}
                            onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">URL</label>
                          <input 
                            type="text" 
                            placeholder="https://..." 
                            value={link.url}
                            onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                            onBlur={() => handleLinkBlur(link.id)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {links.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <p className="text-sm text-slate-500">No links added yet.<br/>Click "Add Link" to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Message Box Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Message Box Settings</h3>
              <p className="text-sm text-slate-500 mt-1">Customize the placeholders for the message box on your public profile.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center shrink-0">
              <span className="mr-3 text-sm font-medium text-slate-900">Enable Message Box</span>
              <button
                type="button"
                onClick={() => setAllowMessages(!allowMessages)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 border focus:outline-none ${
                  allowMessages 
                    ? 'bg-emerald-500/15 border-emerald-500/30 backdrop-blur-sm' 
                    : 'bg-slate-100/70 border-slate-200 backdrop-blur-sm'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full shadow-md transition-transform duration-300 ${
                  allowMessages ? 'translate-x-6 bg-emerald-500' : 'translate-x-1 bg-slate-400'
                }`} />
              </button>
            </div>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${allowMessages ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name Input Placeholder</label>
              <input 
                type="text" 
                value={messagePlaceholderName}
                onChange={(e) => setMessagePlaceholderName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message Input Placeholder</label>
              <input 
                type="text" 
                value={messagePlaceholderContent}
                onChange={(e) => setMessagePlaceholderContent(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Section 6: Appearance Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
          <div 
            className="flex items-center justify-between cursor-pointer group hover:opacity-90 transition-opacity"
            onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Appearance Settings
              </h3>
              <p className="text-sm text-slate-500 mt-1">Customize the display mode, theme preset, fonts, and look of your profile card.</p>
            </div>
            <button 
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
            >
              {isAppearanceOpen ? <ChevronUp className="w-5 h-5 animate-in fade-in" /> : <ChevronDown className="w-5 h-5 animate-in fade-in" />}
            </button>
          </div>

          {isAppearanceOpen && (
            <div className="mt-6 space-y-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Mode */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:w-36 shrink-0">Mode</div>
                <div className="flex-1">
                  <ModeSelector 
                    currentMode={profileMode}
                    onModeSelect={handleModeChange}
                  />
                </div>
              </div>
              
              <div className="h-px bg-slate-100"></div>
              
              {/* Theme */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:w-36 shrink-0">Theme Preset</div>
                <div className="flex-1">
                  <ThemeSelector
                    currentMode={profileMode}
                    currentTheme={themePreset}
                    onThemeSelect={handleThemeChange}
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* Custom Theme Features */}
              <div className="space-y-6">
                {/* Link Style */}
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:w-36 shrink-0 sm:mt-5">Link Style</div>
                  <div className="flex flex-col gap-3 flex-1 w-full max-w-xl">
                    {/* Sharp */}
                    <button 
                      type="button"
                      onClick={() => updateCustomTheme({ borderRadius: 'sharp' })}
                      className={`flex items-center justify-between px-5 py-3.5 border-[1.5px] rounded-2xl transition-all duration-200 text-left w-full
                        ${(customTheme?.borderRadius) === 'sharp' 
                          ? 'border-slate-400 bg-slate-100/80 text-slate-900 shadow-inner backdrop-blur-sm font-extrabold' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="text-sm">Sharp</span>
                      <div className="px-3 py-1 text-[11px] font-bold border-[1.5px] border-current rounded-none">
                        Link
                      </div>
                    </button>

                    {/* Rounded */}
                    <button 
                      type="button"
                      onClick={() => updateCustomTheme({ borderRadius: 'rounded' })}
                      className={`flex items-center justify-between px-5 py-3.5 border-[1.5px] rounded-2xl transition-all duration-200 text-left w-full
                        ${(customTheme?.borderRadius || 'rounded') === 'rounded' 
                          ? 'border-slate-400 bg-slate-100/80 text-slate-900 shadow-inner backdrop-blur-sm font-extrabold' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="text-sm">Rounded</span>
                      <div className="px-3 py-1 text-[11px] font-bold border-[1.5px] border-current rounded-lg">
                        Link
                      </div>
                    </button>

                    {/* Pill */}
                    <button 
                      type="button"
                      onClick={() => updateCustomTheme({ borderRadius: 'pill' })}
                      className={`flex items-center justify-between px-5 py-3.5 border-[1.5px] rounded-2xl transition-all duration-200 text-left w-full
                        ${(customTheme?.borderRadius) === 'pill' 
                          ? 'border-slate-400 bg-slate-100/80 text-slate-900 shadow-inner backdrop-blur-sm font-extrabold' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="text-sm">Pill</span>
                      <div className="px-3 py-1 text-[11px] font-bold border-[1.5px] border-current rounded-full">
                        Link
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Button (Unsaved Changes) */}
        <div 
          className={`fixed bottom-24 md:bottom-24 right-6 md:right-8 z-50 pointer-events-none transition-all duration-500 ease-out flex justify-end
            ${(hasUnsavedChanges || isSaving || showSuccess || errorMsg) ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'}`}
        >
          <div className="pointer-events-auto flex items-center">
            <div className={`backdrop-blur-xl border shadow-lg rounded-xl p-2 flex items-center gap-3 transition-colors duration-300
              ${showSuccess ? 'bg-emerald-50/90 border-emerald-200' : 'bg-white/90 border-slate-200'}
            `}>
              <div className="flex items-center">
                {errorMsg && (
                  <span className="flex items-center text-[13px] text-red-600 font-medium px-2 animate-in fade-in slide-in-from-right-2">
                    <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
                    {errorMsg}
                  </span>
                )}
                {showSuccess && !errorMsg && (
                  <span className="flex items-center text-[13px] text-emerald-700 font-medium px-2 animate-in fade-in slide-in-from-right-2">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
                    Saved
                  </span>
                )}
                {!showSuccess && !errorMsg && hasUnsavedChanges && (
                  <span className="flex items-center text-[13px] text-amber-600 font-medium px-2 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                    Unsaved changes
                  </span>
                )}
              </div>
              <div className="flex items-center shrink-0">
                <button 
                  onClick={() => handleSave()} 
                  disabled={isSaving || (!hasUnsavedChanges && !errorMsg)}
                  className={`flex justify-center items-center px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm
                    ${showSuccess ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : showSuccess ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                  {isSaving ? 'Saving' : showSuccess ? 'Done' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-24 md:bottom-8 right-6 md:right-8 z-[100] flex items-center px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-bottom-4 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingMode && (
        <ModeSwitchConfirmation
          isOpen={showModeSwitchConfirm}
          fromMode={profileMode}
          toMode={pendingMode}
          onConfirm={confirmModeSwitch}
          onCancel={() => {
            setShowModeSwitchConfirm(false);
            setPendingMode(null);
          }}
        />
      )}
    </div>
  );
}
