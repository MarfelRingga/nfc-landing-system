'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Plus, Camera, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

export default function AdminPhotoboothPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventCode, setNewEventCode] = useState('');
  const [newEventContact, setNewEventContact] = useState('');
  const [requireAttachment, setRequireAttachment] = useState(true);
  const [themeBg, setThemeBg] = useState('#111827');
  const [themeText, setThemeText] = useState('#ffffff');
  const [themePrimary, setThemePrimary] = useState('#4f46e5');

  useEffect(() => {
    fetchEvents();
  }, []);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for ( let i = 0; i < 8; i++ ) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewEventCode(result);
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/events');
      const json = await res.json();
      if (json.data) {
        setEvents(json.data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const createEvent = async () => {
    if (!newEventName || !newEventCode) {
      alert("Name and Event ID/Code are required");
      return;
    }
    setIsCreating(true);
    try {
      const display_theme = { backgroundColor: themeBg, textColor: themeText, primaryColor: themePrimary };
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEventName, event_code: newEventCode, contact: newEventContact, require_attachment: requireAttachment, display_theme })
      });
      const json = await res.json();
      
      if (!res.ok || json.error) {
        console.error("Error creating event:", json.error);
        alert(`Failed to create event: ${json.error}`);
      } else if (json.data) {
        setEvents([json.data, ...events]);
        setNewEventName('');
        setNewEventCode('');
        setNewEventContact('');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
    setIsCreating(false);
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Queue Management</h1>
          <p className="text-slate-500 text-sm">Manage events and generate invitation codes for queue clients.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 text-center">Standalone Device Setup</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <div className="flex-1 max-w-sm text-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Camera className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Open Standalone Terminal</h3>
                <p className="text-xs text-slate-500 mb-3">Copy this link and open it on your Standalone Tablet or Display Device.</p>
                <div className="bg-white border rounded truncate p-2 text-xs font-mono text-slate-600">
                   {typeof window !== 'undefined' ? `${window.location.origin}/q/device` : '/q/device'}
                </div>
             </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-800">Create New Event</h2>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-slate-600">Event Name</label>
            <input 
              type="text" 
              placeholder="E.g. Wedding Party" 
              className="w-full px-4 py-2 border rounded-xl"
              value={newEventName}
              onChange={e => setNewEventName(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-slate-600">Event ID (Join Code)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="E.g. PB-X123G" 
                className="w-full px-4 py-2 border rounded-xl"
                value={newEventCode}
                onChange={e => setNewEventCode(e.target.value)}
              />
              <button onClick={generateRandomCode} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-medium text-sm border whitespace-nowrap">
                Generate
              </button>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-slate-600">Contact Event</label>
            <input 
              type="text" 
              placeholder="Contact Info" 
              className="w-full px-4 py-2 border rounded-xl"
              value={newEventContact}
              onChange={e => setNewEventContact(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-2 border-t pt-4">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={requireAttachment} onChange={(e) => setRequireAttachment(e.target.checked)} className="rounded text-indigo-600" />
            Require Attachment/Result
          </label>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500">Bg:</span>
              <input type="color" value={themeBg} onChange={e => setThemeBg(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500">Text:</span>
              <input type="color" value={themeText} onChange={e => setThemeText(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500">Brand:</span>
              <input type="color" value={themePrimary} onChange={e => setThemePrimary(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <button 
            onClick={createEvent} 
            disabled={isCreating || !newEventName || !newEventCode}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl shadow font-medium disabled:opacity-50 min-w-[120px] flex items-center justify-center"
          >
            {isCreating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Create Event'}
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        {events.length === 0 ? (
          <p className="text-center text-slate-500">No events found.</p>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{event.name}</h3>
                <p className="text-sm text-slate-500">Contact: {event.contact || '-'}</p>
                <p className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded mt-2 inline-block">
                  Invitation Code: {event.event_code || event.id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a href={`/q/device?code=${event.event_code || event.id}&role=booth`} target="_blank" rel="noreferrer" className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700">Display</a>
                <a href={`/q/device?code=${event.event_code || event.id}&role=admin1`} target="_blank" rel="noreferrer" className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700">Mobile Admin</a>
                <a href={`/q/device?code=${event.event_code || event.id}&role=admin2`} target="_blank" rel="noreferrer" className="px-3 py-2 text-sm bg-slate-900 hover:bg-slate-800 text-white rounded font-medium">Cashier</a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
