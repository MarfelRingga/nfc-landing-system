ALTER TYPE queue_status ADD VALUE IF NOT EXISTS 'CANCELED';

ALTER TABLE events ADD COLUMN IF NOT EXISTS require_attachment BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS display_theme JSONB DEFAULT '{"backgroundColor": "#111827", "textColor": "#ffffff", "primaryColor": "#4f46e5"}'::jsonb;
