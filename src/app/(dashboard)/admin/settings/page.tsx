'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Loader2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [contactSupportLink, setContactSupportLink] = useState('');
  const [getYoursNowLink, setGetYoursNowLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('id, value')
          .in('id', ['contact_support_link', 'get_yours_now_link']);

        if (error) {
          if (error.code === '42P01' || error.message?.includes('app_settings')) {
            setNeedsMigration(true);
          } else {
            throw error;
          }
        } else if (data) {
          const linkSetting = data.find(s => s.id === 'contact_support_link');
          const getYoursSetting = data.find(s => s.id === 'get_yours_now_link');
          if (linkSetting) setContactSupportLink(linkSetting.value || '');
          if (getYoursSetting) setGetYoursNowLink(getYoursSetting.value || '');
        }
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        setError(err.message || 'Failed to load settings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert([
          { id: 'contact_support_link', value: contactSupportLink },
          { id: 'get_yours_now_link', value: getYoursNowLink }
        ]);

      if (error) {
        if (error.code === '42P01' || error.message?.includes('app_settings')) {
          setNeedsMigration(true);
          throw new Error('Database table "app_settings" does not exist.');
        }
        throw error;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/admin/users" className="hover:text-slate-900 transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500">Manage global application configurations</p>
      </div>

      {needsMigration && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <h3 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Database Migration Required
          </h3>
          <p className="text-amber-700 text-sm mb-4">
            The <code>app_settings</code> table does not exist. Please run the following SQL in your Supabase SQL Editor to enable settings:
          </p>
          <pre className="bg-amber-100/50 p-4 rounded-xl text-xs text-amber-900 overflow-x-auto whitespace-pre-wrap font-mono border border-amber-200/50">
{`CREATE TABLE public.app_settings (
  id TEXT PRIMARY KEY,
  value TEXT
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on app_settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write access on app_settings"
  ON public.app_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );`}
          </pre>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900">General Configuration</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Contact Support Link
            </label>
            <p className="text-xs text-slate-500 mb-3">
              This link will be used on the "Need Help?" page and other places where users need assistance.
            </p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="url"
                value={contactSupportLink}
                onChange={(e) => setContactSupportLink(e.target.value)}
                placeholder="https://wa.me/6281234567890 or mailto:support@example.com"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm transition-all bg-slate-50"
                disabled={needsMigration}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              "Get yours now!" Link
            </label>
            <p className="text-xs text-slate-500 mb-3">
              This link will be used for the "Get yours now!" button on the landing page.
            </p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="url"
                value={getYoursNowLink}
                onChange={(e) => setGetYoursNowLink(e.target.value)}
                placeholder="https://example.com/purchase"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm transition-all bg-slate-50"
                disabled={needsMigration}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
          {error && !needsMigration && (
            <span className="flex items-center text-sm text-red-600 font-medium animate-in fade-in slide-in-from-right-4">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {error}
            </span>
          )}
          {success && (
            <span className="flex items-center text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Settings saved successfully!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || needsMigration}
            className="flex items-center px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
