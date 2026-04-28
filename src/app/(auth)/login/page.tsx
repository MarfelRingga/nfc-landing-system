'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { formatIndonesianPhoneNumber } from '@/lib/phone';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/profile';
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedIdentifier = localStorage.getItem('rememberedIdentifier');
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (rememberMe) {
        localStorage.setItem('rememberedIdentifier', identifier);
      } else {
        localStorage.removeItem('rememberedIdentifier');
      }

      // Check if identifier is an email (contains @ symbol)
      const isEmail = identifier.includes('@');
      
      let signInData;
      
      if (isEmail) {
        signInData = {
          email: identifier,
          password: password,
        };
      } else {
        const formattedPhone = formatIndonesianPhoneNumber(identifier);
        signInData = {
          phone: formattedPhone,
          password: password,
        };
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword(signInData);

      if (authError) throw authError;

      if (data.user) {
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError('Gagal masuk. Silakan periksa kembali kredensial Anda dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div className="bg-white py-8 px-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-[#aaafbc]/30 rounded-3xl sm:px-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-[#0c0e0b]">
              Email or Phone Number
            </label>
            <div className="mt-2">
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="block w-full rounded-xl border-0 py-2.5 text-[#0c0e0b] shadow-sm ring-1 ring-inset ring-[#aaafbc]/30 placeholder:text-[#0c0e0b]/40 focus:ring-2 focus:ring-inset focus:ring-[#a299af] sm:text-sm sm:leading-6 bg-[#F4F3EE]/50 px-4"
                placeholder="Email or phone"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#0c0e0b]">
              Password
            </label>
            <div className="mt-2 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border-0 py-2.5 text-[#0c0e0b] shadow-sm ring-1 ring-inset ring-[#aaafbc]/30 placeholder:text-[#0c0e0b]/40 focus:ring-2 focus:ring-inset focus:ring-[#a299af] sm:text-sm sm:leading-6 bg-[#F4F3EE]/50 px-4 pr-10"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#0c0e0b]/40 hover:text-[#0c0e0b]/70 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#aaafbc]/30 text-[#0c0e0b] focus:ring-[#a299af]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[#0c0e0b]/70">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-[#0c0e0b] hover:text-[#a299af] transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center items-center rounded-xl bg-[#1A1A1A] px-3 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#0c0e0b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F4F3EE] font-sans selection:bg-[#a299af]/30 selection:text-[#0c0e0b] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-semibold tracking-tight text-[#0c0e0b] flex items-center justify-center gap-3">
          <Link href="/" className="hover:opacity-80 transition-opacity" title="Back to Home">
            <img 
              src="https://i.ibb.co.com/B5m6T7RZ/rifelo-logo.png" 
              alt="Rifelo Logo" 
              className="w-9 h-9 object-contain"
              referrerPolicy="no-referrer" 
            />
          </Link>
          Log in
        </h2>
        <p className="mt-2 text-center text-sm text-[#0c0e0b]/70">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-[#0c0e0b] hover:text-[#a299af] transition-colors">
            Get started today
          </Link>
        </p>
      </div>

      <Suspense fallback={<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-[#a299af]" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
