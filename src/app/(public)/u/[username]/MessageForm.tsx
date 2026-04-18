'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

interface MessageFormProps {
  profileId: string;
  placeholderName: string;
  placeholderContent: string;
}

const COOLDOWN_SECONDS = 60;

export default function MessageForm({ profileId, placeholderName, placeholderContent }: MessageFormProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // State untuk Honeypot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [cooldownLeft, setCooldownLeft] = useState(0);

  // Cek localStorage saat komponen dimuat untuk melihat apakah user masih dalam masa cooldown
  useEffect(() => {
    const lastSent = localStorage.getItem(`last_message_sent_${profileId}`);
    if (lastSent) {
      const timePassed = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
      if (timePassed < COOLDOWN_SECONDS) {
        setCooldownLeft(COOLDOWN_SECONDS - timePassed);
      }
    }
  }, [profileId]);

  // Efek untuk menjalankan timer hitung mundur cooldown
  useEffect(() => {
    if (cooldownLeft > 0) {
      const timer = setInterval(() => {
        setCooldownLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. PENGECEKAN HONEYPOT (Jebakan Bot)
    if (honeypot) {
      // Jika honeypot terisi, kita pura-pura berhasil agar bot mengira spam-nya masuk.
      // Padahal kita tidak mengirim apa-apa ke database.
      setIsSuccess(true);
      setName('');
      setMessage('');
      setHoneypot('');
      setTimeout(() => setIsSuccess(false), 5000);
      return;
    }

    // 2. PENGECEKAN COOLDOWN
    if (cooldownLeft > 0) {
      setError(`Please wait ${cooldownLeft} seconds before sending another message.`);
      return;
    }

    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('profile_messages')
        .insert({
          profile_id: profileId,
          sender_name: name.trim() || null,
          message_content: message.trim()
        });

      if (submitError) throw submitError;

      // Jika berhasil
      setIsSuccess(true);
      setName('');
      setMessage('');
      
      // Catat waktu pengiriman di localStorage dan mulai cooldown
      localStorage.setItem(`last_message_sent_${profileId}`, Date.now().toString());
      setCooldownLeft(COOLDOWN_SECONDS);
      
      // Hilangkan pesan sukses setelah 5 detik
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-100">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">Leave a Message</h2>
        <p className="text-sm text-slate-500 mt-1">Send a secret message or say hello.</p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-emerald-900 font-semibold">Message Sent!</h3>
          <p className="text-emerald-700 text-sm mt-1">Your message has been securely delivered.</p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
          {/* HONEYPOT FIELD - Tidak terlihat oleh manusia, tapi terlihat oleh Bot */}
          <div className="absolute opacity-0 -z-10 w-0 h-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholderName}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm"
              maxLength={50}
            />
          </div>
          
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholderContent}
              required
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm resize-none"
              maxLength={1000}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !message.trim() || cooldownLeft > 0}
            className="w-full flex items-center justify-center px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : cooldownLeft > 0 ? (
              <>Wait {cooldownLeft}s to send again</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
