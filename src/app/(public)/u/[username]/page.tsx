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
  EyeOff,
  User,
  Building,
  GraduationCap,
  Smile,
  Palette,
  Phone,
  Info,
  FileText,
  Feather,
  MessageCircle
} from 'lucide-react';
import MessageForm from './MessageForm';
import { getPlatformInfo } from '@/lib/platforms';
import CircleRealtimeView from './CircleRealtimeView';
import Link from 'next/link';
import { decodeMessageSettings } from '@/lib/messageSettings';
import { themePresets, getTheme } from '@/lib/themePresets';
import { ProfileMode } from '@/lib/types/profile';

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

    const messageSettings = decodeMessageSettings(profile.message_placeholder_name || 'Your Name (Optional)');

    return {
      id: profile.id,
      username: profile.username,
      fullName: profile.full_name || 'User',
      bio: profile.bio || '',
      company: profile.company || '',
      email: profile.email || '',
      phone: profile.phone || '',
      website: profile.website || '',
      jobTitle: profile.job_title || '',
      links: visibleLinks,
      isPublic: profile.is_public !== false,
      allowMessages: messageSettings.isEnabled,
      messagePlaceholderName: messageSettings.cleanName,
      messagePlaceholderContent: profile.message_placeholder_content || 'Write a secret message...',
      profileMode: (profile.profile_mode as ProfileMode) || 'casual',
      themePreset: profile.theme_preset || 'vibrant',
      customTheme: profile.custom_theme
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

  // Apply Theme
  const theme = getTheme(profile.themePreset) || themePresets.vibrant;
  
  // Custom theme overrides if any
  const appliedColors = {
    ...theme.colors,
    ...(profile.customTheme?.colors || {})
  };

  const isGradientBg = appliedColors.background.includes('gradient');
  const isGradientCardBg = appliedColors.cardBg.includes('gradient');

  // Normal Profile View
  return (
    <div 
      className="min-h-screen py-12 px-4 flex flex-col items-center transition-colors duration-500"
      style={{
        background: appliedColors.background,
        color: appliedColors.text,
        fontFamily: theme.fonts.body
      }}
    >
      <div 
        className="w-full max-w-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm p-8 space-y-8 transition-all duration-500"
        style={{
          background: isGradientCardBg ? appliedColors.cardBg : (profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.1)' : appliedColors.cardBg),
          borderRadius: theme.borderRadius,
          border: profile.themePreset === 'gradient' ? '1px solid rgba(255, 255, 255, 0.2)' : `1px solid ${appliedColors.primary}20`
        }}
      >
        
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: theme.fonts.heading }}
          >
            {profile.fullName}
          </h1>
          
          {profile.jobTitle && (
            <div className="flex items-center text-lg mt-1 opacity-80" style={{ color: appliedColors.text }}>
              {profile.profileMode === 'casual' && <Smile className="w-5 h-5 mr-2 opacity-70" />}
              {profile.profileMode === 'creative' && <Palette className="w-5 h-5 mr-2 opacity-70" />}
              {profile.profileMode === 'professional' && <Briefcase className="w-5 h-5 mr-2 opacity-70" />}
              <p>
                {profile.jobTitle}
                {profile.profileMode === 'professional' && profile.company ? ` at ${profile.company}` : ''}
              </p>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="space-y-3">
            <h2 
              className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center"
              style={{ color: appliedColors.text }}
            >
              {profile.profileMode === 'casual' && <><Info className="w-4 h-4 mr-2" /> About Me</>}
              {profile.profileMode === 'professional' && <><FileText className="w-4 h-4 mr-2" /> Summary</>}
              {profile.profileMode === 'creative' && <><Feather className="w-4 h-4 mr-2" /> Vision</>}
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap opacity-90 text-[15px]">{profile.bio}</p>
          </div>
        )}

        {/* Details based on mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company / School (Casual & Pro) */}
          {(profile.profileMode === 'casual' || profile.profileMode === 'professional') && profile.company && (
            <div 
              className="flex items-center p-4 transition-colors"
              style={{ 
                background: profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.05)' : appliedColors.secondary,
                borderRadius: theme.borderRadius,
                borderColor: profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderWidth: '1px'
              }}
            >
              {profile.profileMode === 'casual' ? (
                <GraduationCap className="w-5 h-5 mr-3 opacity-60" style={{ color: appliedColors.primary }} />
              ) : (
                <Building className="w-5 h-5 mr-3 opacity-60" style={{ color: appliedColors.primary }} />
              )}
              <span className="truncate opacity-90 font-medium">{profile.company}</span>
            </div>
          )}
          
          {/* Portfolio Link (Creative only, using website or company field depending on migration) */}
          {profile.profileMode === 'creative' && profile.website && (
            <a 
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 transition-colors hover:opacity-80"
              style={{ 
                background: profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.05)' : appliedColors.secondary,
                borderRadius: theme.borderRadius,
                borderColor: profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderWidth: '1px'
              }}
            >
              <Globe className="w-5 h-5 mr-3 opacity-60" style={{ color: appliedColors.primary }} />
              <span className="truncate opacity-90 font-medium">Portfolio</span>
            </a>
          )}

          {/* Email (Pro & Creative) */}
          {(profile.profileMode === 'professional' || profile.profileMode === 'creative') && profile.email && (
            <a 
              href={`mailto:${profile.email}`} 
              className="flex items-center p-4 transition-colors hover:opacity-80"
              style={{ 
                background: profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.05)' : appliedColors.secondary,
                borderRadius: theme.borderRadius,
                borderColor: profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderWidth: '1px'
              }}
            >
              <Mail className="w-5 h-5 mr-3 opacity-60" style={{ color: appliedColors.primary }} />
              <span className="truncate opacity-90 font-medium">{profile.email}</span>
            </a>
          )}

          {/* Phone (Casual & Pro) */}
          {(profile.profileMode === 'casual' || profile.profileMode === 'professional') && profile.phone && (
            <a 
              href={`https://wa.me/${profile.phone.replace(/\\D/g, '')}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 transition-colors hover:opacity-80"
              style={{ 
                background: profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.05)' : appliedColors.secondary,
                borderRadius: theme.borderRadius,
                borderColor: profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderWidth: '1px'
              }}
            >
              {(profile.profileMode === 'casual') ? (
                <MessageCircle className="w-5 h-5 mr-3 opacity-60" style={{ color: appliedColors.primary }} />
              ) : (
                <Phone className="w-5 h-5 mr-3 opacity-60" style={{ color: appliedColors.primary }} />
              )}
              <span className="truncate opacity-90 font-medium">{profile.phone}</span>
            </a>
          )}
        </div>

        {/* Links & Platforms */}
        {profile.links.length > 0 && (
          <div className="space-y-4 pt-2">
            <h2 
              className="text-sm font-bold uppercase tracking-widest opacity-60"
              style={{ color: appliedColors.text }}
            >
              Social & Links
            </h2>
            <div className="space-y-3">
              {profile.links.map((link) => {
                const platformInfo = getPlatformInfo(link.title, link.url);
                const isUrl = link.url.startsWith('http://') || link.url.startsWith('https://');
                
                const linkStyle = {
                  background: profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.05)' : appliedColors.secondary,
                  borderRadius: theme.borderRadius,
                  borderColor: profile.themePreset === 'gradient' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  borderWidth: '1px'
                };
                
                if (platformInfo) {
                  const Icon = platformInfo.icon;
                  return (
                    <a
                      key={link.id}
                      href={platformInfo.finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 transition-all group hover:scale-[1.01]"
                      style={{ ...linkStyle, color: appliedColors.text }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform"
                          style={{ 
                            background: appliedColors.background, 
                            borderRadius: `calc(${theme.borderRadius} - 4px)` 
                          }}
                        >
                          <Icon className={`w-5 h-5 ${profile.themePreset === 'gradient' ? 'text-white' : platformInfo.color.replace('text-', '')}`} 
                            style={profile.themePreset !== 'gradient' ? {} : undefined} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{link.title}</span>
                          <span className="text-xs opacity-60">{platformInfo.username || link.url}</span>
                        </div>
                      </div>
                      <LinkIcon className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: appliedColors.primary }} />
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
                      className="flex items-center justify-between p-4 transition-all group hover:scale-[1.01]"
                      style={{ ...linkStyle, color: appliedColors.text }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform"
                          style={{ 
                            background: appliedColors.background, 
                            borderRadius: `calc(${theme.borderRadius} - 4px)` 
                          }}
                        >
                          <LinkIcon className="w-5 h-5 opacity-60 group-hover:opacity-100" style={{ color: appliedColors.primary }} />
                        </div>
                        <span className="font-bold">{link.title}</span>
                      </div>
                      <span className="text-xs opacity-50 truncate max-w-[150px] hidden sm:block">{link.url.replace(/^https?:\/\//, '')}</span>
                    </a>
                  );
                }

                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4"
                    style={{ ...linkStyle, color: appliedColors.text }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 flex items-center justify-center mr-4 shadow-sm font-bold opacity-80"
                        style={{ 
                          background: appliedColors.background, 
                          borderRadius: `calc(${theme.borderRadius} - 4px)`,
                          color: appliedColors.primary
                        }}
                      >
                        {link.title ? link.title.charAt(0).toUpperCase() : '#'}
                      </div>
                      <span className="font-bold">{link.title}</span>
                    </div>
                    <span className="text-sm opacity-60 font-medium truncate max-w-[200px] sm:max-w-[300px]">{link.url}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Secret Message Form */}
        {profile.allowMessages && (
          <div className="pt-4 mt-8 border-t border-black/5" style={{ borderColor: `${appliedColors.text}15` }}>
            <MessageForm 
              profileId={profile.id} 
              placeholderName={profile.messagePlaceholderName}
              placeholderContent={profile.messagePlaceholderContent}
              themeColors={{
                primary: appliedColors.primary,
                secondary: appliedColors.secondary,
                accent: appliedColors.accent,
                background: appliedColors.background,
                text: appliedColors.text
              }}
              themePreset={profile.themePreset}
            />
          </div>
        )}
      </div>
    </div>
  );
}

