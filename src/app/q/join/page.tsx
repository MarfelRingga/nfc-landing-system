'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CustomerPage from '@/components/CustomerPage';

function JoinContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event_id');
  const token = searchParams.get('token');

  const [joined, setJoined] = useState(false);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          token,
          name: name.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setQueueId(String(data.queue_id));
        setJoined(true);
      } else {
        setError(data.error || 'Gagal bergabung ke antrean. Mohon periksa token Anda.');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!eventId || !token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <h1 className="text-xl font-bold">Invalid Join Link</h1>
        <p className="text-slate-500">Missing Event ID or Token</p>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Queue Registration</h1>
          <p className="text-slate-500 text-center mb-8 text-sm">Please enter your name to join the queue</p>
          
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Your Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                required
                disabled={isSubmitting}
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Join Queue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Setelah berhasil Join Queue, tampilkan Customer Page
  return (
    <div className="min-h-screen bg-slate-50">
       {/* Use key to force unmount completely if needed but simple condition is okay */}
      <CustomerPage queueId={queueId} />
    </div>
  );
}

export default function QueueJoinPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div></div>}>
      <JoinContent />
    </React.Suspense>
  );
}

