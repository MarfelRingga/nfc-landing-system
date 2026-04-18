'use client';

import { useState, useEffect } from 'react';
import { Shield, Smartphone, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [contactSupportLink, setContactSupportLink] = useState('');
  const [contactSupportText, setContactSupportText] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('id, value')
          .in('id', ['contact_support_link', 'contact_support_text']);

        if (error) {
          console.error('Error fetching settings:', error);
          return;
        }

        if (data) {
          const linkSetting = data.find(s => s.id === 'contact_support_link');
          const textSetting = data.find(s => s.id === 'contact_support_text');
          if (linkSetting) setContactSupportLink(linkSetting.value || '');
          if (textSetting) setContactSupportText(textSetting.value || '');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 font-sans max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-8">
        {/* Account Security Section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-slate-400" />
            Account Security
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Need Help?</label>
              <p className="text-sm text-slate-600 mb-4">
                {contactSupportText || "Your phone number is your primary identifier and cannot be changed directly. Contact support if you lost access."}
              </p>
              <button 
                onClick={() => {
                  if (contactSupportLink) {
                    window.open(contactSupportLink, '_blank');
                  }
                }}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-100 text-slate-900 text-sm font-medium rounded-xl transition-all"
              >
                Contact Support
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Recovery Email (Optional)</label>
              <input 
                type="email" 
                placeholder="your@email.com" 
                defaultValue="user@rifelo.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
              />
              <p className="text-xs text-slate-500 mt-2">
                Used for account recovery in case you lose access to your phone number.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
          {showSuccess && (
            <span className="flex items-center text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Saved successfully!
            </span>
          )}
          <button 
            onClick={handleSave} 
            className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98]"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
