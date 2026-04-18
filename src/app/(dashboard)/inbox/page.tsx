'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, MessageSquare, Trash2, Clock, AlertCircle, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ProfileMessage = {
  id: string;
  sender_name: string | null;
  message_content: string;
  created_at: string;
};

export default function InboxPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ProfileMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        if (userError.message.includes('Refresh Token Not Found') || userError.message.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }
      }
      if (!user) return;

      const { data, error } = await supabase
        .from('profile_messages')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(null);
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('profile_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
      setErrorMessage('Failed to delete message');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        <p className="text-sm text-slate-500 font-medium">Loading inbox...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inbox</h1>
        <p className="text-slate-500">Messages left by visitors on your public profile.</p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No messages yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            When someone leaves a message on your public profile, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-slate-300 transition-colors"
            >
              <button
                onClick={() => setDeleteId(msg.id)}
                disabled={isDeleting === msg.id}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all disabled:opacity-50"
                title="Delete message"
              >
                {isDeleting === msg.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>

              <div className="mb-3 pr-8">
                <h3 className="font-semibold text-slate-900">
                  {msg.sender_name || 'Anonymous'}
                </h3>
                <div className="flex items-center text-xs text-slate-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm whitespace-pre-wrap">
                {msg.message_content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Message</h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete this message? This action cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => setDeleteId(null)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDelete(deleteId)}
                    className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {errorMessage && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Error</h3>
                <p className="text-sm text-slate-500">
                  {errorMessage}
                </p>
                <button 
                  onClick={() => setErrorMessage(null)}
                  className="mt-6 w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
