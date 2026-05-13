'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    const notify404 = async () => {
      try {
        await fetch('/api/notify-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `404 Page Not Found`,
            stack: `User tried to access a non-existent URL`,
            url: window.location.href,
            customContext: '404 Tracking',
          }),
        });
      } catch (err) {
        // Silent catch
      }
    };
    
    notify404();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-block w-full bg-black text-white rounded-xl py-3 font-semibold hover:bg-slate-800 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
