'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';

type Queue = {
  id: string;
  queue_number: number;
  customer_name?: string;
  user_name?: string;
  status: string;
};

export default function Admin2Page({ eventId }: { eventId: string }) {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [message, setMessage] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, queueId: string | null, action: string, title: string, desc: string }>({ isOpen: false, queueId: null, action: '', title: '', desc: '' });

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const res = await fetch(`/api/queue/current?event_id=${eventId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const combinedQueues: Queue[] = [];
            if (data.current_queue) combinedQueues.push(data.current_queue);
            if (data.next_queues) combinedQueues.push(...data.next_queues);
            setQueues(combinedQueues);
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
        .channel(`admin2-${eventId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'queues', filter: `event_id=eq.${eventId}` },
          () => {
            fetchQueues();
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
        fetchQueues();
        setupRealtime();
      }
    };

    fetchQueues();
    setupRealtime();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupRealtime();
    };
  }, [eventId]);

  const handleSkip = async (queueId: string, action: string = 'SKIPPED') => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (action === 'CANCELED') {
         // Perform DELETE request for Batal
         const res = await fetch(`/api/queue/skip?queue_id=${queueId}&action=CANCELED`, {
           method: 'DELETE',
         });
         const data = await res.json();
         if (data.success) {
           setMessage('Antrean berhasil dibatalkan (dihapus).');
         } else {
           setMessage(data.error || 'Gagal membatalkan antrean.');
         }
      } else {
        const res = await fetch('/api/queue/skip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queue_id: queueId,
            action: action
          }),
        });
        const data = await res.json();
        
        if (data.success) {
          setMessage(`Antrean berhasil di-${action.toLowerCase()}.`);
        } else {
          setMessage(data.error || 'Gagal mengubah antrean.');
        }
      }
    } catch (error) {
      setMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const confirmAction = (queueId: string, action: string) => {
    if (action === 'CANCELED') {
      setConfirmModal({ isOpen: true, queueId, action, title: 'Batalkan Antrean?', desc: 'Apakah Anda yakin ingin membatalkan (menghapus) antrean ini? Aksi ini tidak dapat dikembalikan.' });
    } else {
      setConfirmModal({ isOpen: true, queueId, action, title: 'Lewati Antrean?', desc: 'Pelanggan ini akan dilewati dan ditandai sebagai SKIPPED.' });
    }
  };

  const executeAction = () => {
    if (confirmModal.queueId) {
      handleSkip(confirmModal.queueId, confirmModal.action);
    }
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const handleWA = (queue: Queue) => {
    let text = `Halo ${queue.user_name || 'Pelanggan'} (Antrean #${queue.queue_number}), `;
    if (queue.status === 'WAITING') {
      text += `sebentar lagi giliran Anda. Mohon bersiap di area antrean.`;
    } else if (queue.status === 'CALLED') {
      text += `giliran Anda SEKARANG. Silakan menuju meja/lokasi layanan.`;
    }
    
    const dummyPhone = "6280000000000"; 
    const waUrl = `https://wa.me/${dummyPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleGenerateToken = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/token/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await res.json();
      
      if (data.success) {
        setGeneratedToken(data.token);
        setMessage(`Token baru berhasil dibuat: ${data.token}`);
      } else {
        setMessage(data.error || 'Gagal membuat token.');
      }
    } catch (err: any) {
      setMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-8 font-sans max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin 2 (Kasir Desktop)</h1>
        <p className="text-gray-500">Generate Queue Tokens & Monitor Live Queue</p>
      </header>

      {message && (
        <div className="p-3 bg-indigo-100 text-indigo-700 font-medium rounded animate-fade-in-up">
          {message}
        </div>
      )}

      {/* GENERATE TOKEN & DYNAMIC QR SECTION */}
      <div className="bg-white border text-center border-gray-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Generate Queue Access</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Generate one-time token for a customer. Customer can scan the QR Code to enter their details and join the queue.
          </p>
          <button 
            onClick={handleGenerateToken}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow transition-colors"
          >
            Generate New QR Token
          </button>
        </div>
        
        {generatedToken && (
          <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in zoom-in duration-300">
             <div className="bg-white p-3 rounded-lg mb-3 shadow-sm inline-block">
               <QRCodeSVG 
                 value={`${typeof window !== 'undefined' ? window.location.origin : ''}/q/join?event_id=${eventId}&token=${generatedToken}`} 
                 size={150} 
               />
             </div>
             <p className="font-mono font-bold tracking-widest text-lg text-slate-800">{generatedToken}</p>
             <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Scan to Join Queue</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-h-[60vh] overflow-y-auto relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 border-b border-gray-200 z-10 shadow-sm">
            <tr>
              <th className="p-4 font-semibold text-slate-600">ID Antrean</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600">Nama Pelanggan</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isInitialLoad ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  <div className="flex items-center justify-center space-x-2 animate-pulse">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  </div>
                </td>
              </tr>
            ) : queues.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-500">Antrean Kosong</p>
                  <p className="text-sm">Belum ada pelanggan yang mendaftar.</p>
                </td>
              </tr>
            ) : (
              queues.map((queue) => (
                <tr key={queue.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-900 font-bold text-lg">#{queue.queue_number}</td>
                  <td className="p-4">
                    <span 
                      className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        queue.status === 'CALLED' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : queue.status === 'DONE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : queue.status === 'SKIPPED'
                          ? 'bg-slate-50 text-slate-700 border-slate-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {queue.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-800 font-medium">{queue.user_name || queue.customer_name || `Pelanggan #${queue.queue_number}`}</td>
                  <td className="p-4 space-x-2 text-right w-64 whitespace-nowrap">
                    <button
                      onClick={() => handleWA(queue)}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors"
                    >
                      WA
                    </button>
                    <button
                      onClick={() => confirmAction(queue.id, 'SKIPPED')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => confirmAction(queue.id, 'CANCELED')}
                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded transition-colors"
                    >
                      Batal
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmModal.title}</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{confirmModal.desc}</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Kembali
              </button>
              <button 
                onClick={executeAction}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${confirmModal.action === 'CANCELED' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


