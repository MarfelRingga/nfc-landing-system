'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Queue = {
  id: string;
  queue_number: number;
  customer_name?: string;
  user_name?: string;
  status: string;
};

export default function Admin1Page({ eventId }: { eventId: string }) {
  const [currentQueue, setCurrentQueue] = useState<Queue | null>(null);
  const [nextQueuesCount, setNextQueuesCount] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [message, setMessage] = useState('');

  const [requireAttachment, setRequireAttachment] = useState(true);

  useEffect(() => {
    const fetchEventConfig = async () => {
      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
        if (data) {
          try {
            const p = JSON.parse(data.name);
            if (p.require_attachment !== undefined) {
              setRequireAttachment(p.require_attachment);
            }
          } catch(e) {}
        }
      } catch (err) {}
    }
    fetchEventConfig();

    const fetchCurrentQueue = async () => {
      try {
        const res = await fetch(`/api/queue/current?event_id=${eventId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCurrentQueue(data.current_queue);
            setNextQueuesCount(data.next_queues?.length || 0);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    let channel: any = null;

    const setupRealtime = () => {
      if (channel) return;
      channel = supabase
        .channel(`admin1-${eventId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'queues', filter: `event_id=eq.${eventId}` },
          () => {
            fetchCurrentQueue();
          }
        )
        .subscribe();
    };

    const cleanupRealtime = () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupRealtime();
      } else {
        fetchCurrentQueue();
        setupRealtime();
      }
    };

    fetchCurrentQueue();
    setupRealtime();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupRealtime();
    };
  }, [eventId]);

  const handleNext = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/queue/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await res.json();
      
      if (data.success) {
        setCurrentQueue(data.queue);
        setResultUrl(''); // Kosongkan input hasil foto
      } else {
        setMessage(data.error || 'Gagal memanggil antrean');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!currentQueue) return;
    if (requireAttachment && !resultUrl) {
      setMessage('URL hasil wajib diisi untuk antrean ini!');
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/result/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue_id: currentQueue.id,
          result_url: resultUrl || undefined,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage('Hasil berhasil disimpan!');
        setResultUrl('');
        // Tandai selesai dan hilangkan antrean saat ini (opsional, bisa tunggu polling)
        setCurrentQueue(null);
      } else {
        setMessage(data.error || 'Gagal menyimpan hasil');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 font-sans">
      <header className="py-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Mobile Admin</h1>
        <p className="text-sm text-gray-500">Mode Operasional Cepat</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto space-y-6">
        
        {/* Card Status Antrean */}
        <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center relative overflow-hidden">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            Status Saat Ini
          </h2>
          {isInitialLoad ? (
            <div className="space-y-4 py-4 animate-pulse">
              <div className="h-16 w-32 bg-gray-200 rounded-lg mx-auto"></div>
              <div className="h-6 w-40 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-4 w-48 bg-gray-200 rounded-full mx-auto"></div>
            </div>
          ) : currentQueue ? (
            <div className="space-y-2">
              <p className="text-7xl font-black text-indigo-600 tracking-tighter">#{currentQueue.queue_number}</p>
              <div className="inline-block mt-2 px-4 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full text-sm">
                Sedang Dilayani
              </div>
              <p className="text-base text-gray-600 font-medium mt-2">{currentQueue.user_name || currentQueue.customer_name || `Pelanggan #${currentQueue.queue_number}`}</p>
            </div>
          ) : (
            <div className="py-8 space-y-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-3xl font-bold text-gray-800">SELESAI</p>
              <p className="text-sm font-medium text-gray-500 bg-gray-100 py-1.5 px-4 rounded-full inline-block">
                {nextQueuesCount} antrean menunggu
              </p>
            </div>
          )}
        </div>

        {/* Notifikasi */}
        {message && (
          <div className="w-full p-4 rounded-xl bg-indigo-50 text-indigo-700 text-center text-sm font-semibold">
            {message}
          </div>
        )}

        {/* Tombol Utama */}
        <div className="w-full space-y-4 pt-4">
          
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="w-full py-5 rounded-2xl bg-indigo-600 active:bg-indigo-700 text-white font-black text-xl shadow-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:scale-100 touch-manipulation"
          >
            {isLoading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div> : 'PANGGIL NEXT'}
          </button>

          {/* Form Hasil (Hanya muncul jika ada antrean aktif) */}
          {currentQueue && (
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                {requireAttachment ? 'Simpan Lampiran / Hasil *' : 'Simpan Lampiran (Opsional)'}
              </label>
              <input
                type="url"
                value={resultUrl}
                onChange={(e) => setResultUrl(e.target.value)}
                placeholder={requireAttachment ? "Paste URL lampiran/hasil di sini..." : "Paste URL (jika ada)..."}
                className="w-full px-4 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-indigo-500 outline-none text-gray-800 transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={handleSaveResult}
                disabled={isLoading || (requireAttachment && !resultUrl)}
                className="w-full py-4 rounded-xl bg-emerald-500 active:bg-emerald-600 font-bold text-lg text-white shadow-md transition-transform transform active:scale-95 disabled:opacity-50 touch-manipulation flex items-center justify-center"
              >
                {isLoading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div> : (requireAttachment ? 'SIMPAN & SELESAI' : 'TANDAI SELESAI')}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}


