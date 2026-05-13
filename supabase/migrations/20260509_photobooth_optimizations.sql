-- 1. Index untuk mempercepat filter antrean per event
CREATE INDEX IF NOT EXISTS idx_queues_event_status ON queues(event_id, status);

-- 2. Index untuk mempercepat priority ordering saat panggilan Next
CREATE INDEX IF NOT EXISTS idx_queues_event_queue_number ON queues(event_id, queue_number);

-- 3. Index untuk mempercepat pengecekan validitas token sebelum expired
CREATE INDEX IF NOT EXISTS idx_tokens_event_code ON tokens(event_id, code);

-- 4. Index optimasi auto-cleanup old tokens
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON tokens(expires_at);
