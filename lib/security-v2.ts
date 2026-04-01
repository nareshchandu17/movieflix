import crypto from 'crypto';

/**
 * Security utilities for OTT-grade authentication
 */
export class SecurityUtils {
  private static readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly MAX_PROFILE_SWITCHES = 20;
  
  // Rate limiting storage (in production, use Redis)
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash password with salt
   */
  static async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const saltToUse = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, saltToUse, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: saltToUse };
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const { hash: computedHash } = await this.hashPassword(password, salt);
    return computedHash === hash;
  }

  /**
   * Check rate limit for login attempts
   */
  static checkRateLimit(identifier: string, maxAttempts: number = this.MAX_LOGIN_ATTEMPTS): boolean {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;
    const record = this.rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Check rate limit for profile switching
   */
  static checkProfileSwitchRateLimit(userId: string): boolean {
    return this.checkRateLimit(`profile_switch:${userId}`, this.MAX_PROFILE_SWITCHES);
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate profile name
   */
  static validateProfileName(name: string): { isValid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Profile name is required' };
    }

    if (name.trim().length > 50) {
      return { isValid: false, error: 'Profile name must be 50 characters or less' };
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
      return { isValid: false, error: 'Profile name can only contain letters, numbers, spaces, hyphens, and underscores' };
    }

    return { isValid: true };
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return this.generateSecureToken(32);
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token: string, sessionToken: string): boolean {
    // In production, validate against stored session token
    return token.length === 64 && sessionToken.length > 0;
  }

  /**
   * Extract IP address from request
   */
  static extractIP(request: any): string {
    return request.headers['x-forwarded-for']?.split(',')[0] ||
           request.headers['x-real-ip'] ||
           request.connection?.remoteAddress ||
           'unknown';
  }

  /**
   * Check for suspicious activity patterns
   */
  static detectSuspiciousActivity(userId: string, action: string, metadata: any): boolean {
    // Implement suspicious activity detection logic
    const suspiciousPatterns = [
      'multiple_profile_switches',
      'rapid_api_calls',
      'unusual_time_patterns'
    ];

    // Log for monitoring
    console.log(`Security Check: User ${userId}, Action: ${action}, Metadata:`, metadata);

    // Return false for now, implement actual logic as needed
    return false;
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string, key: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(userAgent: string, ip: string): string {
    const data = `${userAgent}-${ip}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate session integrity
   */
  static validateSessionIntegrity(session: any, request: any): boolean {
    // Check if session is valid for current device/IP
    const currentFingerprint = this.generateDeviceFingerprint(
      request.headers['user-agent'] || '',
      this.extractIP(request)
    );

    return session.deviceFingerprint === currentFingerprint;
  }

  /**
   * Clean up expired rate limit records
   */
  static cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, record] of this.rateLimitStore.entries()) {
      if (now > record.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Get security headers
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }
}

/**
 * Rate limiting middleware
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: any, res: any, next: any) => {
    const clientId = SecurityUtils.extractIP(req);
    const now = Date.now();
    
    let record = requests.get(clientId);
    
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      requests.set(clientId, record);
    } else {
      record.count++;
    }

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    next();
  };
}

/**
 * Input validation middleware
 */
export function validateInput(schema: Record<string, any>) {
  return (req: any, res: any, next: any) => {
    const errors: string[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined) {
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        }

        if (rules.type === 'number' && typeof value !== 'number') {
          errors.push(`${field} must be a number`);
        }

        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters`);
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
}

export default SecurityUtils;
