import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET } from '../app/api/admin/stats/route';
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

describe('Admin Stats API Security', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should deny access if not authenticated', async () => {
    const request = new Request('http://localhost/api/admin/stats');
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should deny access if authenticated user is not an admin', async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: 'regular-user' } },
      error: null
    } as any);

    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: { is_admin: false } })
        })
      })
    } as any);

    const request = new Request('http://localhost/api/admin/stats', {
      headers: { 'Authorization': 'Bearer faketoken' }
    });
    
    const response = await GET(request);
    expect(response.status).toBe(403);
  });

  it('should return stats if authenticated as admin', async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: 'admin-user' } },
      error: null
    } as any);

    const mockProfileSelect = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { is_admin: true } })
        })
      })
    };

    const mockCountSelect = {
      select: vi.fn().mockResolvedValue({ count: 10, error: null })
    };
    
    const mockBackupSelect = {
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { status: 'success' }, error: null })
          })
        })
      })
    };

    vi.mocked(supabaseAdmin.from)
      .mockImplementation((tableName) => {
        if (tableName === 'nfc_tags') return mockCountSelect as any;
        if (tableName === 'backup_logs') return mockBackupSelect as any;
        if (tableName === 'profiles') {
          // If the query is just .select('*', { count: ... }) it's the 2nd mock, otherwise it's the auth one
          // So we need to mock based on methods called, but since we map the table directly:
          return {
            select: vi.fn().mockImplementation((selStr, opts) => {
              if (opts?.count === 'exact') {
                return Promise.resolve({ count: 10, error: null });
              }
              return {
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { is_admin: true } })
                })
              };
            })
          } as any;
        }
        return {} as any;
      });

    const request = new Request('http://localhost/api/admin/stats', {
      headers: { 'Authorization': 'Bearer admin-token' }
    });
    
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.stats).toEqual({
      users: 10,
      tags: 10,
      backups: 'success'
    });
  });
});
