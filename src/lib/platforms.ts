import { 
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Linkedin as LinkedinIcon,
  Github as GithubIcon,
  Youtube as YoutubeIcon,
  MessageCircle as MessageCircleIcon,
  Send as SendIcon,
  Music2 as MusicIcon
} from 'lucide-react';

export const getPlatformInfo = (title: string, url: string) => {
  const lowerTitle = title.toLowerCase();
  const lowerUrl = url.toLowerCase();

  const platforms = [
    { 
      id: 'instagram',
      match: ['instagram'], 
      icon: InstagramIcon, 
      color: 'text-pink-600', 
      baseUrl: 'https://instagram.com/',
      clean: (u: string) => u.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')
    },
    { 
      id: 'twitter',
      match: ['twitter', 'x.com'], 
      icon: TwitterIcon, 
      color: 'text-slate-900', 
      baseUrl: lowerUrl.includes('x.com') ? 'https://x.com/' : 'https://twitter.com/',
      clean: (u: string) => u.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '').replace(/\/$/, '')
    },
    { 
      id: 'facebook',
      match: ['facebook'], 
      icon: FacebookIcon, 
      color: 'text-blue-600', 
      baseUrl: 'https://facebook.com/',
      clean: (u: string) => u.replace(/^https?:\/\/(www\.)?facebook\.com\//, '').replace(/\/$/, '')
    },
    { 
      id: 'linkedin',
      match: ['linkedin'], 
      icon: LinkedinIcon, 
      color: 'text-blue-700', 
      baseUrl: 'https://linkedin.com/in/',
      clean: (u: string) => u.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')
    },
    { 
      id: 'github',
      match: ['github'], 
      icon: GithubIcon, 
      color: 'text-slate-900', 
      baseUrl: 'https://github.com/',
      clean: (u: string) => u.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '')
    },
    { 
      id: 'youtube',
      match: ['youtube'], 
      icon: YoutubeIcon, 
      color: 'text-red-600', 
      baseUrl: 'https://youtube.com/@',
      clean: (u: string) => u.replace(/^https?:\/\/(www\.)?youtube\.com\/(@)?/, '').replace(/\/$/, '')
    },
    { 
      id: 'whatsapp',
      match: ['whatsapp', 'wa.me'], 
      icon: MessageCircleIcon, 
      color: 'text-emerald-500', 
      baseUrl: 'https://wa.me/',
      clean: (u: string) => u.replace(/^https?:\/\/(www\.)?wa\.me\//, '').replace(/\/$/, '')
    },
    { 
      id: 'telegram',
      match: ['telegram', 't.me'], 
      icon: SendIcon, 
      color: 'text-blue-500', 
      baseUrl: 'https://t.me/',
      clean: (u: string) => u.replace(/^https?:\/\/(www\.)?t\.me\//, '').replace(/\/$/, '')
    },
    { 
      id: 'tiktok',
      match: ['tiktok'], 
      icon: MusicIcon, 
      color: 'text-slate-900', 
      baseUrl: 'https://tiktok.com/@',
      clean: (u: string) => u.replace(/^https?:\/\/(www\.)?tiktok\.com\/(@)?/, '').replace(/\/$/, '')
    }
  ];

  const platform = platforms.find(p => 
    p.match.some(m => lowerTitle.includes(m) || lowerUrl.includes(m))
  );

  if (!platform) return null;

  const username = platform.clean(url);
  const finalUrl = url.startsWith('http') ? url : `${platform.baseUrl}${username}`;

  return {
    ...platform,
    username,
    finalUrl
  };
};
