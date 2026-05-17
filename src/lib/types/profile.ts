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
