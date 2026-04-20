/**
 * Validates and sanitizes username input.
 * Max length: 30 chars.
 */
export function validateUsername(username: string | null | undefined): string {
  if (!username) throw new Error('Username is required');
  
  const sanitized = username.trim();
  if (sanitized.length === 0) throw new Error('Username cannot be empty');
  if (sanitized.length > 30) throw new Error('Username must be 30 characters or less');
  
  return sanitized;
}

/**
 * Validates and sanitizes bio input.
 * Max length: 200 chars.
 */
export function validateBio(bio: string | null | undefined): string {
  if (!bio) return ''; // Bio is optional
  
  const sanitized = bio.trim();
  if (sanitized.length > 200) throw new Error('Bio must be 200 characters or less');
  
  return sanitized;
}

/**
 * Validates URL format for links.
 */
export function validateUrl(url: string | null | undefined): string {
  if (!url) return ''; // URL is optional
  
  const sanitized = url.trim();
  if (sanitized.length === 0) return '';
  
  try {
    const parsedUrl = new URL(sanitized);
    // Ensure only safe protocols are allowed
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP or HTTPS protocols are allowed');
    }
    return parsedUrl.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}
