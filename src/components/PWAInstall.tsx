'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Safely Register Service Worker without blocking main thread
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.warn('Service Worker registration failed or blocked:', err);
          });
        });
    }

    // Capture the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait a moment before showing to not bombard the user immediately on load
      setTimeout(() => setShowInstall(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Hide install prompt when installed natively
    window.addEventListener('appinstalled', () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the native prompt
    deferredPrompt.prompt();
    
    // Wait for the user's choice
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    
    // Clear the prompt
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-6 right-6 z-[9999]"
        >
          <button
            onClick={handleInstall}
            className="flex items-center gap-2.5 px-5 py-3.5 bg-[#1A1A1A] text-white rounded-full shadow-2xl hover:bg-[#0c0e0b] hover:shadow-xl active:scale-95 transition-all outline outline-4 outline-white/50 backdrop-blur-md"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide">Install App</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
