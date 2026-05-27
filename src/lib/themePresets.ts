import { ProfileMode, ThemePreset } from './types/profile';

/**
 * Interface defining the complete structure of a theme preset.
 */
export interface ThemeConfig {
  /** Display name of the theme */
  name: string;
  /** Description for theme preview/selection */
  description: string;
  /** Applicable profile modes for this theme */
  mode: ProfileMode[];
  /** Color palette */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    cardBg: string;
    cardBorder: string;
    linkBg: string;
    linkBorder: string;
    inputBg?: string; // used in MessageForm
    inputBorder?: string; // used in MessageForm
  };
  /** Typography configuration */
  fonts: {
    heading: string;
    body: string;
  };
  /** Global border radius style */
  borderRadius: string;
}

/**
 * Central configuration for all profile theme presets.
 * 
 * Tailwind Config Reference:
 * In a standard Tailwind Setup, you map these to CSS variables in your global styles, e.g.:
 * :root {
 *   --theme-primary: <value>;
 * }
 * Then extend your tailwind.config or app layer to use var(--theme-primary).
 * Alternatively, apply them directly via inline styles where dynamic:
 * style={{ backgroundColor: theme.colors.background }}
 */
export const themePresets: Record<ThemePreset, ThemeConfig> = {
  minimal: {
    name: 'Minimal',
    description: 'Stark, highly legible, monochromatic focus.',
    mode: ['professional', 'creative', 'casual'],
    colors: {
      primary: '#0f172a',
      secondary: '#f8fafc',
      accent: '#64748b',
      background: '#f8fafc',
      text: '#0f172a',
      cardBg: '#ffffff',
      cardBorder: '#f1f5f9',
      linkBg: '#f8fafc',
      linkBorder: '#f1f5f9',
      inputBg: '#ffffff',
      inputBorder: '#e2e8f0'
    },
    fonts: {
      heading: 'var(--font-heading), system-ui, sans-serif',
      body: 'var(--font-body), system-ui, sans-serif'
    },
    borderRadius: '1.25rem' // clean modern rounded corners matching the high-quality layout
  },
  corporate: {
    name: 'Corporate',
    description: 'Clean, professional, and trustworthy blue tones.',
    mode: ['professional'],
    colors: {
      primary: '#1d4ed8', // Blue 700
      secondary: '#e0e7ff', // Indigo 100
      accent: '#2563eb', // Blue 600
      background: '#f8fafc', // Slate 50
      text: '#0f172a', // Slate 900
      cardBg: '#ffffff',
      cardBorder: '#1d4ed820',
      linkBg: '#e0e7ff',
      linkBorder: 'transparent',
      inputBg: '#ffffff',
      inputBorder: '#0f172a20'
    },
    fonts: {
      heading: 'var(--font-heading), system-ui, sans-serif', // Inter or standard sans
      body: 'var(--font-body), system-ui, sans-serif'
    },
    borderRadius: '0.375rem' // Standard rounded-md
  },
  playful: {
    name: 'Playful',
    description: 'Bright, colorful, and heavily rounded for a friendly vibe.',
    mode: ['casual'],
    colors: {
      primary: '#f59e0b', // Amber
      secondary: '#fef3c7', // Light Amber
      accent: '#10b981', // Emerald
      background: '#fffbeb',
      text: '#451a03',
      cardBg: '#ffffff',
      cardBorder: '#f59e0b20',
      linkBg: '#fef3c7',
      linkBorder: 'transparent',
      inputBg: '#ffffff',
      inputBorder: '#451a0320'
    },
    fonts: {
      heading: 'var(--font-heading), system-ui, sans-serif',
      body: 'var(--font-body), system-ui, sans-serif'
    },
    borderRadius: '1.5rem'
  },
  vibrant: {
    name: 'Vibrant',
    description: 'High energy, bold colors, and strong contrast.',
    mode: ['casual', 'creative'],
    colors: {
      primary: '#7c3aed', // Purple
      secondary: '#f3f4f6', // Light gray
      accent: '#ec4899', // Pink
      background: '#ffffff',
      text: '#111827',
      cardBg: 'linear-gradient(135deg, #fce7f3 0%, #dbeafe 100%)',
      cardBorder: '#7c3aed20',
      linkBg: '#f3f4f6',
      linkBorder: 'transparent',
      inputBg: '#ffffff',
      inputBorder: '#11182720'
    },
    fonts: {
      heading: 'var(--font-heading), system-ui, sans-serif',
      body: 'var(--font-body), system-ui, sans-serif'
    },
    borderRadius: '1rem'
  },
  gradient: {
    name: 'Gradient',
    description: 'Modern, soft gradients with a premium feel.',
    mode: ['creative'],
    colors: {
      primary: '#ffffff',
      secondary: '#1e293b', // Slate 800
      accent: '#38bdf8', // Sky 400
      background: 'linear-gradient(to bottom right, #0f172a, #312e81)',
      text: '#f8fafc',
      cardBg: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      linkBg: 'rgba(255, 255, 255, 0.05)',
      linkBorder: 'rgba(255, 255, 255, 0.1)',
      inputBg: 'rgba(255, 255, 255, 0.05)',
      inputBorder: 'rgba(255, 255, 255, 0.1)'
    },
    fonts: {
      heading: 'var(--font-heading), system-ui, sans-serif',
      body: 'var(--font-body), system-ui, sans-serif'
    },
    borderRadius: '1.25rem'
  }
} as const;

/**
 * Retrieves all themes that support the specified profile mode.
 * 
 * @param mode - The current profile mode (casual, professional, creative)
 * @returns Array of theme configurations applicable to the mode
 */
export function getThemesByMode(mode: ProfileMode): (ThemeConfig & { id: ThemePreset })[] {
  return (Object.entries(themePresets) as [ThemePreset, ThemeConfig][])
    .map(([id, config]) => ({ id, ...config }));
}

/**
 * Retrieves a specific theme configuration by its preset ID.
 * 
 * @param preset - The identifier of the theme preset
 * @returns The theme configuration or a fallback (minimal) if not found
 */
export function getTheme(preset: string): ThemeConfig | null {
  if (preset in themePresets) {
    return themePresets[preset as ThemePreset];
  }
  return null;
}
