import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET, POST, DELETE } from '../app/api/admin/circles/route';
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

describe('Admin Circles API Security', () => {
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

  it('should deny access if not admin', async () => {
    setupAuth(false);
    const request = new Request('http://localhost/api/admin/circles', {
      headers: { 'Authorization': 'Bearer faketoken' }
    });
    const response = await GET(request);
    expect(response.status).toBe(403);
  });

  it('should allow GET if admin', async () => {
    setupAuth(true);
    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockResolvedValueOnce({ data: [{ id: '1', name: 'circle' }], error: null })
      })
    } as any);

    const request = new Request('http://localhost/api/admin/circles', {
      headers: { 'Authorization': 'Bearer faketoken' }
    });
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('should allow POST if admin', async () => {
    setupAuth(true);
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: '2' }, error: null })
      })
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      insert: mockInsert
    } as any);

    const request = new Request('http://localhost/api/admin/circles', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer faketoken' },
      body: JSON.stringify({ name: 'my circle', description: '', slug: 'c1', invite_code: 'CODE1' })
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should allow DELETE if admin', async () => {
    setupAuth(true);
    const mockDelete = vi.fn().mockReturnValueOnce({
      eq: vi.fn().mockResolvedValueOnce({ error: null })
    });
    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      delete: mockDelete
    } as any);

    const request = new Request('http://localhost/api/admin/circles?id=123', {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer faketoken' }
    });
    const response = await DELETE(request);
    expect(response.status).toBe(200);
  });
});
