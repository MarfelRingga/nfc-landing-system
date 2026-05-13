'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Users, Smartphone, HelpCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function QueueHubPage() {
  const params = useParams();
  const code = params.code as string;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      if (!code) return;
      try {
        const res = await fetch('/api/events');
        const json = await res.json();
        if (json.data) {
          const pbEvent = json.data.find((e: any) => e.event_code === code);
          if (pbEvent) setEvent(pbEvent);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [code]);

  if (loading) return <div className="p-8 flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div></div>;
  if (!event) return <div className="p-8 text-center text-red-500">Event not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.name}</h1>
        <p className="text-slate-500">Access your queue terminals below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booth Display */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:border-indigo-200 transition-colors">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Display Device</h3>
          <p className="text-sm text-slate-500 flex-1 mb-6">Open this on your main tablet or screen facing the customers.</p>
          <a
            href={`/q/device?code=${event.event_code}&role=booth`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            Launch Display
          </a>
        </div>

        {/* Mobile Admin */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:border-blue-200 transition-colors">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
            <Smartphone className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Mobile Operator</h3>
          <p className="text-sm text-slate-500 flex-1 mb-6">Control the queue remotely and upload results.</p>
          <a
            href={`/q/device?code=${event.event_code}&role=admin1`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Launch Mobile Admin
          </a>
        </div>

        {/* Cashier */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:border-emerald-200 transition-colors">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Cashier Terminal</h3>
          <p className="text-sm text-slate-500 flex-1 mb-6">Manage the queue and call customers when it's their turn.</p>
          <a
            href={`/q/device?code=${event.event_code}&role=admin2`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
          >
            Launch Cashier
          </a>
        </div>
      </div>
    </div>
  );
}
