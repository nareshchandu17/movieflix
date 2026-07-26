/**
 * CSRF Protection Utilities
 * Provides CSRF token generation and validation for state-changing operations
 */

import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a random CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string | null): boolean {
  if (!token) return false;
  
  // In production, you would validate against a stored token
  // For now, we check if it's a valid hex string of expected length
  return /^[a-f0-9]{64}$/.test(token);
}

/**
 * Get CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  return request.headers.get(CSRF_HEADER_NAME);
}

/**
 * Get CSRF token from cookie
 */
export function getCSRFTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const csrfCookie = cookies.find(c => c.startsWith(`${CSRF_COOKIE_NAME}=`));
  
  return csrfCookie ? csrfCookie.split('=')[1] : null;
}

/**
 * Check if request should be protected from CSRF
 */
export function shouldProtectFromCSRF(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  return protectedMethods.includes(method.toUpperCase());
}

/**
 * Middleware to validate CSRF token
 */
export function csrfProtection(request: Request): { valid: boolean; error?: string } {
  const method = request.method;
  
  // Only protect state-changing operations
  if (!shouldProtectFromCSRF(method)) {
    return { valid: true };
  }
  
  // Get token from header
  const headerToken = getCSRFTokenFromRequest(request);
  
  // Get token from cookie
  const cookieHeader = request.headers.get('cookie');
  const cookieToken = getCSRFTokenFromCookie(cookieHeader);
  
  // Validate tokens
  const headerValid = validateCSRFToken(headerToken);
  const cookieValid = validateCSRFToken(cookieToken);
  
  if (!headerValid || !cookieValid) {
    return {
      valid: false,
      error: 'Invalid CSRF token'
    };
  }
  
  // In production, compare header token with stored token
  // For now, we just check if both are present and valid format
  if (headerToken !== cookieToken) {
    return {
      valid: false,
      error: 'CSRF token mismatch'
    };
  }
  
  return { valid: true };
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
