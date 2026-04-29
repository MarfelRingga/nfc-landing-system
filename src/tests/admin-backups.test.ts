import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET } from '../app/api/admin/backups/route';
import { supabaseAdmin } from '../lib/supabaseAdmin';

vi.mock('../lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('../lib/rate-limit', () => ({
  isRateLimited: vi.fn().mockReturnValue(false),
}));

describe('Admin Backups API Security', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const setupAuth = (isAdmin: boolean) => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: 'admin-user' } },
      error: null
    } as any);

    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: { is_admin: isAdmin } })
        })
      })
    } as any);
  };

  it('should deny GET if not admin', async () => {
    setupAuth(false);
    const request = new Request('http://localhost/api/admin/backups', {
      headers: { 'Authorization': 'Bearer faketoken' }
    });
    const response = await GET(request);
    expect(response.status).toBe(403);
  });

  it('should allow GET if admin', async () => {
    setupAuth(true);
    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce({ data: [{ id: '1', status: 'success' }], error: null })
        })
      })
    } as any);

    const request = new Request('http://localhost/api/admin/backups', {
      headers: { 'Authorization': 'Bearer faketoken' }
    });
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
