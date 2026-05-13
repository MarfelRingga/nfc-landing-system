import crypto from 'crypto';

/**
 * 1. Contoh Struktur Data Token
 * Representasi dari database PostgreSQL
 */
export interface QueueToken {
  id: string;         // UUID
  event_id: string;   // UUID
  token: string;      // Base64URL string
  is_used: boolean;
  expires_at: Date;
  created_at: Date;
}

/**
 * 2. Fungsi Generate Token
 * Menghasilkan token Base64URL secara acak yang unik.
 */
export function generateToken(eventId: string, expiresInMinutes: number = 60): Omit<QueueToken, 'id'> {
  // Generate 32 bytes random data, lalu encode ke format Base64URL yang aman untuk web
  const rawToken = crypto.randomBytes(32);
  const base64UrlToken = rawToken.toString('base64url');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60000);

  return {
    event_id: eventId,
    token: base64UrlToken,
    is_used: false,
    expires_at: expiresAt,
    created_at: now,
  };
}

/**
 * 3. Fungsi Validasi Token
 * Mengecek apakah token valid (ada, belum digunakan, dan belum expired).
 */
export function validateToken(tokenRecord: QueueToken | null): { isValid: boolean; message: string } {
  if (!tokenRecord) {
    return { isValid: false, message: 'Token tidak valid atau tidak ditemukan' };
  }

  if (tokenRecord.is_used) {
    return { isValid: false, message: 'Token sudah digunakan (One-time use)' };
  }

  const now = new Date();
  if (now > tokenRecord.expires_at) {
    return { isValid: false, message: 'Token sudah kedaluwarsa' };
  }

  return { isValid: true, message: 'Token valid dan bisa digunakan' };
}
