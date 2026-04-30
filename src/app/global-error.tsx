'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the global root error to our Telegram bot
    const notifyError = async () => {
      try {
        await fetch('/api/notify-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            url: window?.location?.href || 'Root Layout Error',
            customContext: 'Next.js Global Root Error (Site Down)',
          }),
        });
      } catch (err) {
        console.error('Failed to report global error to Telegram', err);
      }
    };
    
    notifyError();
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f3ee] p-6 text-[#1a1a1a] font-sans text-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-200/50 mb-6">
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 00-12.728 0M15.536 8.464a5 5 0 00-7.072 0M12 13v.01M12 19h.01" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 tracking-tight">Connection Lost</h2>
          <p className="text-slate-500 mb-8 text-sm max-w-xs leading-relaxed">
            We're having trouble connecting to the server. Please check your internet and try again.
          </p>
          <button
            onClick={() => reset()}
            className="bg-[#1a1a1a] text-white py-2.5 px-6 rounded-full text-sm font-medium hover:bg-black transition-colors shadow-sm active:scale-95"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
