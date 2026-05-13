'use client';

import React, { Suspense } from 'react';
import CustomerPage from '@/components/CustomerPage';

export default function QueueStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div></div>}>
      <CustomerPage />
    </Suspense>
  );
}
