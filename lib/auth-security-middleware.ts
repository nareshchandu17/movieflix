/**
 * @file auth-security-middleware.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DataLeakPrevention, SessionSecurity } from "@/lib/auth-security";
import { SecurityUtils } from "@/lib/security-v2";

/**
 * Authentication Security Middleware for API Routes
 * Provides session validation, user authentication, and data sanitization
 */

export interface AuthenticatedRequest extends NextRequest {
  user?: any;
  session?: any;
}

/**
 * Higher-order function to wrap API routes with authentication
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>,
  options: {
    required?: boolean;
    roles?: string[];
    requireProfile?: boolean;
  } = {}
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Get session
      const session = await getServerSession(authOptions);
      
      // Check if authentication is required
      if (options.required && !session) {
        return NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        );
      }

      // Check role requirements
      if (options.roles && session?.user) {
        const userRole = (session.user as any).role || 'user';
        const hasRequiredRole = options.roles.includes(userRole);
        
        if (!hasRequiredRole) {
          return NextResponse.json(
            { success: false, error: "Insufficient permissions" },
            { status: 403 }
          );
        }
      }

      // Check profile requirement
      if (options.requireProfile && session) {
        const activeProfileId = req.cookies.get('mf_active_profile')?.value;
        
        if (!activeProfileId) {
          return NextResponse.json(
            { success: false, error: "Active profile required" },
            { status: 401 }
          );
        }

        // Validate session integrity
        const userAgent = req.headers.get('user-agent') || '';
        const ipAddress = req.headers.get('x-forwarded-for') || 
                           req.headers.get('x-real-ip') || 
                           'unknown';
        
        const deviceFingerprint = SecurityUtils.generateDeviceFingerprint(userAgent, ipAddress);
        const sessionValidation = SessionSecurity.validateSession(
          session.user.id,
          deviceFingerprint,
          ipAddress
        );

        if (!sessionValidation.isValid) {
          DataLeakPrevention.safeLog('warn', `Session validation failed`, {
            userId: session.user.id,
            reason: sessionValidation.reason,
            ip: ipAddress
          });
          
          return NextResponse.json(
            { success: false, error: "Session invalid" },
            { status: 401 }
          );
        }
      }

      // Create authenticated request object
      const authReq = req as AuthenticatedRequest;
      authReq.user = session?.user;
      authReq.session = session;

      // Call the original handler
      return await handler(authReq, ...args);

    } catch (error) {
      DataLeakPrevention.safeLog('error', 'Auth middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        path: req.nextUrl.pathname
      });

      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication error" 
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to sanitize and validate request data
 */
export function withValidation(
  schema: Record<string, any>,
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Parse request body
      let body;
      try {
        body = await req.json();
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }

      // Validate against schema
      const errors: string[] = [];
      
      for (const [field, rules] of Object.entries(schema)) {
        const value = body[field];

        // Required field validation
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field} is required`);
          continue;
        }

        // Skip validation if field is not provided
        if (value === undefined) {
          continue;
        }

        // Type validation
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }

        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters`);
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }

        // Custom validation
        if (rules.validate && typeof rules.validate === 'function') {
          const customResult = rules.validate(value);
          if (customResult !== true) {
            errors.push(customResult);
          }
        }
      }

      if (errors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: errors
          },
          { status: 400 }
        );
      }

      // Sanitize input data
      const sanitizedBody = DataLeakPrevention.sanitizeUserData(body);

      // Create a new request with sanitized data
      const sanitizedReq = {
        ...req,
        body: sanitizedBody,
        json: async () => sanitizedBody
      } as NextRequest;

      // Call the original handler
      return await handler(sanitizedReq, ...args);

    } catch (error) {
      DataLeakPrevention.safeLog('error', 'Validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      return NextResponse.json(
        { 
          success: false, 
          error: "Validation error" 
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  maxRequests: number,
  windowMs: number,
  identifier?: string
) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) => {
    return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
      try {
        // Extract identifier for rate limiting
        const clientId = identifier || 
                      req.headers.get('x-forwarded-for')?.split(',')[0] ||
                      req.headers.get('x-real-ip') ||
                      'unknown';

        const now = Date.now();
        let record = requests.get(clientId);

        if (!record || now > record.resetTime) {
          record = { count: 1, resetTime: now + windowMs };
          requests.set(clientId, record);
        } else {
          record.count++;
        }

        // Check rate limit
        if (record.count > maxRequests) {
          DataLeakPrevention.safeLog('warn', `Rate limit exceeded`, {
            clientId,
            path: req.nextUrl.pathname,
            count: record.count,
            maxRequests
          });

          return NextResponse.json(
            {
              success: false,
              error: "Rate limit exceeded",
              retryAfter: Math.ceil((record.resetTime - now) / 1000)
            },
            {
              status: 429,
              headers: {
                'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
                'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
              }
            }
          );
        }

        // Add rate limit headers to successful response
        const response = await handler(req, ...args);
        
        if (response.headers.get('X-RateLimit-Limit') === null) {
          response.headers.set('X-RateLimit-Limit', maxRequests.toString());
          response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString());
          response.headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
        }

        return response;

      } catch (error) {
        DataLeakPrevention.safeLog('error', 'Rate limit middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json(
          { 
            success: false, 
            error: "Rate limiting error" 
          },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * CORS middleware
 */
export function withCors(
  allowedOrigins: string[] = ['http://localhost:3000']
) {
  return (handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) => {
    return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
      try {
        const origin = req.headers.get('origin');
        const response = await handler(req, ...args);

        // Set CORS headers
        if (allowedOrigins.includes(origin || '') || allowedOrigins.includes('*')) {
          response.headers.set('Access-Control-Allow-Origin', origin || '*');
        }

        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        return response;

      } catch (error) {
        DataLeakPrevention.safeLog('error', 'CORS middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json(
          { 
            success: false, 
            error: "CORS error" 
          },
          { status: 500 }
        );
      }
    };
  };
}

export default {
  withAuth,
  withValidation,
  withRateLimit,
  withCors
};
