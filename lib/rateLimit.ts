// In-memory rate limiter for development
// In production, use Redis or similar

const rateLimitStore = new Map();

/**
 * Rate limiter implementation
 * @param {string} identifier - Unique identifier (IP, phone, etc.)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} Rate limit status
 */
export function rateLimit(identifier, maxRequests = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const key = `${identifier}:${Math.floor(now / windowMs)}`;
  
  const record = rateLimitStore.get(key);
  
  if (!record) {
    // First request in this window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }
  
  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }
  
  // Increment counter
  record.count++;
  
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimit() {
  const now = Date.now();
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

export default {
  rateLimit,
  cleanupRateLimit,
};
