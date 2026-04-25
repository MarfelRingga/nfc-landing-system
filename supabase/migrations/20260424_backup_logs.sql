-- Create backup logs table for monitoring
CREATE TABLE IF NOT EXISTS public.backup_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT NOT NULL, -- 'success', 'failed', 'running'
    file_name TEXT,
    file_size BIGINT, -- in bytes
    error_message TEXT,
    destination TEXT DEFAULT 'Google Drive',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- Only admins should see this (simplified for this example, usually tied to role)
CREATE POLICY "Admins can view backup logs" ON public.backup_logs
    FOR SELECT USING (auth.role() = 'service_role');
