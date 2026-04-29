'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our Telegram bot
    const notifyError = async () => {
      try {
        await fetch('/api/notify-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            customContext: 'Next.js App Router ErrorBoundary',
          }),
        });
      } catch (err) {
        console.error('Failed to report error to Telegram', err);
      }
    };
    
    notifyError();
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f3ee] p-4 text-[#1a1a1a] font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-[#e5e5e5]">
        <h2 className="text-2xl font-bold mb-4 tracking-tight">Something went wrong</h2>
        <p className="text-gray-600 mb-8 text-sm">
          We have been notified about this issue. Please try refreshing or returning home.
        </p>
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="w-full bg-[#1a1a1a] text-white py-3 px-4 rounded-xl font-medium hover:bg-black transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
