'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type QueueStatus = {
  id: string;
  queue_number: number;
  status: string;
  queue_ahead?: number;
};

function CustomerStatus({ queueId: propQueueId }: { queueId?: string | null }) {
  const searchParams = useSearchParams();
  const queueId = propQueueId || searchParams.get('queue_id');

  const [queueInfo, setQueueInfo] = useState<(QueueStatus & { event_id?: number }) | null>(null);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    if (!queueId) return;
    try {
      const res = await fetch(`/api/queue/status?queue_id=${queueId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.queue) {
          setQueueInfo(data.queue);
          setError('');
        } else {
          setError(data.error || 'Antrean tidak ditemukan.');
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    if (!queueId) {
      setError('Parameter queue_id tidak ditemukan.');
      return;
    }

    fetchStatus();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queueId]);

  useEffect(() => {
    if (!queueInfo?.event_id || !queueId) return;

    const channel = supabase
      .channel(`customer-${queueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queues', filter: `event_id=eq.${queueInfo.event_id}` },
        () => {
          fetchStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueInfo?.event_id, queueId]);

  if (error) {
    return (
      <div className="w-full max-w-sm p-6 text-center bg-white rounded-2xl shadow-sm border border-red-100">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!queueInfo) {
    return (
      <div className="w-full max-w-sm p-6 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[200px]">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin"></div>
      </div>
    );
  }

  const queueUrl = typeof window !== 'undefined' ? `${window.location.origin}/q?queue_id=${queueId}` : '';

  const handleCopy = () => {
    if (queueUrl) {
      navigator.clipboard.writeText(queueUrl);
      alert('Link antrean berhasil disalin!');
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center bg-white rounded-3xl shadow-md border border-gray-100 p-8 text-center space-y-6">
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
          Nomor Antrean Anda
        </p>
        <p className="text-7xl font-black text-indigo-600">
          #{queueInfo.queue_number}
        </p>
      </div>

      <div className={`w-full p-4 rounded-2xl ${
        queueInfo.status === 'CALLED' 
          ? 'bg-emerald-100 text-emerald-800' 
          : queueInfo.status === 'DONE'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-amber-100 text-amber-800'
      }`}>
        <p className="text-2xl font-bold uppercase tracking-wide">
          {queueInfo.status}
        </p>
        {queueInfo.status === 'WAITING' && queueInfo.queue_ahead !== undefined && (
          <p className="text-sm font-medium mt-1">
            {queueInfo.queue_ahead} orang di depan Anda
          </p>
        )}
        {queueInfo.status === 'CALLED' && (
          <p className="text-sm font-bold mt-1">
            Silakan menuju tempat layanan sekarang!
          </p>
        )}
        {queueInfo.status === 'DONE' && (
          <p className="text-sm font-medium mt-1">
            Sesi selesai. Terima kasih!
          </p>
        )}
      </div>

      <button
        onClick={handleCopy}
        className="mt-4 px-4 py-2 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-medium border border-slate-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        Salin Link Status
      </button>
    </div>
  );
}

export default function CustomerPage({ queueId }: { queueId?: string | null }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Queue Status</h1>
        <p className="text-sm text-gray-500">Live Queue Monitor</p>
      </header>

      <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin"></div></div>}>
        <CustomerStatus queueId={queueId} />
      </Suspense>
    </div>
  );
}
