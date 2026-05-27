/**
 * Defines the available profile modes.
 * Each mode tailors the fields, themes, and overall presentation of the profile.
 */
export type ProfileMode = 'casual' | 'professional' | 'creative';

/**
 * Defines the available theme presets.
 * Presets pre-configure colors, typography, and spacing.
 */
export type ThemePreset = 'vibrant' | 'playful' | 'corporate' | 'minimal' | 'gradient';

/**
 * Represents the configuration for a single input field in the profile editor.
 */
export interface ProfileField {
  /** The display label for the field */
  label: string;
  /** The placeholder text when the field is empty */
  placeholder: string;
  /** The HTML input type or variant */
  type: 'text' | 'email' | 'tel' | 'textarea' | 'url';
  /** Whether the field is mandatory */
  required: boolean;
  /** Maximum number of characters allowed */
  maxLength?: number;
  /** Optional Lucide icon name for the field */
  icon?: string;
  /** Optional auto-formatting mask or logic identifier */
  autoFormat?: string;
}

/**
 * Template structure used to prepopulate a profile based on a selected mode or archetype.
 */
export interface ProfileTemplate {
  /** Unique template identifier */
  id: string;
  /** Name of the template (e.g., "Software Engineer") */
  name: string;
  /** The associated profile mode */
  mode: ProfileMode;
  /** The default theme preset applied with this template */
  theme_preset: ThemePreset;
  /** Default values for standard fields */
  default_fields: Record<string, string>;
  /** Custom placeholders to override default field placeholders */
  placeholder_overrides: Record<string, string>;
  /** Timestamp when the template was created */
  created_at: string;
}

/**
 * Defines a specific color token used within a custom theme.
 */
export interface ThemeColor {
  /** The color value, typically a hex code or RGB string */
  value: string;
  /** Optional semantic name for the color */
  name?: string;
}

/**
 * Custom theme configuration allowing overrides of a preset theme.
 */
export interface CustomTheme {
  /** Background colors or gradients */
  background?: ThemeColor | ThemeColor[];
  /** Primary text color */
  textPrimary?: ThemeColor;
  /** Secondary text color */
  textSecondary?: ThemeColor;
  /** Accent color for buttons and links */
  accent?: ThemeColor;
  /** Card or container background color */
  cardBackground?: ThemeColor;
  /** Font family override */
  fontFamily?: string;
  /** Border radius scaling factor or specific value */
  borderRadius?: string;
}

/**
 * Base profile properties shared across all modes.
 */
export interface BaseProfile {
  id: string;
  /** References auth.users or similar */
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  profile_links: { title: string; url: string }[] | null;
  created_at: string;
  updated_at: string;
  
  /** Current active mode of the profile */
  profile_mode: ProfileMode;
  /** Selected theme preset */
  theme_preset: ThemePreset;
  /** Custom theme overrides */
  custom_theme: CustomTheme | null;
  /** Visibility toggles for specific fields */
  field_visibility: Record<string, boolean> | null;
}

/**
 * Fields specific to the casual profile mode.
 */
export interface CasualProfile extends BaseProfile {
  profile_mode: 'casual';
  mode_specific_fields?: {
    hobbies?: string[];
    music_link?: string;
    favorite_quote?: string;
  };
}

/**
 * Fields specific to the professional profile mode.
 */
export interface ProfessionalProfile extends BaseProfile {
  profile_mode: 'professional';
  mode_specific_fields?: {
    resume_url?: string;
    linkedin_url?: string;
    years_of_experience?: number;
    skills?: string[];
  };
}

/**
 * Fields specific to the creative profile mode.
 */
export interface CreativeProfile extends BaseProfile {
  profile_mode: 'creative';
  mode_specific_fields?: {
    portfolio_url?: string;
    behance_url?: string;
    dribbble_url?: string;
    featured_work?: { title: string; image_url: string; link: string }[];
  };
}

/**
 * Discriminated union combining all specific profile types.
 * Use this type when a profile can be in any mode.
 */
export type Profile = CasualProfile | ProfessionalProfile | CreativeProfile;

/**
 * Represents the tabs available in the profile editor.
 */
export type ProfileTab = 'profile' | 'appearance' | 'links';

/**
 * Supported font families for profile appearance.
 */
export type FontFamily = 'Inter' | 'Space Grotesk' | 'JetBrains Mono';

/**
 * Supported border radius styles for profile appearance.
 * subtle = 8px, rounded = 12px, pill = 24px
 */
export type BorderRadius = 'subtle' | 'rounded' | 'pill';

/**
 * Defines custom colors for the profile in HEX format (#xxxxxx).
 */
export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
}

/**
 * Represents the consolidated appearance settings for a profile.
 * This replaces separate mode, theme preset, and custom theme configs.
 */
export interface CustomAppearance {
  mode: ProfileMode;
  preset: ThemePreset | null;
  colors: CustomColors;
  font_family: FontFamily;
  border_radius: BorderRadius;
}

/**
 * Default appearance settings for new users.
 */
export const DEFAULT_APPEARANCE: CustomAppearance = {
  mode: 'casual',
  preset: 'minimal',
  colors: {
    primary: '#0f172a',
    secondary: '#f8fafc',
    accent: '#64748b',
  },
  font_family: 'Inter',
  border_radius: 'rounded',
};

/**
 * Available font options with preview text.
 */
export const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter', preview: 'The quick brown fox' },
  { value: 'Space Grotesk', label: 'Space Grotesk', preview: 'The quick brown fox' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', preview: 'The quick brown fox' },
] as const;

/**
 * Available border radius options.
 */
export const BORDER_RADIUS_OPTIONS = [
  { value: 'subtle', label: 'Subtle', px: 8, description: 'Clean & modern' },
  { value: 'rounded', label: 'Rounded', px: 12, description: 'Friendly & standard' },
  { value: 'pill', label: 'Pill', px: 24, description: 'Trendy & playful' },
] as const;

/**
 * Curated popular HEX colors for profile primary colors.
 */
export const POPULAR_COLORS: string[] = [
  '#a855f7', // purple
  '#ec4899', // pink
  '#3b82f6', // blue
  '#22c55e', // green
  '#f97316', // orange
  '#ef4444', // red
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#64748b', // slate
];
