import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Memastikan kita menggunakan service_role key untuk bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

describe('Admin Dashboard Create Event', () => {
  it('should create an event successfully bypassing RLS', async () => {
    // Kita tes fungsi di backend / database layer bypass RLS
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({ name: 'Test Event Photobooth Admin' })
      .select()
      .single();
    
    expect(error).toBeNull();
    expect(data).toHaveProperty('name', 'Test Event Photobooth Admin');
  });
});

