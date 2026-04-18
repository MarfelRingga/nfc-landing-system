'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ExternalLink, Plus, Trash2, CheckCircle2, Loader2, AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff, Globe } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getPlatformInfo } from '@/lib/platforms';
import { revalidateProfile } from '@/app/actions/revalidate';

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
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [expandedLinks, setExpandedLinks] = useState<Record<string, boolean>>({});
  const [messagePlaceholderName, setMessagePlaceholderName] = useState('Your Name (Optional)');
  const [messagePlaceholderContent, setMessagePlaceholderContent] = useState('Write a secret message...');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      if (authError) {
        if (authError.message.includes('Refresh Token Not Found') || authError.message.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }
        throw new Error('User not authenticated. Please log in again.');
      }
      if (!user) throw new Error('User not authenticated. Please log in again.');

      // 1. Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // maybeSingle prevents error if row doesn't exist yet

      if (profileError) throw new Error(`Failed to load profile: ${profileError.message}`);

      if (profile) {
        setUsername(profile.username || '');
        setFullName(profile.full_name || '');
        setJobTitle(profile.job_title || '');
        setCompany(profile.company || '');
        setEmail(profile.email || '');
        setBio(profile.bio || '');
        setIsPublic(profile.is_public !== false);
        setMessagePlaceholderName(profile.message_placeholder_name || 'Your Name (Optional)');
        setMessagePlaceholderContent(profile.message_placeholder_content || 'Write a secret message...');
      }

      // 2. Fetch Links
      const { data: linksData, error: linksError } = await supabase
        .from('profile_links')
        .select('*')
        .eq('profile_id', user.id)
        .order('sort_order', { ascending: true });

      if (linksError) throw new Error(`Failed to load links: ${linksError.message}`);

      if (linksData) {
        setLinks(linksData.map(l => ({ id: l.id, title: l.title, url: l.url, is_visible: l.is_visible })));
      }

    } catch (error: any) {
      console.error('Initialization error:', error);
      setErrorMsg(error.message || 'Failed to initialize profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleAddLink = () => {
    const newId = crypto.randomUUID();
    setLinks([...links, { id: newId, title: '', url: '' }]);
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
    showToast(newVisibility ? 'Link is now visible' : 'Link is now hidden');
  };

  const handleLinkChange = (id: string, field: 'title' | 'url', value: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const cleanLinkValue = (title: string, value: string) => {
    const lowerTitle = title.toLowerCase();
    let cleaned = value.trim();

    if (!cleaned) return cleaned;

    // Common cleaning for most social platforms
    const socialPlatforms = ['instagram', 'twitter', 'x.com', 'tiktok', 'youtube', 'telegram', 'github', 'facebook', 'linkedin'];
    
    if (socialPlatforms.some(p => lowerTitle.includes(p))) {
      // Remove @ prefix
      if (cleaned.startsWith('@')) {
        cleaned = cleaned.substring(1);
      }

      // Handle cases where user might have pasted a URL without protocol (e.g. instagram.com/user)
      let urlToParse = cleaned;
      if (!cleaned.startsWith('http') && cleaned.includes('.')) {
        urlToParse = 'https://' + cleaned;
      }

      // If it's a full URL, try to extract the username/ID
      try {
        if (urlToParse.startsWith('http')) {
          const url = new URL(urlToParse);
          // Only extract if the hostname matches the platform
          const hostname = url.hostname.toLowerCase();
          if (socialPlatforms.some(p => hostname.includes(p))) {
            const pathParts = url.pathname.split('/').filter(p => p.length > 0);
            
            if (hostname.includes('linkedin')) {
              // LinkedIn usually is /in/username
              if (pathParts[0] === 'in' && pathParts[1]) {
                cleaned = pathParts[1];
              } else if (pathParts[0]) {
                cleaned = pathParts[0];
              }
            } else if (hostname.includes('youtube')) {
              // YouTube handles usually start with @
              if (pathParts[0]) {
                cleaned = pathParts[0].replace(/^@/, '');
              }
            } else {
              // Most others are just /username
              if (pathParts[0]) {
                cleaned = pathParts[0];
              }
            }
          }
        }
      } catch (e) {
        // Not a valid URL, keep as is
      }
    }

    // Special handling for WhatsApp
    if (lowerTitle.includes('whatsapp') || lowerTitle.includes('wa.me')) {
      // Remove everything except numbers
      cleaned = cleaned.replace(/[^0-9]/g, '');
    }

    return cleaned;
  };

  const handleLinkBlur = (id: string) => {
    setLinks(links.map(l => {
      if (l.id === id) {
        let newTitle = l.title;
        let newUrl = cleanLinkValue(l.title, l.url);
        
        // Auto-fill title if empty and platform is detected from URL
        if (!newTitle && newUrl) {
          const platformInfo = getPlatformInfo('', newUrl);
          if (platformInfo) {
            // Capitalize first letter of platform id
            newTitle = platformInfo.id.charAt(0).toUpperCase() + platformInfo.id.slice(1);
            // Re-clean URL with the new title context
            newUrl = cleanLinkValue(newTitle, l.url);
          }
        }
        
        return { ...l, title: newTitle, url: newUrl };
      }
      return l;
    }));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow lowercase letters, numbers, dots, and underscores. No spaces.
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
    setUsername(val);
  };

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setShowSuccess(false);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        if (authError.message.includes('Refresh Token Not Found') || authError.message.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }
        throw new Error('Authentication required to save.');
      }
      if (!user) throw new Error('Authentication required to save.');

      // Basic Validation
      if (username.length > 0) {
        const usernameRegex = /^[a-z0-9._]{3,30}$/;
        if (!usernameRegex.test(username)) {
          throw new Error('Username must be between 3-30 characters and can only contain lowercase letters, numbers, dots, and underscores.');
        }
      }

      // 1. UPSERT Profile
      // Note: We don't send updated_at because the database trigger handles it automatically now.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username || null, // Convert empty string to null to avoid unique constraint issues
          full_name: fullName,
          job_title: jobTitle,
          company: company,
          email: email,
          bio: bio,
          is_public: isPublic,
          message_placeholder_name: messagePlaceholderName,
          message_placeholder_content: messagePlaceholderContent
        });

      if (profileError) {
        if (profileError.code === '23505') {
          throw new Error('This username is already taken. Please choose another one.');
        }
        throw new Error(`Profile Error: ${profileError.message}`);
      }

      // 2. SYNC Links
      const validLinks = links.filter(l => l.title.trim() !== '' || l.url.trim() !== '');
      const validLinkIds = validLinks.map(l => l.id);

      // Step A: Upsert valid links
      if (validLinks.length > 0) {
        const linksToUpsert = validLinks.map((l, index) => ({
          id: l.id,
          profile_id: user.id,
          title: l.title.trim(),
          url: l.url.trim(),
          sort_order: index,
          is_visible: l.is_visible !== false
        }));

        const { error: upsertError } = await supabase
          .from('profile_links')
          .upsert(linksToUpsert);

        if (upsertError) throw new Error(`Failed to save links: ${upsertError.message}`);
      }

      // Step B: Delete removed links
      if (validLinkIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('profile_links')
          .delete()
          .eq('profile_id', user.id)
          .not('id', 'in', `(${validLinkIds.join(',')})`);
          
        if (deleteError) throw new Error(`Failed to clear removed links: ${deleteError.message}`);
      } else {
        // If no valid links, delete all links for this user
        const { error: deleteError } = await supabase
          .from('profile_links')
          .delete()
          .eq('profile_id', user.id);
          
        if (deleteError) throw new Error(`Failed to clear removed links: ${deleteError.message}`);
      }

      // Success
      setShowSuccess(true);
      if (username) {
        await revalidateProfile(username);
      }
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error: any) {
      console.error('Save failed:', error);
      setErrorMsg(error.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        <p className="text-sm text-slate-500 font-medium">Loading your digital ID...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-3xl mx-auto pb-20">
      {/* Header & Actions */}
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

      {/* Main Form */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
        
        {/* Username Setup */}
        <div className="pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-slate-900">Public Profile Visibility</label>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isPublic ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            {isPublic 
              ? 'Your profile is currently visible to anyone with your link.' 
              : 'Your profile is currently private and hidden from the public.'}
          </p>

          <label className="block text-sm font-medium text-slate-900 mb-2">URL/Username</label>
          <div className="flex items-stretch">
            <span className="flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm whitespace-nowrap">
              rifelo.id/u/
            </span>
            <input 
              type="text" 
              placeholder="yourname" 
              value={username}
              onChange={handleUsernameChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Only lowercase letters, numbers, dot (.), and underscore (_).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input 
              type="text" 
              placeholder="Your Full Name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
            <input 
              type="text" 
              placeholder="e.g. Product Designer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
            <input 
              type="text" 
              placeholder="Your Company" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
          <textarea 
            rows={3} 
            placeholder="Tell people about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none"
          ></textarea>
        </div>

        {/* Custom Links Section */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Platforms & Links</h3>
              <p className="text-xs text-slate-500 mt-1">Add your social media, portfolio, or contact links.</p>
            </div>
            <button 
              type="button"
              onClick={handleAddLink}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 sm:px-3 sm:py-1.5 bg-slate-900 text-white text-sm sm:text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-1" />
              Add Link
            </button>
          </div>

          <div className="space-y-4">
            {links.map((link) => {
              const isExpanded = expandedLinks[link.id];
              const platformInfo = getPlatformInfo(link.title || '', link.url || '');
              const Icon = platformInfo ? platformInfo.icon : Globe;
              
              return (
                <div key={link.id} className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 group relative overflow-hidden transition-all">
                  {/* Header (Always visible) */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => toggleLinkExpansion(link.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 ${platformInfo ? platformInfo.color : 'text-slate-400'}`}>
                        {platformInfo ? (
                          <Icon className="w-4 h-4" />
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(link.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          link.is_visible === false 
                            ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-200' 
                            : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={link.is_visible === false ? "Show on profile" : "Hide from profile"}
                      >
                        {link.is_visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLink(link.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                      <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
                        <div className="flex-1 w-full space-y-4 pt-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Platform Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g., Instagram, Portfolio, WhatsApp" 
                              value={link.title}
                              onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                              className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Text / Value</label>
                            <input 
                              type="text" 
                              placeholder="e.g., @username, +62812..., or https://..." 
                              value={link.url}
                              onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                              onBlur={() => handleLinkBlur(link.id)}
                              className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {links.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <p className="text-sm text-slate-500">No links added yet. Click "Add Link" to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Box Settings Section */}
        <div className="pt-6 border-t border-slate-100">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Message Box Settings</h3>
            <p className="text-xs text-slate-500 mt-1">Customize the placeholders for the message box on your public profile.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name Input Placeholder</label>
              <input 
                type="text" 
                placeholder="Your Name (Optional)" 
                value={messagePlaceholderName}
                onChange={(e) => setMessagePlaceholderName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message Input Placeholder</label>
              <input 
                type="text" 
                placeholder="Write a secret message..." 
                value={messagePlaceholderContent}
                onChange={(e) => setMessagePlaceholderContent(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Save Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
          {errorMsg && (
            <span className="flex items-center text-sm text-red-600 font-medium animate-in fade-in slide-in-from-right-4">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {errorMsg}
            </span>
          )}
          {showSuccess && (
            <span className="flex items-center text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Saved successfully!
            </span>
          )}
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto flex justify-center items-center px-6 py-3 sm:py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-bottom-4 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
