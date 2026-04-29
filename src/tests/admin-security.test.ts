import { describe, it, expect, vi, afterEach } from 'vitest';
import { POST } from '../app/api/admin/users/[id]/role/route';
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


describe('Admin User Role Toggle Security', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should deny role change if not authenticated', async () => {
    const request = new Request('http://localhost/api/admin/users/123/role', {
      method: 'POST',
      headers: {},
      body: JSON.stringify({ is_admin: true })
    });
    
    // Typecast to unknown then to appropriate type to bypass type issues if any
    const response = await POST(request as any, { params: Promise.resolve({ id: '123' }) } as any);
    expect(response.status).toBe(401);
  });

  it('should deny role change if user is not admin', async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: 'evil-user' } },
      error: null
    } as any);

    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: { is_admin: false } })
        })
      })
    } as any);

    const request = new Request('http://localhost/api/admin/users/123/role', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer faketoken' },
      body: JSON.stringify({ is_admin: true })
    });
    
    const response = await POST(request as any, { params: Promise.resolve({ id: '123' }) } as any);
    expect(response.status).toBe(403);
  });

  it('should allow role change if user is admin', async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: 'admin-user' } },
      error: null
    } as any);

    const mockUpdate = vi.fn().mockReturnValueOnce({
      eq: vi.fn().mockResolvedValueOnce({ error: null })
    });

    vi.mocked(supabaseAdmin.from)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: { is_admin: true } })
          })
        })
      } as any)
      .mockReturnValueOnce({
        update: mockUpdate
      } as any);

    const request = new Request('http://localhost/api/admin/users/123/role', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer validtoken' },
      body: JSON.stringify({ is_admin: true })
    });
    
    const response = await POST(request as any, { params: Promise.resolve({ id: '123' }) } as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ is_admin: true });
  });
});
