'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, RefreshCw, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { formatIndonesianPhoneNumber } from '@/lib/phone';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/profile';

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate username: minimum 4 characters, only a-z, ., _
      const usernameRegex = /^[a-z._]{4,}$/;
      if (!usernameRegex.test(username)) {
        throw new Error('Username must be at least 4 characters and can only contain lowercase letters, dots, and underscores.');
      }

      const formattedPhone = formatIndonesianPhoneNumber(phone);
      
      const { data, error: authError } = await supabase.auth.signUp({
        phone: formattedPhone,
        password: password,
        options: {
          data: {
            username: username,
            full_name: username, // Default full name to username initially
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        setSuccess(true);
        // Supabase might require phone verification depending on settings
        // If auto-confirm is on, we can redirect
        setTimeout(() => {
          router.push(redirectUrl);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
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

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-600 text-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Account created!</p>
              <p className="mt-1">Please check your phone for a verification code if required. Redirecting...</p>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSignup}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#0c0e0b]">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z._]/g, ''))}
                className="block w-full rounded-xl border-0 py-2.5 text-[#0c0e0b] shadow-sm ring-1 ring-inset ring-[#aaafbc]/30 placeholder:text-[#0c0e0b]/40 focus:ring-2 focus:ring-inset focus:ring-[#a299af] sm:text-sm sm:leading-6 bg-[#F4F3EE]/50 px-4"
                placeholder="johndoe_"
                minLength={4}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#0c0e0b]">
              Phone Number
            </label>
            <div className="mt-2 flex rounded-xl shadow-sm ring-1 ring-inset ring-[#aaafbc]/30 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#a299af] bg-[#F4F3EE]/50 overflow-hidden">
              <span className="flex select-none items-center pl-4 pr-3 text-[#0c0e0b]/60 sm:text-sm border-r border-[#aaafbc]/20 font-medium">
                +62
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full border-0 py-2.5 text-[#0c0e0b] placeholder:text-[#0c0e0b]/40 focus:ring-0 sm:text-sm sm:leading-6 bg-transparent px-3"
                placeholder="8123456789"
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border-0 py-2.5 text-[#0c0e0b] shadow-sm ring-1 ring-inset ring-[#aaafbc]/30 placeholder:text-[#0c0e0b]/40 focus:ring-2 focus:ring-inset focus:ring-[#a299af] sm:text-sm sm:leading-6 bg-[#F4F3EE]/50 px-4 pr-10"
                placeholder="••••••••"
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

          <div>
            <button 
              type="submit"
              disabled={isLoading || success}
              className="flex w-full justify-center items-center rounded-xl bg-[#1A1A1A] px-3 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#0c0e0b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F4F3EE] font-sans selection:bg-[#a299af]/30 selection:text-[#0c0e0b] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-semibold tracking-tight text-[#0c0e0b] flex items-center justify-center gap-3">
          <img 
            src="https://i.ibb.co.com/B5m6T7RZ/rifelo-logo.png" 
            alt="Rifelo Logo" 
            className="w-9 h-9 object-contain"
           referrerPolicy="no-referrer" />
          Sign up
        </h2>
        <p className="mt-2 text-center text-sm text-[#0c0e0b]/70">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#0c0e0b] hover:text-[#a299af] transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>

      <Suspense fallback={<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-[#a299af]" /></div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
