'use client';

import { useState, useEffect } from 'react';
import { Users, ScanLine, ShieldAlert, Loader2, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, tags: 0, backups: 'checking...' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin stats');
        }

        const data = await response.json();
        if (isMounted) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h2 className="text-3xl font-bold text-slate-900">{stats.users}</h2>
            </div>
          </div>
          <Link href="/admin/users" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Manage Users &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total NFC Tags</p>
              <h2 className="text-3xl font-bold text-slate-900">{stats.tags}</h2>
            </div>
          </div>
          <Link href="/admin/tags" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Manage Tags &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              stats.backups === 'success' ? 'bg-green-50 text-green-600' :
              stats.backups === 'failed' ? 'bg-red-50 text-red-600' :
              'bg-slate-50 text-slate-600'
            }`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Last Backup Status</p>
              <h2 className={`text-3xl font-bold ${
                stats.backups === 'success' ? 'text-green-700' :
                stats.backups === 'failed' ? 'text-red-700' :
                'text-slate-900'
              }`}>{stats.backups.toUpperCase()}</h2>
            </div>
          </div>
          <Link href="/admin/backups" className="text-sm font-medium text-slate-600 hover:text-slate-700">
            View Backup Logs &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
