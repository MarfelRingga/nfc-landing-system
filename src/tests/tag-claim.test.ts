import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as claimTag } from '../app/api/tags/claim/route';
import { supabaseAdmin } from '../lib/supabaseAdmin';

vi.mock('../lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      upsert: vi.fn()
    }))
  }
}));

vi.mock('../lib/rate-limit', () => ({
  isRateLimited: vi.fn().mockReturnValue(false)
}));

describe('Tag Claim API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    (supabaseAdmin.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') });
    
    const req = new Request('http://localhost/api/tags/claim', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer invalid' },
      body: JSON.stringify({ token: 'test-token' })
    });

    const res = await claimTag(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 if token missing', async () => {
    (supabaseAdmin.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    
    const req = new Request('http://localhost/api/tags/claim', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer valid' },
      body: JSON.stringify({ })
    });

    const res = await claimTag(req);
    expect(res.status).toBe(400);
  });

  it('should claim tag successfully if valid', async () => {
    (supabaseAdmin.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: 'tag-1', user_id: null }, error: null });
    const mockUpdate = vi.fn().mockResolvedValue({ error: null });

    (supabaseAdmin.from as any).mockImplementation((table: string) => {
      if (table === 'nfc_tags') {
        return {
          select: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingle,
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis().mockImplementation(() => ({ error: null }))
        };
      }
      return { upsert: vi.fn() };
    });

    const req = new Request('http://localhost/api/tags/claim', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer valid' },
      body: JSON.stringify({ token: 'TESTTOKEN', tagName: 'New Tag' })
    });

    const res = await claimTag(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should fail if tag already claimed', async () => {
    (supabaseAdmin.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: 'tag-1', user_id: 'other-user' }, error: null });

    (supabaseAdmin.from as any).mockImplementation((table: string) => {
      if (table === 'nfc_tags') {
        return {
          select: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingle
        };
      }
    });

    const req = new Request('http://localhost/api/tags/claim', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer valid' },
      body: JSON.stringify({ token: 'TESTTOKEN' })
    });

    const res = await claimTag(req);
    const data = await res.json();
    
    expect(res.status).toBe(400);
    expect(data.error).toBe('Tag is already claimed.');
  });
});
