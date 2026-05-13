import { describe, it, expect } from 'vitest';
import { generateToken, validateToken, QueueToken } from '../queue-token';

describe('Queue Token System', () => {
  describe('generateToken', () => {
    it('should generate a valid length token', () => {
      const token = generateToken('event-123', 60);
      expect(token.event_id).toBe('event-123');
      expect(token.token).toBeTypeOf('string');
      expect(token.token.length).toBeGreaterThan(32);
      expect(token.is_used).toBe(false);
    });

    it('should set the correct expiration time', () => {
      const now = new Date();
      const token = generateToken('event-123', 60);
      const expectedExpiration = new Date(now.getTime() + 60 * 60000);
      
      // Allow 1 second difference for execution time
      expect(token.expires_at.getTime()).toBeCloseTo(expectedExpiration.getTime(), -3); 
    });
  });

  describe('validateToken', () => {
    it('should return invalid if token record is null', () => {
      const result = validateToken(null);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Token tidak valid atau tidak ditemukan');
    });

    it('should return invalid if token is used', () => {
      const token: QueueToken = {
        id: '1',
        event_id: 'event-123',
        token: 'xxx',
        is_used: true,
        expires_at: new Date(Date.now() + 10000),
        created_at: new Date(),
      };
      const result = validateToken(token);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Token sudah digunakan (One-time use)');
    });

    it('should return invalid if token is expired', () => {
      const token: QueueToken = {
        id: '1',
        event_id: 'event-123',
        token: 'xxx',
        is_used: false,
        expires_at: new Date(Date.now() - 10000), // Expired 10 secs ago
        created_at: new Date(Date.now() - 20000),
      };
      const result = validateToken(token);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Token sudah kedaluwarsa');
    });

    it('should return valid if token is unused and not expired', () => {
      const token: QueueToken = {
        id: '1',
        event_id: 'event-123',
        token: 'xxx',
        is_used: false,
        expires_at: new Date(Date.now() + 10000), // Expires in 10 secs
        created_at: new Date(),
      };
      const result = validateToken(token);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Token valid dan bisa digunakan');
    });
  });
});
