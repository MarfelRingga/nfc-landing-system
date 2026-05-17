'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle2, Link as LinkIcon, Plus, Trash2, Loader2, PartyPopper } from 'lucide-react';
import { ModeSelector } from '@/components/profile/ModeSelector';
import { ThemeSelector } from '@/components/profile/ThemeSelector';
import { DynamicProfileForm } from '@/components/profile/DynamicProfileForm';
import { ProfileMode } from '@/lib/types/profile';
import { getThemesByMode } from '@/lib/themePresets';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getPlatformInfo } from '@/lib/platforms';
import { migrateFieldData } from '@/lib/profileMigration';
import { cn } from '@/lib/utils';

interface LinkData {
  id: string;
  title: string;
  url: string;
}

export function ProfileOnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [mode, setMode] = useState<ProfileMode>('casual');
  const [theme, setTheme] = useState<string>('vibrant');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [links, setLinks] = useState<LinkData[]>([]);

  const steps = [
    { title: 'Choose Mode', description: 'How do you want to present yourself?' },
    { title: 'Select Theme', description: 'Pick a design that matches your vibe.' },
    { title: 'Profile Details', description: 'Tell us a bit about you.' },
    { title: 'Add Links', description: 'Connect your socials and portfolios.' },
    { title: 'Review & Publish', description: 'Looks good? Let\'s go live.' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddLink = () => {
    setLinks([...links, { id: crypto.randomUUID(), title: '', url: '' }]);
  };

  const handleLinkChange = (id: string, field: 'title' | 'url', value: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name || '',
          job_title: formData.job_title || '',
          company: formData.company || '',
          email: formData.email || '',
          phone: formData.phone || '',
          website: formData.website || '',
          bio: formData.bio || '',
          profile_mode: mode,
          theme_preset: theme,
          is_public: true
        });

      if (profileError) throw profileError;

      // Save Links
      const validLinks = links.filter(l => l.title.trim() !== '' || l.url.trim() !== '');
      if (validLinks.length > 0) {
        const linksToUpsert = validLinks.map((l, idx) => ({
          id: l.id,
          profile_id: user.id,
          title: l.title,
          url: l.url,
          sort_order: idx,
          is_visible: true
        }));
        await supabase.from('profile_links').upsert(linksToUpsert);
      }

      setSuccess(true);
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <PartyPopper className="w-16 h-16 text-emerald-500 mb-6" />
        <h2 className="text-3xl font-bold text-slate-900 mb-2">You're all set!</h2>
        <p className="text-slate-600 mb-8 max-w-md">Your profile is now live. You can share your link or connect your NFC tag to share it with a tap.</p>
        <button
          onClick={() => router.push('/profile')}
          className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-md"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-slate-900">Profile Setup</h1>
            <div className="text-sm font-medium text-slate-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex gap-2 w-full">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
                  idx <= currentStep ? "bg-slate-900" : "bg-slate-100"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{steps[currentStep].title}</h2>
          <p className="text-slate-500 mt-2">{steps[currentStep].description}</p>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {/* Step 1: Mode */}
              {currentStep === 0 && (
                <div className="max-w-4xl mx-auto">
                  <ModeSelector
                    currentMode={mode}
                    onModeSelect={(m) => {
                      // Migrate existing data when mode changes
                      setFormData(prev => migrateFieldData(mode, m, prev));
                      setMode(m);
                      // Reset theme to default for this mode
                      const modeThemes = getThemesByMode(m);
                      if (modeThemes.length > 0) setTheme(modeThemes[0].id);
                    }}
                  />
                </div>
              )}

              {/* Step 2: Theme */}
              {currentStep === 1 && (
                <div className="w-full">
                  <ThemeSelector
                    currentMode={mode}
                    currentTheme={theme}
                    onThemeSelect={setTheme}
                    profilePreview={{
                      name: formData.full_name || 'Your Name',
                      status: formData.job_title || 'Your Tagline',
                      links: links.length > 0 ? links.slice(0, 2) : [
                        { title: 'My Portfolio', url: '#' },
                        { title: 'Contact Me', url: '#' }
                      ]
                    }}
                  />
                </div>
              )}

              {/* Step 3: Profile Details */}
              {currentStep === 2 && (
                <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <DynamicProfileForm
                    mode={mode}
                    initialValues={formData}
                    onChange={handleFieldChange}
                  />
                </div>
              )}

              {/* Step 4: Links */}
              {currentStep === 3 && (
                <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="space-y-4">
                    {links.map((link, index) => {
                      const platformInfo = getPlatformInfo(link.title, link.url);
                      return (
                        <div key={link.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50 relative">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Platform Title</label>
                            <input
                              type="text"
                              value={link.title}
                              onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                              placeholder="e.g. LinkedIn, Instagram"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">URL</label>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                              placeholder="https://"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveLink(link.id)}
                            className="absolute sm:relative top-2 right-2 sm:top-0 sm:right-0 p-2 sm:mt-6 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    
                    <button
                      onClick={handleAddLink}
                      className="w-full py-3 sm:py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Link
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 4 && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to publish!</h3>
                    <p className="text-slate-500 mb-6 font-medium">Please review your setup before going live.</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-left p-4 bg-slate-50 rounded-xl mb-6">
                      <div>
                        <span className="block text-xs text-slate-500 font-medium">Mode</span>
                        <span className="font-semibold text-slate-900 capitalize">{mode}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 font-medium">Theme</span>
                        <span className="font-semibold text-slate-900 capitalize">{theme}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 font-medium">Name</span>
                        <span className="font-semibold text-slate-900">{formData.full_name || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 font-medium">Links Added</span>
                        <span className="font-semibold text-slate-900">{links.filter(l => l.url).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex items-center justify-center px-8 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
