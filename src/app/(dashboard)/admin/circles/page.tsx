'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CircleDot, Plus, Trash2, Loader2, Save, RefreshCw } from 'lucide-react';

export default function AdminCirclesPage() {
  const router = useRouter();
  const [circles, setCircles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newCircle, setNewCircle] = useState({ name: '', description: '', invite_code: '', slug: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCircles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('circles')
        .select(`
          *,
          circle_members (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCircles(data || []);
    } catch (err) {
      console.error('Error fetching circles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCircles();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const oldBaseSlug = newCircle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const currentSlug = newCircle.slug;
    
    let newSlug = currentSlug;
    if (!currentSlug || currentSlug === oldBaseSlug) {
      newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    setNewCircle({ ...newCircle, name: newName, slug: newSlug });
  };

  const handleAddCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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

      let finalSlug = newCircle.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!finalSlug) {
        finalSlug = newCircle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        finalSlug = `${finalSlug}-${randomSuffix}`;
      }

      const { data: circle, error: insertError } = await supabase
        .from('circles')
        .insert({
          name: newCircle.name,
          description: newCircle.description,
          slug: finalSlug,
          invite_code: newCircle.invite_code.toUpperCase(),
          owner_id: session.user.id
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505' && insertError.message.includes('slug')) {
          throw new Error('This Custom URL (slug) is already taken. Please choose another one.');
        }
        throw insertError;
      }
      
      // Add creator as admin member
      if (circle) {
        const { error: memberError } = await supabase
          .from('circle_members')
          .insert({
            circle_id: circle.id,
            profile_id: session.user.id,
            role: 'Admin'
          });
        
        if (memberError) throw memberError;
      }

      setIsAddModalOpen(false);
      setNewCircle({ name: '', description: '', invite_code: '', slug: '' });
      setErrorMessage(null);
      fetchCircles();
    } catch (err: any) {
      console.error('Error adding circle:', err);
      setErrorMessage(err.message || 'Failed to create circle');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCircle = async () => {
    if (!deleteId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from('circles').delete().eq('id', deleteId);
      if (error) throw error;
      setDeleteId(null);
      setErrorMessage(null);
      fetchCircles();
    } catch (err: any) {
      console.error('Error deleting circle:', err);
      setErrorMessage(err.message || 'Failed to delete circle');
    } finally {
      setIsSaving(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCircle({ ...newCircle, invite_code: result });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Circle Management</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage private circles and invite codes.</p>
        </div>
        <button
          onClick={() => {
            setIsAddModalOpen(true);
            generateRandomCode();
          }}
          className="flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Circle
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Circle Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Invite Code</th>
                <th className="px-6 py-4 font-medium">Members</th>
                <th className="px-6 py-4 font-medium">Created At</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {circles.map((circle) => (
                <tr key={circle.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{circle.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{circle.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold tracking-wider">
                      {circle.slug || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold tracking-wider">
                      {circle.invite_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {circle.circle_members?.[0]?.count || 0}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(circle.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeleteId(circle.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Circle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {circles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No circles found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Circle</h2>
            <form onSubmit={handleAddCircle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Circle Name</label>
                <input
                  type="text"
                  required
                  value={newCircle.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Circle name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom URL (Slug)</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-slate-500 text-sm">
                    /c/
                  </span>
                  <input
                    type="text"
                    required
                    value={newCircle.slug}
                    onChange={(e) => setNewCircle({ ...newCircle, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Circle slug (URL-friendly)"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">This will be the public link to your circle.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newCircle.description}
                  onChange={(e) => setNewCircle({ ...newCircle, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  placeholder="Optional description..."
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invite Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCircle.invite_code}
                    onChange={(e) => setNewCircle({ ...newCircle, invite_code: e.target.value.toUpperCase() })}
                    className="flex-1 px-3 py-2 font-mono uppercase border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Claim token"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Users will enter this secret code to join the circle.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-6 pt-4 border-t border-slate-100">
                {errorMessage && (
                  <span className="flex items-center text-sm text-red-600 font-medium animate-in fade-in slide-in-from-right-4">
                    {errorMessage}
                  </span>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !newCircle.name || !newCircle.invite_code}
                    className="flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Create Circle
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Circle</h2>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete this circle? This action cannot be undone. All members and vault items will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCircle}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
