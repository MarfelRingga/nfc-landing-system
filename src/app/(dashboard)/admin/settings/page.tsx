'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Loader2, Link as LinkIcon, Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Globe, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { getPlatformInfo } from '@/lib/platforms';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

interface AdminLink {
  id: string;
  title: string;
  url: string;
  is_visible?: boolean;
}

export default function AdminSettingsPage() {
  const [contactSupportLink, setContactSupportLink] = useState('');
  const [getYoursNowLink, setGetYoursNowLink] = useState('');
  const [globalLinks, setGlobalLinks] = useState<AdminLink[]>([]);
  const [expandedLinks, setExpandedLinks] = useState<Record<string, boolean>>({});
  
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
          .in('id', [
            'contact_support_link', 
            'get_yours_now_link', 
            'global_platforms_links'
          ]);

        if (error) {
          if (error.code === '42P01' || error.message?.includes('app_settings')) {
            setNeedsMigration(true);
          } else {
            throw error;
          }
        } else if (data) {
          const linkSetting = data.find(s => s.id === 'contact_support_link');
          const getYoursSetting = data.find(s => s.id === 'get_yours_now_link');
          const globalLinksSetting = data.find(s => s.id === 'global_platforms_links');
          
          if (linkSetting) setContactSupportLink(linkSetting.value || '');
          if (getYoursSetting) setGetYoursNowLink(getYoursSetting.value || '');
          if (globalLinksSetting && globalLinksSetting.value) {
            try {
              setGlobalLinks(JSON.parse(globalLinksSetting.value));
            } catch (e) {}
          }
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

  const handleAddLink = () => {
    const newId = crypto.randomUUID();
    setGlobalLinks([...globalLinks, { id: newId, title: '', url: '', is_visible: true }]);
    setExpandedLinks(prev => ({ ...prev, [newId]: true }));
  };

  const toggleLinkExpansion = (id: string) => {
    setExpandedLinks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRemoveLink = (id: string) => {
    setGlobalLinks(globalLinks.filter(l => l.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    setGlobalLinks(globalLinks.map(l => l.id === id ? { ...l, is_visible: l.is_visible === false ? true : false } : l));
  };

  const handleLinkChange = (id: string, field: 'title' | 'url', value: string) => {
    setGlobalLinks(globalLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert([
          { id: 'contact_support_link', value: contactSupportLink },
          { id: 'get_yours_now_link', value: getYoursNowLink },
          { id: 'global_platforms_links', value: JSON.stringify(globalLinks) }
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
    return <PageSkeleton />;
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
                placeholder="Contact URL (WhatsApp or email)"
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
                placeholder="Purchase link (redirect URL)"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm transition-all bg-slate-50"
                disabled={needsMigration}
              />
            </div>
          </div>
        </div>

        {/* Custom Links Section */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Platforms & Links</h3>
              <p className="text-xs text-slate-500 mt-1">Manage global default links and platforms available to the system.</p>
            </div>
            <button 
              type="button"
              onClick={handleAddLink}
              disabled={needsMigration}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 sm:px-3 sm:py-1.5 bg-slate-900 text-white text-sm sm:text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-1" />
              Add Platform
            </button>
          </div>

          <div className="space-y-4">
            {globalLinks.map((link) => {
              const isExpanded = expandedLinks[link.id];
              const platformInfo = getPlatformInfo(link.title || '', link.url || '');
              const Icon = platformInfo ? platformInfo.icon : Globe;
              
              return (
                <div key={link.id} className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 group relative overflow-hidden transition-all">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => toggleLinkExpansion(link.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 ${platformInfo ? platformInfo.color : 'text-slate-400'}`}>
                        {platformInfo ? (
                          <Icon className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            {link.title ? link.title.charAt(0).toUpperCase() : '#'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {link.title || 'New Platform'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {link.url || 'No URL provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(link.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          link.is_visible === false 
                            ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-200' 
                            : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={link.is_visible === false ? "Hidden" : "Visible"}
                      >
                        {link.is_visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLink(link.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                      <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
                        <div className="flex-1 w-full space-y-4 pt-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Platform Name</label>
                            <input 
                              type="text" 
                              placeholder="Platform name or link title" 
                              value={link.title}
                              onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                              className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Action URL</label>
                            <input 
                              type="text" 
                              placeholder="Profile or destination URL" 
                              value={link.url}
                              onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                              className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {globalLinks.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900 mb-1">No platforms added</p>
                <p className="text-xs text-slate-500">Click the button above to add a new link.</p>
              </div>
            )}
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
