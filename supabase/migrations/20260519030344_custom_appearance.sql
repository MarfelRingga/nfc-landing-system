-- Migration: Add custom_appearance JSONB column to profiles
-- Purpose: Consolidates appearance settings (mode, preset, colors, font_family, border_radius)
-- into a single JSONB column. We keep profile_mode and theme_preset for backward compatibility.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_appearance JSONB DEFAULT '{
  "mode": "casual",
  "preset": "vibrant",
  "colors": {
    "primary": "#7c3aed",
    "secondary": "#F4F3EE",
    "accent": "#ec4899"
  },
  "font_family": "Inter",
  "border_radius": "rounded"
}'::jsonb;

-- Idempotent constraint addition: drop if exists, then add.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_custom_appearance_mode;
ALTER TABLE public.profiles ADD CONSTRAINT check_custom_appearance_mode 
CHECK (custom_appearance->>'mode' IN ('casual', 'professional', 'creative'));

COMMENT ON COLUMN public.profiles.custom_appearance IS 'Consolidates all appearance settings: mode, preset, custom colors, font, and border radius.';
