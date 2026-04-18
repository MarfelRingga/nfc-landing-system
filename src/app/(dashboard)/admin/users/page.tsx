'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, User, Mail, Phone, Shield, Copy, Check, AlertCircle, Trash2, X, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [adminToggleInfo, setAdminToggleInfo] = useState<{ userId: string; currentStatus: boolean } | null>(null);
  const [resetCodeInfo, setResetCodeInfo] = useState<{ userId: string; phone: string } | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    setAdminToggleInfo({ userId, currentStatus });
  };

  const confirmToggleAdmin = async () => {
    if (!adminToggleInfo) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !adminToggleInfo.currentStatus })
        .eq('id', adminToggleInfo.userId);

      if (error) throw error;
      fetchUsers();
      setAdminToggleInfo(null);
    } catch (err: any) {
      console.error('Error updating admin status:', err);
      setErrorMessage(err.message || 'Failed to update admin status');
    }
  };

  const generateResetCode = async () => {
    if (!resetCodeInfo) return;
    setIsGeneratingCode(true);
    setErrorMessage(null);

    try {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { error } = await supabase
        .from('reset_codes')
        .insert({
          phone: resetCodeInfo.phone,
          secret_code: code,
          is_used: false
        });

      if (error) throw error;
      
      setGeneratedCode(code);
    } catch (err: any) {
      console.error('Error generating reset code:', err);
      setErrorMessage(err.message || 'Failed to generate reset code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const closeResetCodeModal = () => {
    setResetCodeInfo(null);
    setGeneratedCode(null);
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.includes(searchQuery)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Admin Toggle Confirmation Modal */}
      <AnimatePresence>
        {adminToggleInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {adminToggleInfo.currentStatus ? 'Revoke Admin?' : 'Grant Admin?'}
              </h3>
              <p className="text-slate-500 mb-6">
                Are you sure you want to {adminToggleInfo.currentStatus ? 'remove' : 'grant'} admin rights for this user?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAdminToggleInfo(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggleAdmin}
                  className={`flex-1 px-4 py-2 text-white rounded-xl font-bold transition-colors ${
                    adminToggleInfo.currentStatus ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Code Modal */}
      <AnimatePresence>
        {resetCodeInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 text-center"
            >
              <div className="flex justify-end mb-2">
                <button 
                  onClick={closeResetCodeModal}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">Generate Reset Code</h3>
              
              {!generatedCode ? (
                <>
                  <p className="text-slate-500 mb-6">
                    Generate a password reset code for phone number: <br/>
                    <strong className="text-slate-700">{resetCodeInfo.phone}</strong>
                  </p>
                  <button
                    onClick={generateResetCode}
                    disabled={isGeneratingCode}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isGeneratingCode ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                    ) : (
                      'Generate 6-Digit Code'
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-2">Share this code with the user:</p>
                    <div className="flex items-center justify-center gap-3">
                      <code className="text-4xl font-mono font-bold tracking-widest text-slate-900">
                        {generatedCode}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(generatedCode)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Copy Code"
                      >
                        {copiedId === generatedCode ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={closeResetCodeModal}
                    className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users Management</h1>
          <p className="text-slate-500">View and manage all registered users</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
          />
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
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">User ID</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.full_name || 'Unnamed'}</div>
                          <div className="text-slate-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 space-y-1">
                        {user.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                          {user.id}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(user.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          title="Copy User ID"
                        >
                          {copiedId === user.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_admin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.phone && (
                          <button
                            onClick={() => setResetCodeInfo({ userId: user.id, phone: user.phone! })}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Generate Reset Code"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            user.is_admin 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          {user.is_admin ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
