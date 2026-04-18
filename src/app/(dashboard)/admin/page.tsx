'use client';

import { useState, useEffect } from 'react';
import { Users, ScanLine, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, tags: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: tagsCount } = await supabase
          .from('nfc_tags')
          .select('*', { count: 'exact', head: true });

        setStats({
          users: usersCount || 0,
          tags: tagsCount || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
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
      </div>
    </div>
  );
}
