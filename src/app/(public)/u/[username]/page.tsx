import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { 
  CheckCircle2, 
  Briefcase, 
  Mail, 
  Link as LinkIcon, 
  Hash,
  Globe,
  EyeOff
} from 'lucide-react';
import MessageForm from './MessageForm';
import { getPlatformInfo } from '@/lib/platforms';
import CircleRealtimeView from './CircleRealtimeView';
import Link from 'next/link';

export const revalidate = 60; // Cache for 60 seconds (ISR)

async function getProfileData(username: string) {
  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        profile_links (*)
      `)
      .ilike('username', username)
      .maybeSingle();

    if (profileError || !profile) return null;

    // Sort links by sort_order
    const links = profile.profile_links || [];
    links.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

    const visibleLinks = links.filter((l: any) => l.is_visible !== false);

    return {
      id: profile.id,
      username: profile.username,
      fullName: profile.full_name || 'User',
      bio: profile.bio || '',
      company: profile.company || '',
      email: profile.email || '',
      jobTitle: profile.job_title || '',
      links: visibleLinks,
      isPublic: profile.is_public !== false,
      messagePlaceholderName: profile.message_placeholder_name || 'Your Name (Optional)',
      messagePlaceholderContent: profile.message_placeholder_content || 'Write a secret message...'
    };
  } catch (err) {
    console.error('Error fetching profile data:', err);
    return null;
  }
}

export default async function PublicProfilePage({ params, searchParams }: { params: Promise<{ username: string }>, searchParams: Promise<{ mode?: string, circle?: string }> }) {
  const { username } = await params;
  const { mode, circle } = await searchParams;
  const profile = await getProfileData(username);

  if (!profile) notFound();

  // Handle Private Profile
  if (!profile.isPublic) {
    return (
      <div className="min-h-screen bg-[#F4F3EE] font-sans py-12 px-4 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#0c0e0b] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <EyeOff className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0c0e0b]">Profile is Private</h1>
          <p className="text-[#aaafbc]">This user has chosen to keep their profile private.</p>
          <Link  
            href="/"
            className="inline-block mt-6 text-sm font-bold text-[#0c0e0b] hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Handle Hub Mode via Secret Link
  if (circle) {
    // Fetch circle slug for better navigation
    const { data: circleData } = await supabaseAdmin
      .from('circles')
      .select('slug')
      .eq('invite_code', circle.toUpperCase())
      .maybeSingle();

    return <CircleRealtimeView inviteCode={circle} slug={circleData?.slug} profileId={profile.id} profileName={profile.fullName} />;
  }

  // Handle Legacy Hub Mode
  if (mode === 'hub' || mode === 'circle') {
    return (
      <div className="min-h-screen bg-[#F4F3EE] font-sans py-12 px-4 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#0c0e0b] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0c0e0b]">Link Expired</h1>
          <p className="text-[#aaafbc]">This hub link format is no longer supported. Please use the new secret link format from your dashboard.</p>
        </div>
      </div>
    );
  }

  // Normal Profile View
  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{profile.fullName}</h1>
            {(profile.jobTitle || profile.company) && (
              <p className="text-slate-500 mt-1">
                {profile.jobTitle} {profile.jobTitle && profile.company ? 'at' : ''} {profile.company}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">About</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Details */}
        {(profile.company || profile.email) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.company && (
              <div className="flex items-center text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Briefcase className="w-5 h-5 mr-3 text-slate-400" />
                <span className="truncate">{profile.company}</span>
              </div>
            )}
            {profile.email && (
              <div className="flex items-center text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Mail className="w-5 h-5 mr-3 text-slate-400" />
                <a href={`mailto:${profile.email}`} className="truncate hover:text-slate-900 transition-colors">
                  {profile.email}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Links & Platforms */}
        {profile.links.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Platforms & Links</h2>
            <div className="space-y-3">
              {profile.links.map((link) => {
                const platformInfo = getPlatformInfo(link.title, link.url);
                const isUrl = link.url.startsWith('http://') || link.url.startsWith('https://');
                
                if (platformInfo) {
                  const Icon = platformInfo.icon;
                  return (
                    <a
                      key={link.id}
                      href={platformInfo.finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all group"
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform ${platformInfo.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{link.title}</span>
                          <span className="text-xs text-slate-500">{platformInfo.username || link.url}</span>
                        </div>
                      </div>
                      <LinkIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </a>
                  );
                }

                if (isUrl) {
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all group"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform text-slate-400 group-hover:text-slate-900">
                          <LinkIcon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-900">{link.title}</span>
                      </div>
                      <span className="text-xs text-slate-400 truncate max-w-[150px] hidden sm:block">{link.url.replace(/^https?:\/\//, '')}</span>
                    </a>
                  );
                }

                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center mr-4 shadow-sm text-slate-400">
                        <Globe className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900">{link.title}</span>
                    </div>
                    <span className="text-sm text-slate-500 font-medium truncate max-w-[200px] sm:max-w-[300px]">{link.url}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Secret Message Form */}
        <MessageForm 
          profileId={profile.id} 
          placeholderName={profile.messagePlaceholderName}
          placeholderContent={profile.messagePlaceholderContent}
        />
      </div>
    </div>
  );
}
