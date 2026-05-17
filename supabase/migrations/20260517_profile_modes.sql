-- Migration: Add Multi-Mode Profile Support
-- Description: Adds profile_mode, theme_preset, custom_theme, and field_visibility to profiles. Creates profile_templates table.

-- 0. Backup original profiles table data before modification
CREATE TABLE IF NOT EXISTS profiles_backup_20260517 AS SELECT * FROM profiles;

-- 1. Update profiles table (idempotent additions)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_mode') THEN
        ALTER TABLE profiles ADD COLUMN profile_mode VARCHAR(50) DEFAULT 'casual' CHECK (profile_mode IN ('casual', 'professional', 'creative'));
        COMMENT ON COLUMN profiles.profile_mode IS 'The mode of the profile (casual, professional, creative)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'theme_preset') THEN
        ALTER TABLE profiles ADD COLUMN theme_preset VARCHAR(100) DEFAULT 'default';
        COMMENT ON COLUMN profiles.theme_preset IS 'The selected theme preset for the profile';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'custom_theme') THEN
        ALTER TABLE profiles ADD COLUMN custom_theme JSONB;
        COMMENT ON COLUMN profiles.custom_theme IS 'Custom theme options (colors, fonts, etc) overriding the preset';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'field_visibility') THEN
        ALTER TABLE profiles ADD COLUMN field_visibility JSONB;
        COMMENT ON COLUMN profiles.field_visibility IS 'Visibility settings for specific fields (e.g., {"phone": false, "email": true})';
    END IF;
END $$;

-- 2. Create profile_templates table (idempotent)
CREATE TABLE IF NOT EXISTS profile_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('casual', 'professional', 'creative')),
    theme_preset VARCHAR(100) DEFAULT 'default',
    default_fields JSONB DEFAULT '{}'::jsonb,
    placeholder_overrides JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE profile_templates IS 'Templates for different profile modes to quick-start users.';
COMMENT ON COLUMN profile_templates.name IS 'Name of the template (e.g., "High School Student")';
COMMENT ON COLUMN profile_templates.mode IS 'The profile mode this template belongs to';
COMMENT ON COLUMN profile_templates.default_fields IS 'Default data layout and fields for this template';
COMMENT ON COLUMN profile_templates.placeholder_overrides IS 'Custom placeholders for empty states based on this template';

-- Enable RLS for profile_templates
ALTER TABLE profile_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to make it idempotent
DROP POLICY IF EXISTS "Templates are viewable by everyone" ON profile_templates;

-- Policy: Everyone can read templates
CREATE POLICY "Templates are viewable by everyone"
    ON profile_templates FOR SELECT
    USING (true);

-- 3. Seed 3 template rows
-- Using ON CONFLICT with an explicit unique constraint/index. 
-- Since id is the PK, we can insert with known UUIDs to ensure idempotency.
INSERT INTO profile_templates (id, name, mode, theme_preset, default_fields, placeholder_overrides)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'SMA Student',
        'casual',
        'vibrant',
        '{"company": "SMA Negeri 1", "job_title": "Student", "bio": "Just enjoying the ride."}'::jsonb,
        '{"bio": "What are you up to these days?", "job_title": "What grade are you in?"}'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'Entrepreneur',
        'professional',
        'minimal',
        '{"company": "My Startup", "job_title": "Founder", "bio": "Building the future."}'::jsonb,
        '{"bio": "Share your vision and mission.", "company": "What is the name of your company?"}'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'Creative Professional',
        'creative',
        'dark_mode',
        '{"company": "Freelance", "job_title": "Designer / Artist", "bio": "Designing experiences."}'::jsonb,
        '{"bio": "Tell us about your creative process.", "portfolio_link": "Link to your Behance / Dribbble."}'::jsonb
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    mode = EXCLUDED.mode,
    theme_preset = EXCLUDED.theme_preset,
    default_fields = EXCLUDED.default_fields,
    placeholder_overrides = EXCLUDED.placeholder_overrides;
