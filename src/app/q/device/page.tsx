'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Admin1Page from '@/components/Admin1Page';
import Admin2Page from '@/components/Admin2Page';
import BoothPage from '@/components/BoothPage';

function DeviceContent() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<'admin1' | 'admin2' | 'booth' | null>(null);
  const [code, setCode] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const urlRole = searchParams.get('role');
    const urlCode = searchParams.get('code');
    if (urlRole) setRole(urlRole as 'admin1' | 'admin2' | 'booth');
    if (urlCode) setCode(urlCode);
  }, [searchParams]);
  
  useEffect(() => {
    if (code && role) {
      // Resolve code to eventId
      fetch(`/api/events/resolve?code=${code}`)
        .then(res => res.json())
        .then(data => {
           if (data.success && data.event_id) {
             setEventId(data.event_id);
           } else {
             setError('Invalid Event Code. Please check the code and try again.');
           }
        })
        .catch(err => {
           setError('Network error resolving event code.');
        });
    }
  }, [code, role]);

  if (!code || (!eventId && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-sm w-full">
          <h1 className="text-xl font-bold mb-4">Enter Invitation Code</h1>
          <input 
             type="text" 
             className="w-full px-4 py-3 rounded-lg border font-mono text-center text-lg"
             placeholder="PB-XXXX"
             value={code}
             onChange={e => setCode(e.target.value)}
          />
          <select 
            value={role || ''} 
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full mt-4 px-4 py-3 rounded-lg border"
          >
            <option value="">Select Role/Device Type</option>
            <option value="booth">Booth Display Screen</option>
            <option value="admin1">Mobile Scanner (Admin 1)</option>
            <option value="admin2">Cashier Dashboard (Admin 2)</option>
          </select>
          <button 
            className="w-full mt-6 bg-slate-900 text-white rounded-lg px-4 py-3 font-semibold disabled:opacity-50"
            disabled={!code || !role}
            onClick={() => window.location.href = `/q/device?code=${code}&role=${role}`}
          >
            Activate Device
          </button>
        </div>
      </div>
    );
  }

  if (error) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
          <div className="bg-white p-8 rounded-2xl border border-red-200">
             <h2 className="text-red-500 font-bold mb-2">Error</h2>
             <p>{error}</p>
             <button onClick={() => window.location.href='/q/device'} className="mt-4 text-indigo-600 underline text-sm">Kembali</button>
          </div>
       </div>
     );
  }

  // Render role-specific component
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white text-xs px-4 py-2 flex justify-between items-center">
        <span>Connected to Event: <span className="font-mono">{code}</span> (ID: {eventId})</span>
        <span className="uppercase text-[10px] tracking-wider opacity-70 border px-2 py-0.5 rounded">{role}</span>
      </div>
      <div>
        {role === 'admin1' && eventId && <Admin1Page eventId={eventId} />}
        {role === 'admin2' && eventId && <Admin2Page eventId={eventId} />}
        {role === 'booth' && eventId && <BoothPage eventId={eventId} />}
      </div>
    </div>
  );
}

export default function StandaloneDevicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div></div>}>
      <DeviceContent />
    </Suspense>
  );
}

