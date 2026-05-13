'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

type Queue = {
  id: string;
  queue_number: number;
  customer_name?: string;
  user_name?: string;
  status: string;
};

export default function BoothPage({ eventId }: { eventId: string }) {
  const [currentQueue, setCurrentQueue] = useState<Queue | null>(null);
  const [nextQueues, setNextQueues] = useState<Queue[]>([]);
  const [theme, setTheme] = useState({ backgroundColor: '#111827', textColor: '#ffffff', primaryColor: '#4f46e5' });
  const [eventName, setEventName] = useState('DISPLAY ANTREAN');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
        if (data) {
          let parsed: any = { name: data.name };
          try {
            const p = JSON.parse(data.name);
            parsed = { ...parsed, ...p };
          } catch(e) {}
          setEventName(parsed.name?.toUpperCase() || 'DISPLAY ANTREAN');
          if (parsed.display_theme) {
            setTheme(parsed.display_theme);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchEvent();
    const fetchCurrentQueue = async () => {
      try {
        const res = await fetch(`/api/queue/current?event_id=${eventId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCurrentQueue(data.current_queue);
            setNextQueues(data.next_queues || []);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    let channel: any = null;

    const setupRealtime = () => {
      if (channel) return;
      channel = supabase
        .channel(`booth-${eventId}`)
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

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
      <header className="p-8 text-center shadow-md pb-4 border-b border-white/10" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <h1 className="text-4xl font-black tracking-widest uppercase">
          {eventName}
        </h1>
        <p className="text-xl mt-2 opacity-70">Daftar Antrean</p>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-8 gap-8 items-stretch">
        
        {/* Panel Sesi Saat Ini */}
        <div className="flex-1 flex flex-col justify-center items-center rounded-3xl p-8 lg:p-12 shadow-2xl border-4 text-center overflow-hidden relative" style={{ backgroundColor: theme.primaryColor, borderColor: '#ffffff30' }}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-widest mb-8 opacity-80 backdrop-blur-sm">
            Panggilan Saat Ini
          </h2>
          
          <AnimatePresence mode="wait">
            {currentQueue ? (
              <motion.div 
                key={currentQueue.id}
                initial={{ scale: 0.8, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0, y: -30 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="space-y-6 w-full"
              >
                <p className="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] font-black drop-shadow-lg leading-none">
                  #{currentQueue.queue_number}
                </p>
                {(currentQueue.user_name || currentQueue.customer_name) && (
                  <p className="text-3xl md:text-5xl font-bold mb-4 opacity-90 truncate max-w-full px-4">
                    {currentQueue.user_name || currentQueue.customer_name}
                  </p>
                )}
                <p className="text-xl md:text-2xl font-medium px-8 py-3 rounded-full inline-block mt-4 whitespace-nowrap" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                  Silakan menuju meja layanan
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <p className="text-4xl md:text-5xl font-bold opacity-80">
                  BELUM ADA ANTRIAN
                </p>
                <p className="text-lg md:text-xl opacity-70">
                  Menunggu panggilan dari admin...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Panel Antrean Berikutnya */}
        <div className="w-full lg:w-1/3 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col relative overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-6 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', color: theme.primaryColor }}>
            Antrean Berikutnya
          </h3>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {nextQueues.length > 0 ? (
                nextQueues.map((queue, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50, height: 0, padding: 0, margin: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    key={queue.id}
                    className="flex items-center justify-between p-4 lg:p-6 rounded-2xl border flex-shrink-0"
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <span className="text-xl font-medium opacity-60">
                      {index + 1}.
                    </span>
                    <div className="text-right max-w-[70%]">
                      <span className="text-4xl md:text-5xl font-bold block">
                        #{queue.queue_number}
                      </span>
                      {(queue.user_name || queue.customer_name) && (
                        <span className="text-base md:text-lg mt-1 block opacity-80 truncate">
                          {queue.user_name || queue.customer_name}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center min-h-[200px]"
                >
                  <p className="text-xl italic opacity-50">
                    Antrean sedang kosong.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center shadow-inner" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <p className="text-lg opacity-60">Silakan antre sesuai dengan urutan nomor Anda.</p>
      </footer>
    </div>
  );
}

