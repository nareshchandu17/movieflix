/**
 * @file auth-security.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { SecurityUtils } from './security-v2';

/**
 * Enhanced Authentication Security Module
 * Implements OAuth + Email/Password with comprehensive security measures
 */

export interface AuthSecurityConfig {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  sessionTimeout: number; // minutes
  jwtExpiry: string;
}

export const AUTH_SECURITY_CONFIG: AuthSecurityConfig = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  sessionTimeout: 30,
  jwtExpiry: '30d'
};

/**
 * Enhanced Password Security
 */
export class PasswordSecurity {
  
  /**
   * Hash password with bcrypt and salt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate secure random password
   */
  static generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + special;
    let password = '';
    
    // Ensure at least one of each required type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill remaining length with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= AUTH_SECURITY_CONFIG.passwordMinLength) {
      score += 20;
    } else {
      feedback.push(`Password must be at least ${AUTH_SECURITY_CONFIG.passwordMinLength} characters`);
    }

    // Uppercase check
    if (AUTH_SECURITY_CONFIG.passwordRequireUppercase && /[A-Z]/.test(password)) {
      score += 20;
    } else if (AUTH_SECURITY_CONFIG.passwordRequireUppercase) {
      feedback.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (AUTH_SECURITY_CONFIG.passwordRequireLowercase && /[a-z]/.test(password)) {
      score += 20;
    } else if (AUTH_SECURITY_CONFIG.passwordRequireLowercase) {
      feedback.push('Password must contain at least one lowercase letter');
    }

    // Numbers check
    if (AUTH_SECURITY_CONFIG.passwordRequireNumbers && /\d/.test(password)) {
      score += 20;
    } else if (AUTH_SECURITY_CONFIG.passwordRequireNumbers) {
      feedback.push('Password must contain at least one number');
    }

    // Special characters check
    if (AUTH_SECURITY_CONFIG.passwordRequireSpecialChars && /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      score += 20;
    } else if (AUTH_SECURITY_CONFIG.passwordRequireSpecialChars) {
      feedback.push('Password must contain at least one special character');
    }

    // Bonus points for length
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    return {
      isValid: feedback.length === 0,
      score: Math.min(score, 100),
      feedback
    };
  }
}

/**
 * Session Security Manager
 */
export class SessionSecurity {
  private static sessionStore = new Map<string, {
    userId: string;
    createdAt: number;
    lastActivity: number;
    deviceFingerprint: string;
    ipAddress: string;
  }>();

  /**
   * Create secure session
   */
  static createSession(userId: string, deviceFingerprint: string, ipAddress: string): string {
    const sessionId = SecurityUtils.generateSecureToken(32);
    const now = Date.now();

    this.sessionStore.set(sessionId, {
      userId,
      createdAt: now,
      lastActivity: now,
      deviceFingerprint,
      ipAddress
    });

    return sessionId;
  }

  /**
   * Validate session
   */
  static validateSession(sessionId: string, currentDeviceFingerprint: string, currentIpAddress: string): {
    isValid: boolean;
    userId?: string;
    reason?: string;
  } {
    const session = this.sessionStore.get(sessionId);
    
    if (!session) {
      return { isValid: false, reason: 'Session not found' };
    }

    const now = Date.now();
    const sessionAge = now - session.createdAt;
    const inactivityTime = now - session.lastActivity;

    // Check session timeout
    const maxAge = AUTH_SECURITY_CONFIG.sessionTimeout * 60 * 1000;
    if (sessionAge > maxAge) {
      this.sessionStore.delete(sessionId);
      return { isValid: false, reason: 'Session expired' };
    }

    // Check inactivity timeout
    const maxInactivity = 30 * 60 * 1000; // 30 minutes
    if (inactivityTime > maxInactivity) {
      this.sessionStore.delete(sessionId);
      return { isValid: false, reason: 'Session inactive too long' };
    }

    // Check device and IP consistency (optional - can be disabled for mobile users)
    if (session.deviceFingerprint !== currentDeviceFingerprint) {
      console.warn(`Device fingerprint mismatch for session ${sessionId}`);
      // Don't invalidate immediately, just log
    }

    if (session.ipAddress !== currentIpAddress) {
      console.warn(`IP address change for session ${sessionId}: ${session.ipAddress} -> ${currentIpAddress}`);
      // Don't invalidate immediately, just log
    }

    // Update last activity
    session.lastActivity = now;
    this.sessionStore.set(sessionId, session);

    return { isValid: true, userId: session.userId };
  }

  /**
   * Destroy session
   */
  static destroySession(sessionId: string): void {
    this.sessionStore.delete(sessionId);
  }

  /**
   * Destroy all user sessions
   */
  static destroyAllUserSessions(userId: string): void {
    for (const [sessionId, session] of this.sessionStore.entries()) {
      if (session.userId === userId) {
        this.sessionStore.delete(sessionId);
      }
    }
  }

  /**
   * Cleanup expired sessions
   */
  static cleanupExpiredSessions(): void {
    const now = Date.now();
    const maxAge = AUTH_SECURITY_CONFIG.sessionTimeout * 60 * 1000;

    for (const [sessionId, session] of this.sessionStore.entries()) {
      if (now - session.createdAt > maxAge) {
        this.sessionStore.delete(sessionId);
      }
    }
  }
}

/**
 * Login Attempt Security
 */
export class LoginSecurity {
  private static attemptStore = new Map<string, {
    attempts: number;
    firstAttempt: number;
    lastAttempt: number;
    lockedUntil?: number;
  }>();

  /**
   * Record login attempt
   */
  static recordAttempt(identifier: string, success: boolean): {
    canAttempt: boolean;
    remainingAttempts?: number;
    lockoutRemaining?: number;
  } {
    const now = Date.now();
    const key = `login:${identifier}`;
    const record = this.attemptStore.get(key) || {
      attempts: 0,
      firstAttempt: now,
      lastAttempt: now
    };

    if (success) {
      // Reset on successful login
      this.attemptStore.delete(key);
      return { canAttempt: true };
    }

    // Increment failed attempts
    record.attempts++;
    record.lastAttempt = now;

    // Check if should be locked out
    if (record.attempts >= AUTH_SECURITY_CONFIG.maxLoginAttempts) {
      record.lockedUntil = now + (AUTH_SECURITY_CONFIG.lockoutDuration * 60 * 1000);
      this.attemptStore.set(key, record);
      
      return {
        canAttempt: false,
        lockoutRemaining: AUTH_SECURITY_CONFIG.lockoutDuration * 60 * 1000
      };
    }

    this.attemptStore.set(key, record);
    const remainingAttempts = AUTH_SECURITY_CONFIG.maxLoginAttempts - record.attempts;

    return {
      canAttempt: true,
      remainingAttempts
    };
  }

  /**
   * Check if identifier is locked
   */
  static isLocked(identifier: string): {
    isLocked: boolean;
    remainingTime?: number;
  } {
    const key = `login:${identifier}`;
    const record = this.attemptStore.get(key);
    
    if (!record || !record.lockedUntil) {
      return { isLocked: false };
    }

    const now = Date.now();
    if (now >= record.lockedUntil) {
      this.attemptStore.delete(key);
      return { isLocked: false };
    }

    return {
      isLocked: true,
      remainingTime: record.lockedUntil - now
    };
  }

  /**
   * Cleanup old records
   */
  static cleanup(): void {
    const now = Date.now();
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours

    for (const [key, record] of this.attemptStore.entries()) {
      if (record.lastAttempt < cutoff) {
        this.attemptStore.delete(key);
      }
    }
  }
}

/**
 * JWT Token Security
 */
export class TokenSecurity {
  
  /**
   * Generate secure JWT payload
   */
  static generatePayload(userId: string, email: string, role: string = 'user'): any {
    return {
      sub: userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      jti: SecurityUtils.generateSecureToken(16), // JWT ID for revocation
      aud: 'movieflix',
      iss: 'movieflix-auth'
    };
  }

  /**
   * Validate JWT payload
   */
  static validatePayload(payload: any): {
    isValid: boolean;
    reason?: string;
  } {
    const now = Math.floor(Date.now() / 1000);

    // Check expiration
    if (payload.exp && payload.exp < now) {
      return { isValid: false, reason: 'Token expired' };
    }

    // Check issuer
    if (payload.iss !== 'movieflix-auth') {
      return { isValid: false, reason: 'Invalid issuer' };
    }

    // Check audience
    if (payload.aud !== 'movieflix') {
      return { isValid: false, reason: 'Invalid audience' };
    }

    // Check issued at (not from future)
    if (payload.iat && payload.iat > now + 60) { // 60 second clock skew allowance
      return { isValid: false, reason: 'Token issued in future' };
    }

    return { isValid: true };
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    const payload = {
      sub: userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      jti: SecurityUtils.generateSecureToken(16)
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}

/**
 * Data Leak Prevention
 */
export class DataLeakPrevention {
  
  /**
   * Sanitize user data for client response
   */
  static sanitizeUserData(user: any): any {
    const { 
      password, 
      twoFactorSecret, 
      twoFactorRecoveryCodes,
      _id,
      __v,
      ...sanitizedUser 
    } = user;

    return {
      ...sanitizedUser,
      id: _id?.toString()
    };
  }

  /**
   * Sanitize profile data for client response
   */
  static sanitizeProfileData(profile: any): any {
    const { 
      pin, 
      _id, 
      __v,
      ...sanitizedProfile 
    } = profile;

    return {
      ...sanitizedProfile,
      id: _id?.toString(),
      hasPin: !!pin // Don't expose actual PIN, just indicate existence
    };
  }

  /**
   * Check for sensitive data in logs
   */
  static detectSensitiveDataInString(str: string): {
    hasSensitiveData: boolean;
    type?: string;
  } {
    const patterns = [
      { regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, type: 'credit_card' },
      { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, type: 'email' },
      { regex: /\b\d{10,}\b/, type: 'phone_number' },
      { regex: /password["\s]*[:=]["\s]*[^"\s]+/i, type: 'password' },
      { regex: /secret["\s]*[:=]["\s]*[^"\s]+/i, type: 'secret' },
      { regex: /token["\s]*[:=]["\s]*[^"\s]+/i, type: 'token' }
    ];

    for (const { regex, type } of patterns) {
      if (regex.test(str)) {
        return { hasSensitiveData: true, type };
      }
    }

    return { hasSensitiveData: false };
  }

  /**
   * Safe console logging that filters sensitive data
   */
  static safeLog(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (data) {
      const dataStr = JSON.stringify(data);
      const detection = this.detectSensitiveDataInString(dataStr);
      
      if (detection.hasSensitiveData) {
        console[level](`${message} [FILTERED: Contains ${detection.type} data]`);
        return;
      }
    }

    console[level](message, data);
  }
}

// Cleanup intervals
if (typeof window === 'undefined') {
  // Server-side cleanup
  setInterval(() => {
    SessionSecurity.cleanupExpiredSessions();
    LoginSecurity.cleanup();
  }, 5 * 60 * 1000); // Every 5 minutes
}

export default {
  PasswordSecurity,
  SessionSecurity,
  LoginSecurity,
  TokenSecurity,
  DataLeakPrevention,
  AUTH_SECURITY_CONFIG
};
