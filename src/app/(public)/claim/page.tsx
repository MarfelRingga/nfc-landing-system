'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ScanLine, ArrowRight, Loader2 } from 'lucide-react';

function ClaimContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Already logged in, redirect to tags page to claim
        router.push(`/tags?claim=${token}`);
      } else {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [token, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#F4F3EE] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#a299af]" /></div>;
  }

  const redirectUrl = encodeURIComponent(`/tags?claim=${token}`);

  return (
    <div className="min-h-screen bg-[#F4F3EE] flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl text-center space-y-6 border border-[#aaafbc]/20">
        <div className="w-20 h-20 bg-[#0c0e0b] rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <ScanLine className="w-10 h-10 text-white" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-[#0c0e0b] mb-3 tracking-tight">New Tag Discovered!</h1>
          <p className="text-[#aaafbc] leading-relaxed">This NFC tag hasn't been claimed yet. Login or create an account to link it to your profile.</p>
        </div>

        <div className="space-y-3 pt-6">
          <Link 
            href={`/signup?redirect=${redirectUrl}`}
            className="w-full flex items-center justify-center gap-2 bg-[#0c0e0b] text-white py-3.5 px-4 rounded-xl font-medium hover:bg-[#1a1a1a] transition-all active:scale-[0.98] shadow-md"
          >
            Create Account to Claim
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link 
            href={`/login?redirect=${redirectUrl}`}
            className="w-full flex items-center justify-center gap-2 bg-[#F4F3EE]/80 text-[#0c0e0b] py-3.5 px-4 rounded-xl font-medium hover:bg-[#e8e6df] transition-all active:scale-[0.98]"
          >
            Login to Claim
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F3EE] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#a299af]" /></div>}>
      <ClaimContent />
    </Suspense>
  );
}
