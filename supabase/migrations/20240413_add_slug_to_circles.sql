-- Add slug column to circles table
ALTER TABLE circles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Populate slug for existing circles
UPDATE circles 
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 6) 
WHERE slug IS NULL;
