'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

interface MessageFormProps {
  profileId: string;
  placeholderName: string;
  placeholderContent: string;
  themeColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    inputBg?: string;
    inputBorder?: string;
  };
  themePreset?: string;
}

const COOLDOWN_SECONDS = 60;

export default function MessageForm({ profileId, placeholderName, placeholderContent, themeColors, themePreset = 'minimal' }: MessageFormProps) {
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

  const inputStyles = {
    background: themeColors?.inputBg || themeColors?.background || '#ffffff',
    color: themeColors?.text || '#111827',
    borderColor: themeColors?.inputBorder || `${themeColors?.text}20`,
  };

  const buttonStyle = {
    background: themeColors?.primary || '#111827',
    color: '#ffffff',
  };

  return (
    <div className="mt-8 pt-8">
      <div className="mb-6">
        <h2 className="text-lg font-bold" style={{ color: themeColors?.text }}>Leave a Message</h2>
        <p className="text-sm opacity-60 mt-1" style={{ color: themeColors?.text }}>Send a secret message or say hello.</p>
      </div>

      <div className="relative grid">
        <form 
          onSubmit={handleSubmit} 
          className={`col-start-1 row-start-1 space-y-4 transition-all duration-300 ${isSuccess ? 'opacity-0 pointer-events-none invisible' : 'opacity-100'}`}
        >
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
              style={inputStyles}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm"
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
              style={inputStyles}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm resize-none"
              maxLength={1000}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !message.trim() || cooldownLeft > 0}
            style={buttonStyle}
            className="w-full flex items-center justify-center px-6 py-3 text-sm font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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

        {isSuccess && (
          <div 
            className="col-start-1 row-start-1 h-full w-full rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 z-10"
            style={{
              background: themeColors?.inputBg || `${themeColors?.primary}10`,
              border: `1px solid ${themeColors?.inputBorder || `${themeColors?.primary}20`}`
            }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: `${themeColors?.primary}20` }}
            >
              <CheckCircle2 className="w-6 h-6" style={{ color: themeColors?.primary }} />
            </div>
            <h3 className="font-semibold" style={{ color: themeColors?.text }}>Message Sent!</h3>
            <p className="text-sm mt-1 opacity-70" style={{ color: themeColors?.text }}>Your message has been securely delivered.</p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="mt-6 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: themeColors?.primary }}
            >
              Send another message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
