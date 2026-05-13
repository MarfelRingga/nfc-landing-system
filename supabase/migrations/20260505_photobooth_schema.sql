CREATE TYPE IF NOT EXISTS queue_status AS ENUM ('WAITING', 'CALLED', 'IN_SESSION', 'DONE', 'SKIPPED');

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    code VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    token_id UUID REFERENCES tokens(id) ON DELETE CASCADE UNIQUE NOT NULL,
    queue_number INT NOT NULL,
    status queue_status DEFAULT 'WAITING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID REFERENCES queues(id) ON DELETE CASCADE UNIQUE NOT NULL,
    result_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menjamin HANYA BOLEH ADA SATU queue berstatus CALLED per event
CREATE UNIQUE INDEX IF NOT EXISTS unique_called_per_event 
ON queues (event_id) 
WHERE status = 'CALLED';

-- Gabungan index optimal untuk view polling
CREATE INDEX IF NOT EXISTS idx_queues_polling 
ON queues(event_id, status, queue_number);
