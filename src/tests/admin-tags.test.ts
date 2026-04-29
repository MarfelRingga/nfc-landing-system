import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET, POST, DELETE } from '../app/api/admin/tags/route';
import { supabaseAdmin } from '../lib/supabaseAdmin';

vi.mock('../lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock rate limiting
vi.mock('../lib/rate-limit', () => ({
  isRateLimited: vi.fn().mockReturnValue(false),
}));

describe('Admin Tags API Security', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const setupAuth = (isAdmin: boolean) => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: 'test-user' } },
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

  it('should deny GET if not authenticated', async () => {
    const request = new Request('http://localhost/api/admin/tags');
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should deny GET if not admin', async () => {
    setupAuth(false);
    const request = new Request('http://localhost/api/admin/tags', {
      headers: { 'Authorization': 'Bearer faketoken' }
    });
    const response = await GET(request);
    expect(response.status).toBe(403);
  });

  it('should allow GET if admin', async () => {
    setupAuth(true);
    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockResolvedValueOnce({ data: [{ id: '1', token: 'test' }], error: null })
      })
    } as any);

    const request = new Request('http://localhost/api/admin/tags', {
      headers: { 'Authorization': 'Bearer faketoken' }
    });
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('should deny POST if not admin', async () => {
    setupAuth(false);
    const request = new Request('http://localhost/api/admin/tags', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer faketoken' },
      body: JSON.stringify({ token: 'new-token' })
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it('should allow POST if admin', async () => {
    setupAuth(true);
    const mockInsert = vi.fn().mockResolvedValueOnce({ error: null });
    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      insert: mockInsert
    } as any);

    const request = new Request('http://localhost/api/admin/tags', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer faketoken' },
      body: JSON.stringify({ token: 'new-token' })
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledWith({ token: 'new-token', status: 'active' });
  });

  it('should deny DELETE if not admin', async () => {
    setupAuth(false);
    const request = new Request('http://localhost/api/admin/tags?id=123', {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer faketoken' }
    });
    const response = await DELETE(request);
    expect(response.status).toBe(403);
  });

  it('should allow DELETE if admin', async () => {
    setupAuth(true);
    const mockDelete = vi.fn().mockReturnValueOnce({
      eq: vi.fn().mockResolvedValueOnce({ error: null })
    });
    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      delete: mockDelete
    } as any);

    const request = new Request('http://localhost/api/admin/tags?id=123', {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer faketoken' }
    });
    const response = await DELETE(request);
    expect(response.status).toBe(200);
  });
});
