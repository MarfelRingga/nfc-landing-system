'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Smartphone, Search, X, AlertCircle, CheckCircle2, Copy, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NFCTag {
  id: string;
  token: string;
  tag_name: string | null;
  user_id: string | null;
  status: string;
  created_at: string;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<NFCTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Tag Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('/api/admin/tags', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch tags');
      
      const data = await response.json();
      setTags(data.tags || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const generateRandomToken = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewToken(result);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ token: newToken.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tag');
      }

      setSuccess('Tag created successfully!');
      setNewToken('');
      setTimeout(() => {
        setIsAddModalOpen(false);
        setSuccess(null);
        fetchTags();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`/api/admin/tags?id=${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete tag');
      }
      
      fetchTags();
      setDeleteId(null);
    } catch (err: any) {
      console.error('Error deleting tag:', err);
      setErrorMessage(err.message || 'Failed to delete tag');
    }
  };

  const filteredTags = tags.filter(t => 
    t.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tag_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_id?.includes(searchQuery)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">NFC Tags Management</h1>
          <p className="text-slate-500">Create and manage physical NFC tags in the system</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Tag
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Token</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Claimed By (User ID)</th>
                  <th className="px-6 py-4 font-medium">Claim Date</th>
                  <th className="px-6 py-4 font-medium">Tag Name</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {tag.token}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(`${window.location.origin}/t/${tag.token}`)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === `${window.location.origin}/t/${tag.token}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tag.user_id ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Claimed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {tag.user_id ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {tag.user_id}
                          </code>
                          <button 
                            onClick={() => copyToClipboard(tag.user_id!)}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Copy User ID"
                          >
                            {copiedId === tag.user_id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {tag.user_id && tag.created_at ? new Date(tag.created_at).toLocaleDateString() : <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {tag.tag_name || <span className="text-slate-400 italic text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteTag(tag.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Tag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTags.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No tags found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Tag?</h3>
              <p className="text-slate-500 mb-6">
                Are you sure you want to permanently delete this tag? This action cannot be undone.
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
                  Delete
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Create New Tag</h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateTag} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tag Token (Unique ID)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value)}
                      placeholder="8-character tag code"
                      className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={generateRandomToken}
                      className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                      title="Generate Random Token"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    This is the code that users will enter to claim the tag.
                  </p>
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
                    disabled={isSubmitting || !newToken.trim()}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Tag'
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
