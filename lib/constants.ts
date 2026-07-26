/**
 * Enterprise Application Constants
 * Extracted magic numbers for global configuration
 */

export const API_CONFIG = {
  DEFAULT_TIMEOUT_MS: 15000,
  DEFAULT_RETRY_COUNT: 3,
  DEFAULT_RETRY_DELAY_MS: 1000,
  PAGINATION_DEFAULT_LIMIT: 20,
  PAGINATION_MAX_LIMIT: 100,
};

export const CACHE_CONFIG = {
  TTL_DEFAULT_SEC: 3600, // 1 hour
  TTL_SHORT_SEC: 300,    // 5 minutes
  TTL_LONG_SEC: 86400,   // 24 hours
};

export const ANIMATION_CONFIG = {
  DURATION_FAST_MS: 150,
  DURATION_NORMAL_MS: 300,
  DURATION_SLOW_MS: 500,
};

export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  SESSION_TIMEOUT_MINUTES: 30,
};
