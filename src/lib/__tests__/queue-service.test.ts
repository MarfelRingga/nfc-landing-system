import { describe, it, expect, vi, beforeEach } from 'vitest';
import { joinQueue, nextQueue, updateQueueStatus, getCurrentQueue, saveResult } from '../queue-service';

// Mock dependencies (e.g., Supabase client)
vi.mock('../supabase', () => {
  return {
    supabase: {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          if (table === 'tokens') {
            return Promise.resolve({ 
              data: { id: 1, event_id: 1, is_used: false, expires_at: new Date(Date.now() + 10000).toISOString() }, 
              error: null 
            });
          }
          if (table === 'queues') {
            return Promise.resolve({ 
              data: { id: 101, customer_name: "Test", status: 'WAITING', event_id: 1 }, 
              error: null 
            });
          }
          if (table === 'results') {
            return Promise.resolve({
              data: { id: 50 },
              error: null
            });
          }
          return Promise.resolve({ data: {}, error: null });
        }),
        then: vi.fn((cb) => {
          // For update() without single() or list selects
          if (table === 'queues') {
             return cb({ data: [{ id: 102, customer_name: "Test2" }], error: null });
          }
          cb({ data: [], error: null });
        })
      }))
    }
  };
});

describe('Queue Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('joinQueue', () => {
    it('should successfully join queue with valid token', async () => {
      const result = await joinQueue(1, 'Test Customer', 'VALID_TOKEN');
      expect(result.success).toBe(true);
      expect(result.queue?.status).toBe('WAITING');
    });

    it('should fail if inputs are missing', async () => {
      const result = await joinQueue(null as any, null as any, '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Data tidak lengkap');
    });
  });

  describe('nextQueue', () => {
    it('should correctly call next queue', async () => {
      const result = await nextQueue(1);
      expect(result.success).toBe(true);
    });
  });

  describe('updateQueueStatus', () => {
    it('should update status to DONE', async () => {
      const result = await updateQueueStatus(101, 'DONE');
      expect(result.success).toBe(true);
    });
  });

  describe('getCurrentQueue', () => {
    it('should fetch current called and waiting queues', async () => {
      const result = await getCurrentQueue(1);
      expect(result.success).toBe(true);
      expect(result.next_queues).toBeDefined();
    });
  });

  describe('saveResult', () => {
    it('should successfully save result from QR and return shareable link', async () => {
      const result = await saveResult(1, 'https://example.com/file');
      expect(result.success).toBe(true);
      expect(result.data?.shareable_link).toBe('/q/1/result/1');
    });

    it('should fail if missing inputs', async () => {
      const result = await saveResult(undefined as any, 'url');
      expect(result.success).toBe(false);
    });
  });
});

