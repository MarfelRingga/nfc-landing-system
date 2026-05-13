ALTER TABLE queues ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);

-- Replace functions
CREATE OR REPLACE FUNCTION pb_join_queue(
    p_token_code VARCHAR,
    p_event_id UUID,
    p_customer_name VARCHAR
) RETURNS json AS $$
DECLARE
    v_token_id UUID;
    v_queue_id UUID;
    v_queue_number INT;
BEGIN
    -- Update token and return id
    UPDATE tokens
    SET is_used = TRUE
    WHERE code = p_token_code AND event_id = p_event_id AND is_used = FALSE AND expires_at > NOW()
    RETURNING id INTO v_token_id;

    IF v_token_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired token';
    END IF;

    -- Get max queue_number and insert atomically. We lock the table shortly.
    -- Better way:
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


CREATE OR REPLACE FUNCTION pb_next_queue(
    p_event_id UUID
) RETURNS json AS $$
DECLARE
    v_current_id UUID;
    v_next_id UUID;
    v_next_number INT;
    v_status queue_status;
    v_customer_name VARCHAR;
BEGIN
    -- Move current CALLED to DONE
    UPDATE queues
    SET status = 'DONE'
    WHERE event_id = p_event_id AND status = 'CALLED'
    RETURNING id INTO v_current_id;

    -- Get earliest WAITING queue using FOR UPDATE SKIP LOCKED
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

CREATE OR REPLACE FUNCTION pb_generate_token(
    p_event_id UUID,
    p_code VARCHAR,
    p_expires_at TIMESTAMPTZ
) RETURNS json AS $$
DECLARE
    v_token_id UUID;
BEGIN
    -- Lazy cleanup
    DELETE FROM tokens 
    WHERE event_id = p_event_id AND (is_used = TRUE OR expires_at < NOW());

    INSERT INTO tokens (event_id, code, expires_at)
    VALUES (p_event_id, p_code, p_expires_at)
    RETURNING id INTO v_token_id;

    RETURN json_build_object('id', v_token_id, 'code', p_code);
END;
$$ LANGUAGE plpgsql;
