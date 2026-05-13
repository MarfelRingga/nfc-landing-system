-- Index untuk optimasi kecepatan polling
CREATE INDEX IF NOT EXISTS idx_queues_polling ON queues(event_id, status, created_at);

-- 1. Mengambil antrean yang sedang dipanggil
SELECT id, user_id 
FROM queues 
WHERE event_id = 1 AND status = 'CALLED' 
ORDER BY created_at ASC 
LIMIT 1;

-- 2. Mengambil antrean berikutnya
SELECT id, user_id, created_at 
FROM queues 
WHERE event_id = 1 AND status = 'WAITING' 
ORDER BY created_at ASC 
LIMIT 1;

-- 3. Mengambil 5 antrean teratas
SELECT id, user_id, created_at 
FROM queues 
WHERE event_id = 1 AND status = 'WAITING' 
ORDER BY created_at ASC 
LIMIT 5;

-- 4. Panggil antrean berikutnya (NEXT QUEUE) aman dari race condition
UPDATE queues
SET status = 'CALLED'
WHERE id = (
  SELECT id 
  FROM queues 
  WHERE event_id = 1 AND status = 'WAITING' 
  ORDER BY created_at ASC 
  FOR UPDATE SKIP LOCKED 
  LIMIT 1
)
RETURNING id, user_id, status, created_at;

-- 5. Redeem Token & Masuk Antrean (Aman dari 2x klik/race condition)
WITH valid_token AS (
  UPDATE tokens
  SET is_used = TRUE
  WHERE code = 'INPUT_TOKEN_DISINI'
    AND is_used = FALSE
  RETURNING id AS token_id, event_id
)
INSERT INTO queues (event_id, user_id, token_id, status)
SELECT event_id, 1, token_id, 'WAITING'
FROM valid_token
RETURNING id;