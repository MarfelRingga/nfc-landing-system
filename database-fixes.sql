-- ==========================================
-- 🛠️ 1. BERSIH-BERSIH (CLEANUP)
-- ==========================================
-- Hapus RPC lama yang bentrok karena tipe data UUID
DROP FUNCTION IF EXISTS pb_join_queue(VARCHAR, UUID, VARCHAR);
DROP FUNCTION IF EXISTS pb_next_queue(UUID);
DROP FUNCTION IF EXISTS pb_generate_token(UUID, VARCHAR, TIMESTAMPTZ);

-- Modifikasi struktur tabel queues untuk putus hubungan (foreign key) dari tabel palsu ("users")
ALTER TABLE public.queues DROP CONSTRAINT IF EXISTS queues_user_id_fkey;

-- Hapus tabel palsu yang menimbulkan misinformasi
DROP TABLE IF EXISTS public.users CASCADE;

-- Pastikan type `queue_status` dikenali
DO $$ BEGIN
    CREATE TYPE public.queue_status AS ENUM ('WAITING', 'CALLED', 'IN_SESSION', 'DONE', 'SKIPPED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ==========================================
-- 🛠️ 2. MENYELARASKAN TABEL KE INTEGER
-- ==========================================
-- Karena tabel tokens, queues, events milik Anda sudah terlanjur integer,
-- kita cukup menyempurnakan struktur dan memastikan kolom penting ada:

ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS queue_number INTEGER;

-- Hapus kolom user_id yang menunjuk ke tabel users yg telah di-drop agar tak menjadi disinformasi
ALTER TABLE public.queues DROP COLUMN IF EXISTS user_id;

-- Pastikan status enum terkonversi (jika masih text)
ALTER TABLE public.queues 
  ALTER COLUMN status SET DEFAULT 'WAITING'::queue_status,
  ALTER COLUMN status TYPE queue_status USING status::text::queue_status;

ALTER TABLE public.tokens ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;


-- ==========================================
-- 🛠️ 3. REKREASI FUNGSI PUSAT (RPC) DENGAN INTEGER
-- ==========================================

-- A. FUNGSI UNTUK MENGAMBIL TIKET / JOIN ANTRETAN
CREATE OR REPLACE FUNCTION pb_join_queue(
    p_token_code VARCHAR,
    p_event_id INTEGER,
    p_customer_name VARCHAR
) RETURNS json AS $$
DECLARE
    v_token_id INTEGER;
    v_queue_id INTEGER;
    v_queue_number INT;
BEGIN
    -- Validasi dan pakai token (Atomically update token to is_used = true)
    UPDATE tokens
    SET is_used = TRUE
    WHERE code = p_token_code AND event_id = p_event_id AND is_used = FALSE AND expires_at > NOW()
    RETURNING id INTO v_token_id;

    IF v_token_id IS NULL THEN
        RAISE EXCEPTION 'Token ( % ) invalid, sudah dipakai, tidak cocok dengan event, atau kadaluwarsa', p_token_code;
    END IF;

    -- Generate Queue Number secara aman dengan LOCK dari concurrent insert
    INSERT INTO queues (event_id, token_id, customer_name, queue_number, status)
    SELECT 
        p_event_id, 
        v_token_id, 
        p_customer_name,
        COALESCE((SELECT MAX(queue_number) FROM queues WHERE event_id = p_event_id), 0) + 1,
        'WAITING'
    RETURNING id, queue_number INTO v_queue_id, v_queue_number;

    RETURN json_build_object('queue_id', v_queue_id, 'queue_number', v_queue_number);
END;
$$ LANGUAGE plpgsql;


-- B. FUNGSI ATOMIC PANGGIL NEXT QUEUE (Mencegah Rebutan Panggilan)
CREATE OR REPLACE FUNCTION pb_next_queue(
    p_event_id INTEGER
) RETURNS json AS $$
DECLARE
    v_current_id INTEGER;
    v_next_id INTEGER;
    v_next_number INT;
    v_status queue_status;
    v_customer_name VARCHAR;
BEGIN
    -- Pindahkan yang tadinya CALLED menjadi DONE (Bebas kustom, bisa jg SKIPPED)
    UPDATE queues
    SET status = 'DONE'
    WHERE event_id = p_event_id AND status = 'CALLED'
    RETURNING id INTO v_current_id;

    -- Ambil orang pertama diurutan WAITING terlama menggunakan SKIP LOCKED
    -- Ini memastikan admin mana pun tidak akan menekan orang yang sama.
    UPDATE queues
    SET status = 'CALLED'
    WHERE id = (
        SELECT id FROM queues 
        WHERE event_id = p_event_id AND status = 'WAITING' 
        ORDER BY queue_number ASC 
        FOR UPDATE SKIP LOCKED 
        LIMIT 1
    )
    RETURNING id, queue_number, status, customer_name INTO v_next_id, v_next_number, v_status, v_customer_name;

    IF v_next_id IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN json_build_object('id', v_next_id, 'queue_number', v_next_number, 'status', v_status, 'customer_name', v_customer_name);
END;
$$ LANGUAGE plpgsql;


-- C. FUNGSI GENERATE TOKEN DENGAN LAZY CLEANUP
CREATE OR REPLACE FUNCTION pb_generate_token(
    p_event_id INTEGER,
    p_code VARCHAR,
    p_expires_at TIMESTAMPTZ
) RETURNS json AS $$
DECLARE
    v_token_id INTEGER;
BEGIN
    -- Menghapus token kadaluwarsa/terpakai agar DB Free Tier tidak cepat penuh
    DELETE FROM tokens 
    WHERE event_id = p_event_id AND (is_used = TRUE OR expires_at < NOW());

    INSERT INTO tokens (event_id, code, expires_at)
    VALUES (p_event_id, p_code, p_expires_at)
    RETURNING id INTO v_token_id;

    RETURN json_build_object('id', v_token_id, 'code', p_code);
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- 🛠️ 4. INDEX HARMONISASI (PERCEPAT MEMBACA DATA REALTIME)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_queues_event_status ON queues(event_id, status);
CREATE INDEX IF NOT EXISTS idx_queues_event_queue_number ON queues(event_id, queue_number);
CREATE INDEX IF NOT EXISTS idx_tokens_event_code ON tokens(event_id, code);
