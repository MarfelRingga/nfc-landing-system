'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    async function checkAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profile?.is_admin) {
          if (isMounted) setIsAuthorized(true);
        } else {
          router.replace('/profile'); // Redirect non-admins to their profile
        }
      } catch (error) {
        console.error('Error checking admin status', error);
        router.replace('/profile');
      }
    }

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (!isAuthorized) {
    return <PageSkeleton />;
  }

  return <>{children}</>;
}
