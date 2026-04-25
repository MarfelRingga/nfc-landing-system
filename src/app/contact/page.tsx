import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Globe, HeadphonesIcon, HelpCircle, Mail } from 'lucide-react';
import Link from 'next/link';

// Dynamically import platform settings
import { getPlatformInfo } from '@/lib/platforms';

export const revalidate = 60; // Revalidate every 60 seconds

interface AdminLink {
  id: string;
  title: string;
  url: string;
  is_visible?: boolean;
}

export default async function ContactPage() {
  // Fetch contact settings from app_settings table
  const { data: settings } = await supabase
    .from('app_settings')
    .select('id, value')
    .in('id', ['contact_support_link', 'global_platforms_links']);

  const contactSupportSetting = settings?.find(s => s.id === 'contact_support_link');
  const globalLinksSetting = settings?.find(s => s.id === 'global_platforms_links');

  const contactSupportLink = contactSupportSetting?.value || 'mailto:support@rifelo.com';
  
  let platforms: AdminLink[] = [];
  if (globalLinksSetting?.value) {
    try {
      platforms = JSON.parse(globalLinksSetting.value);
    } catch(e) {
      // Failed to parse
    }
  }

  // Filter visible ones
  const visiblePlatforms = platforms.filter(p => p.is_visible !== false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
                <img 
                  src="https://i.ibb.co.com/20WNbGMp/favicon-192x192.png" 
                  alt="rifelo Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer" 
                />
              </div>
              <span className="font-semibold text-lg tracking-tight text-[#0c0e0b]">Rifelo</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20 lg:px-8 flex flex-col justify-center">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Need help setting up your digital identity? Our support team and community channels are here to assist you with everything you need.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_400px] gap-8 max-w-5xl mx-auto w-full">
          
          {/* Main Contact Primary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Direct Support</h2>
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group hover:border-slate-300 transition-all h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-10 transition-transform group-hover:scale-110" />
              
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">Customer Support</h3>
              <p className="text-slate-600 mb-8 flex-1">
                Have questions about billing, features, or how to get started? Chat with our team or send us an email.
              </p>
              
              <Link 
                href={contactSupportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-6 py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 active:scale-[0.98] transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>

          {/* Platforms & Links from Admin */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Our Platforms</h2>
            
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm">
              {visiblePlatforms.length > 0 ? (
                <div className="space-y-3">
                  {visiblePlatforms.map((platform) => {
                    const info = getPlatformInfo(platform.title, platform.url);
                    const Icon = info?.icon || Globe;
                    
                    return (
                      <Link 
                        key={platform.id}
                        href={info?.finalUrl || platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center ${info?.color || 'text-slate-600'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{platform.title}</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors text-slate-400">
                          <ArrowLeft className="w-4 h-4 rotate-135 transform group-hover:-rotate-45 transition-transform" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-900 mb-1">More platforms coming soon</p>
                  <p className="text-xs text-slate-500">Stay tuned for official community links.</p>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Global Details */}
        <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-500 font-medium h-full">
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            rifelo.com
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Jakarta, Indonesia
          </div>
        </div>

      </main>
    </div>
  );
}
