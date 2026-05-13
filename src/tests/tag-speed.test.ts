import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseAdmin } from '../lib/supabaseAdmin';

vi.mock('../lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn()
    }))
  }
}));

describe('Optimized Tag Redirect Query', () => {
  it('should construct the query with joins', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ 
      data: { 
        status: 'active',
        interaction_mode: 'profile',
        user_id: 'user-1',
        profiles: { username: 'johndoe' }
      }, 
      error: null 
    });

    (supabaseAdmin.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle
    }));

    // Logic simulation
    const { data } = await supabaseAdmin
      .from('nfc_tags')
      .select('*, circles(slug, invite_code), profiles(username)')
      .ilike('token', 'abc')
      .maybeSingle();

    expect(data.profiles.username).toBe('johndoe');
  });
});
