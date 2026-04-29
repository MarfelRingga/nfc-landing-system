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
        <div className="min-h-screen flex items-center justify-center bg-[#f4f3ee] p-4 text-[#1a1a1a] font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-[#e5e5e5]">
            <h2 className="text-2xl font-bold mb-4 tracking-tight">Critical Error 🚨</h2>
            <p className="text-gray-600 mb-8 text-sm">
              The application encountered a critical error. The developers have been notified.
            </p>
            <button
              onClick={() => reset()}
              className="w-full bg-[#1a1a1a] text-white py-3 px-4 rounded-xl font-medium hover:bg-black transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
