'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Smartphone, 
  Settings2, 
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface NFCTag {
  id: string;
  token: string;
  tag_name: string | null;
  status: string;
  interaction_mode: string;
  redirect_url: string | null;
  created_at: string;
}

export default function NFCTagsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}>
      <NFCTagsContent />
    </Suspense>
  );
}

function NFCTagsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [tags, setTags] = useState<NFCTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<NFCTag | null>(null);
  const [token, setToken] = useState('');
  const [tagName, setTagName] = useState('');
  const [interactionMode, setInteractionMode] = useState('profile');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [customRedirectMode, setCustomRedirectMode] = useState<'link' | 'custom'>('link');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userCircles, setUserCircles] = useState<any[]>([]);
  const [userLinks, setUserLinks] = useState<any[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('personal');
  const [isCircleWorkspace, setIsCircleWorkspace] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dropdown States
  const [isInteractionModeOpen, setIsInteractionModeOpen] = useState(false);
  const [isSelectCircleOpen, setIsSelectCircleOpen] = useState(false);
  const [isRedirectDestOpen, setIsRedirectDestOpen] = useState(false);

  useEffect(() => {
    const claimToken = searchParams.get('claim');
    if (claimToken) {
      const autoClaim = async () => {
        setIsLoading(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          // Find the tag
          const { data: tag, error: findError } = await supabase
            .from('nfc_tags')
            .select('id, circle_id')
            .ilike('token', claimToken.trim())
            .is('user_id', null)
            .maybeSingle();

          if (findError || !tag) {
            console.error('Invalid token or already claimed');
            return;
          }

          // Claim the tag
          await supabase
            .from('nfc_tags')
            .update({ 
              user_id: session.user.id,
              tag_name: 'My NFC Tag',
              status: 'active'
            })
            .eq('id', tag.id);

          // Join circle if applicable
          if (tag.circle_id) {
            await supabase
              .from('circle_members')
              .upsert({
                circle_id: tag.circle_id,
                profile_id: session.user.id,
                role: 'Member'
              }, { onConflict: 'circle_id,profile_id' });
            window.dispatchEvent(new Event('workspace-changed'));
          }

          // Refresh tags
          fetchTags();
          
          // Remove query param
          router.replace('/tags');
        } catch (err) {
          console.error('Auto claim error:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      autoClaim();
    }
  }, [searchParams, router]);

  useEffect(() => {
    const saved = localStorage.getItem('activeWorkspaceId');
    if (saved) {
      setActiveWorkspaceId(saved);
      setIsCircleWorkspace(saved !== 'personal' && saved !== 'admin');
    }

    const handleWorkspaceChange = () => {
      const newSaved = localStorage.getItem('activeWorkspaceId');
      if (newSaved) {
        setActiveWorkspaceId(newSaved);
        setIsCircleWorkspace(newSaved !== 'personal' && newSaved !== 'admin');
      }
    };

    window.addEventListener('workspace-changed', handleWorkspaceChange);
    return () => window.removeEventListener('workspace-changed', handleWorkspaceChange);
  }, []);

  async function fetchTags() {
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
      if (!session) return;

      const { data, error } = await supabase
        .from('nfc_tags')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTags(data || []);

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.is_admin) {
        // Admins see all circles
        const { data: allCircles, error: circlesError } = await supabase
          .from('circles')
          .select('id, name, invite_code')
          .order('name');
        
        if (!circlesError && allCircles) {
          setUserCircles(allCircles);
        }
      } else {
        // Regular users see joined circles
        const { data: memberCircles, error: circlesError } = await supabase
          .from('circle_members')
          .select(`
            role,
            circles (
              id,
              name,
              invite_code
            )
          `)
          .eq('profile_id', session.user.id);
        
        if (!circlesError && memberCircles) {
          const circles = memberCircles
            .map((m: any) => m.circles)
            .filter(Boolean);
          setUserCircles(circles);
        }
      }

      // Fetch user's profile links for custom redirect dropdown
      const { data: linksData } = await supabase
        .from('profile_links')
        .select('id, title, url')
        .eq('profile_id', session.user.id)
        .order('sort_order', { ascending: true });
      
      if (linksData) {
        setUserLinks(linksData);
      }
    } catch (err: any) {
      console.error('Error fetching tags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [activeWorkspaceId]);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        if (sessionError.message.includes('Refresh Token Not Found') || sessionError.message.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }
      }
      if (!session) throw new Error('Not authenticated');

      // 1. Find the tag by token where user_id is null
      const { data: tag, error: findError } = await supabase
        .from('nfc_tags')
        .select('id, circle_id')
        .ilike('token', token.trim())
        .is('user_id', null)
        .maybeSingle();

      if (findError) throw findError;
      if (!tag) {
        throw new Error('Invalid token or tag already claimed.');
      }

      // 2. Claim the tag
      const { error: updateError } = await supabase
        .from('nfc_tags')
        .update({ 
          user_id: session.user.id,
          tag_name: tagName.trim() || 'My NFC Tag',
          status: 'active'
        })
        .eq('id', tag.id);

      if (updateError) throw updateError;

      // 3. If tag has a circle_id, join the user to that circle automatically
      if (tag.circle_id) {
        await supabase
          .from('circle_members')
          .upsert({
            circle_id: tag.circle_id,
            profile_id: session.user.id,
            role: 'Member'
          }, { onConflict: 'circle_id,profile_id' });
        
        // Refresh circles list
        await fetchTags();
        window.dispatchEvent(new Event('workspace-changed'));
      }

      setSuccess('Tag added successfully!');
      setToken('');
      setTagName('');
      setTimeout(() => {
        setIsAddModalOpen(false);
        setSuccess(null);
        fetchTags();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to add tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        if (sessionError.message.includes('Refresh Token Not Found') || sessionError.message.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }
      }
      if (!session) throw new Error('Not authenticated');

      // Find circle_id if interaction mode is circle
      let targetCircleId = null;
      if (interactionMode === 'circle' && redirectUrl) {
        const circle = userCircles.find(c => c.invite_code === redirectUrl);
        if (circle) targetCircleId = circle.id;
      }

      const { error: updateError } = await supabase
        .from('nfc_tags')
        .update({ 
          tag_name: tagName.trim() || 'My NFC Tag',
          interaction_mode: interactionMode,
          redirect_url: redirectUrl.trim() || null,
          circle_id: targetCircleId
        })
        .eq('id', editingTag.id);

      if (updateError) throw updateError;

      // Join the user to the circle if they are setting a tag to it
      if (targetCircleId) {
        await supabase
          .from('circle_members')
          .upsert({
            circle_id: targetCircleId,
            profile_id: session.user.id,
            role: 'Member'
          }, { onConflict: 'circle_id,profile_id' });
        
        // Refresh circles list
        await fetchTags();
        window.dispatchEvent(new Event('workspace-changed'));
      }

      setSuccess('Tag updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditingTag(null);
        setSuccess(null);
        fetchTags();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (tag: NFCTag) => {
    setEditingTag(tag);
    setTagName(tag.tag_name || '');
    setInteractionMode(tag.interaction_mode || 'profile');
    setRedirectUrl(tag.redirect_url || '');
    
    if (tag.interaction_mode === 'redirect' && tag.redirect_url) {
      const isLink = userLinks.some(l => l.url === tag.redirect_url);
      setCustomRedirectMode(isLink ? 'link' : 'custom');
    } else {
      setCustomRedirectMode('link');
    }
    
    setIsEditModalOpen(true);
  };

  const handleDeleteTag = async (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('nfc_tags')
        .update({ user_id: null })
        .eq('id', deleteId);

      if (error) throw error;
      fetchTags();
      setDeleteId(null);
    } catch (err: any) {
      console.error('Error deleting tag:', err);
      setErrorMessage(err.message || 'Failed to delete tag');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">NFC Tags</h1>
          <p className="text-slate-500">Manage your connected physical identities</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Tag
        </button>
      </div>

      {isLoading ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
          <p className="text-sm text-slate-500 font-medium">Loading tags...</p>
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No tags connected</h3>
          <p className="text-slate-500 mb-6">Connect your first NFC tag to get started</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-black font-semibold hover:underline"
          >
            Add your first tag
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tags.map((tag) => (
            <div 
              key={tag.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{tag.tag_name || 'Unnamed Tag'}</h3>
                    <p className="text-xs text-slate-400 font-mono">{tag.token}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEditModal(tag)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteTag(tag.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${tag.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-xs font-medium text-slate-500 capitalize">{tag.status}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Mode: <span className="text-slate-600 font-medium capitalize">{tag.interaction_mode}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Unbind Tag?</h3>
              <p className="text-slate-500 mb-6">
                Are you sure you want to unbind this tag from your account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  Unbind
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Message Modal */}
      <AnimatePresence>
        {errorMessage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Error</h3>
              <p className="text-slate-500 mb-6">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage(null)}
                className="w-full px-4 py-2 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Tag Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl my-auto"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Add New Tag</h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleAddTag} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tag Token / Code
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter the code on your physical tag"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tag Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Tag label"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="pt-4 flex flex-col items-center gap-3">
                  {error && (
                    <span className="flex items-center text-sm text-red-600 font-medium animate-in fade-in slide-in-from-bottom-2 text-center">
                      <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
                      {error}
                    </span>
                  )}
                  {success && (
                    <span className="flex items-center text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-bottom-2 text-center">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
                      {success}
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Tag'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Tag Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingTag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl my-auto"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Edit Tag</h2>
                <button 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTag(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleEditTag} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="New tag label"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Interaction Mode
                  </label>
                  <div className="relative">
                    <input type="hidden" name="interactionMode" value={interactionMode} />
                    <button
                      type="button"
                      onClick={() => setIsInteractionModeOpen(!isInteractionModeOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white"
                    >
                      <span className="truncate">
                        {interactionMode === 'profile' ? 'Digital Profile (Default)' :
                         interactionMode === 'redirect' ? 'Custom URL Redirect' :
                         interactionMode === 'circle' && userCircles.length === 1 ? `Circle: ${userCircles[0].name}` :
                         'Circle Protocol'}
                      </span>
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                    </button>
                    
                    {isInteractionModeOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsInteractionModeOpen(false)} />
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto hide-scrollbar">
                          <ul className="flex flex-col">
                            <li
                              onClick={() => {
                                setInteractionMode('profile');
                                setRedirectUrl('');
                                setIsInteractionModeOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${interactionMode === 'profile' ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                            >
                              Digital Profile (Default)
                            </li>
                            <li
                              onClick={() => {
                                setInteractionMode('redirect');
                                setIsInteractionModeOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${interactionMode === 'redirect' ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                            >
                              Custom URL Redirect
                            </li>
                            
                            {userCircles.length === 1 && (
                              <li
                                onClick={() => {
                                  setInteractionMode('circle');
                                  setRedirectUrl(userCircles[0].invite_code);
                                  setIsInteractionModeOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${interactionMode === 'circle' ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                              >
                                Circle: {userCircles[0].name}
                              </li>
                            )}
                            
                            {userCircles.length > 1 && (
                              <li
                                onClick={() => {
                                  setInteractionMode('circle');
                                  setIsInteractionModeOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${interactionMode === 'circle' ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                              >
                                Circle Protocol
                              </li>
                            )}
                            
                            {userCircles.length === 0 && (
                              <li
                                className="w-full text-left px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                              >
                                Circle Protocol (No circles found)
                              </li>
                            )}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {interactionMode === 'circle' && userCircles.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Select Circle
                    </label>
                    <div className="relative">
                      <input type="hidden" name="redirectUrl" value={redirectUrl} />
                      <button
                        type="button"
                        onClick={() => setIsSelectCircleOpen(!isSelectCircleOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white"
                      >
                        <span className="truncate">
                          {redirectUrl ? userCircles.find(c => c.invite_code === redirectUrl)?.name || 'Choose a circle...' : 'Choose a circle...'}
                        </span>
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                      </button>
                      
                      {isSelectCircleOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsSelectCircleOpen(false)} />
                          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto hide-scrollbar">
                            <ul className="flex flex-col">
                              <li
                                onClick={() => {
                                  setRedirectUrl('');
                                  setIsSelectCircleOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${!redirectUrl ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                              >
                                Choose a circle...
                              </li>
                              {userCircles.map(c => (
                                <li
                                  key={c.id}
                                  onClick={() => {
                                    setRedirectUrl(c.invite_code);
                                    setIsSelectCircleOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${redirectUrl === c.invite_code ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                                >
                                  {c.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Tag will redirect to the smart scan flow for this circle.
                    </p>
                  </div>
                )}

                {interactionMode === 'redirect' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Redirect Destination
                      </label>
                      <div className="relative">
                        <input type="hidden" name="customRedirectMode" value={customRedirectMode} />
                        <button
                          type="button"
                          onClick={() => setIsRedirectDestOpen(!isRedirectDestOpen)}
                          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white"
                        >
                          <span className="truncate">
                            {customRedirectMode === 'custom' ? 'Custom URL...' : 
                             (userLinks.find(l => l.url === redirectUrl)?.title || userLinks.find(l => l.url === redirectUrl)?.url || 'Custom URL...')}
                          </span>
                          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                        </button>
                        
                        {isRedirectDestOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsRedirectDestOpen(false)} />
                            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto hide-scrollbar">
                              <ul className="flex flex-col">
                                <li
                                  onClick={() => {
                                    setCustomRedirectMode('custom');
                                    setRedirectUrl('');
                                    setIsRedirectDestOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${customRedirectMode === 'custom' ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                                >
                                  Custom URL...
                                </li>
                                {userLinks.map(link => (
                                  <li
                                    key={link.id}
                                    onClick={() => {
                                      setCustomRedirectMode('link');
                                      setRedirectUrl(link.url);
                                      setIsRedirectDestOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${customRedirectMode === 'link' && redirectUrl === link.url ? 'bg-gray-100 text-slate-900 font-medium' : 'text-slate-600'}`}
                                  >
                                    {link.title || link.url}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {(customRedirectMode === 'custom' || !userLinks.find(l => l.url === redirectUrl)) && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Custom URL
                        </label>
                        <input
                          type="url"
                          required
                          value={redirectUrl}
                          onChange={(e) => setRedirectUrl(e.target.value)}
                          placeholder="Redirect URL"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 flex flex-col items-center gap-3">
                  {error && (
                    <span className="flex items-center text-sm text-red-600 font-medium animate-in fade-in slide-in-from-bottom-2 text-center">
                      <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
                      {error}
                    </span>
                  )}
                  {success && (
                    <span className="flex items-center text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-bottom-2 text-center">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
                      {success}
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
