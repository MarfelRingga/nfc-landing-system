type RateLimitRecord = {
  count: number;
  resetTime: number;
};

// In-memory store (Note: In serverless environments, this resets per instance/cold-start. 
// For distributed systems requiring exact limits, consider Redis).
const rateCache = new Map<string, RateLimitRecord>();

/**
 * Validates if the given identifier (e.g., IP address) has exceeded the rate limit.
 * Defaults to 10 requests per 10 seconds.
 */
export function isRateLimited(identifier: string, limit: number = 10, windowMs: number = 10000): boolean {
  const now = Date.now();
  const userRecord = rateCache.get(identifier);

  // Clean up expired records occasionally to prevent memory leaks in long-running processes
  if (rateCache.size > 1000) {
    for (const [key, record] of rateCache.entries()) {
      if (now > record.resetTime) {
        rateCache.delete(key);
      }
    }
  }

  // If no record exists, create one
  if (!userRecord) {
    rateCache.set(identifier, { count: 1, resetTime: now + windowMs });
    return false; // Not rate limited
  }

  // If time window has passed, reset
  if (now > userRecord.resetTime) {
    rateCache.set(identifier, { count: 1, resetTime: now + windowMs });
    return false; // Not rate limited
  }

  // If within the window and exceeded limit
  if (userRecord.count >= limit) {
    return true; // Rate limited - Block
  }

  // Increment hit count
  userRecord.count += 1;
  return false; // Not rate limited
}
