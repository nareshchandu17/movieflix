import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getProfile } from "./lib/profile-validation";
import { getActiveProfile } from "./lib/active-profile-manager";
import { clearProfileCookie, setProfileCookie } from "./lib/cookie-utils";
import { SecurityUtils, createRateLimiter } from "./lib/security-v2";
import { LoginSecurity, DataLeakPrevention } from "./lib/auth-security";

const PROFILE_SKIP = [
  '/profiles',
  '/api/profiles',
  '/api/auth',
  '/_next',
  '/favicon',
  '/login',
  '/logout',
];

// Rate limiting for authentication endpoints
const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const generalRateLimiter = createRateLimiter(100, 60 * 1000); // 100 requests per minute

export async function proxy(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Apply rate limiting
    const clientIp = SecurityUtils.extractIP(req);
    
    // Skip rate limiting for static assets and health checks
    if (!req.nextUrl.pathname.startsWith('/_next') && 
        !req.nextUrl.pathname.startsWith('/favicon') &&
        req.nextUrl.pathname !== '/health') {
      
      // Use more strict rate limiting for auth endpoints
      const rateLimiter = req.nextUrl.pathname.startsWith('/api/auth') || 
                         req.nextUrl.pathname.includes('/login') ||
                         req.nextUrl.pathname.includes('/password') ? 
                         authRateLimiter : generalRateLimiter;
      
      let rateLimitExceeded = false;
      let retryAfter = 900;
      
      await new Promise<void>((resolve) => {
        rateLimiter(req, {
          status: (code: number) => { 
            if (code === 429) {
              rateLimitExceeded = true;
            }
          },
          json: (data: any) => { 
            if (data?.retryAfter) {
              retryAfter = data.retryAfter;
            }
          },
          headers: () => {},
        } as any, resolve);
      });

      if (rateLimitExceeded) {
        DataLeakPrevention.safeLog('warn', `Rate limit exceeded for IP: ${clientIp}`);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Too many requests. Please try again later.',
            retryAfter 
          },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(Date.now() + 900000).toISOString()
            }
          }
        );
      }
    }

    // Add security headers
    const securityHeaders = SecurityUtils.getSecurityHeaders();
    const baseResponse = NextResponse.next();
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      baseResponse.headers.set(key, value);
    });

    // Get authentication token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;

    // Define public routes
    const isAuthPage = pathname.startsWith("/login");
    const isApiRoute = pathname.startsWith("/api");
    const isLogoutRoute = pathname.startsWith("/logout");
    const isPublicRoute = isAuthPage || isApiRoute || isLogoutRoute;

    // Redirect authenticated users away from login
    if (token && isAuthPage) {
      DataLeakPrevention.safeLog('info', `Authenticated user redirected from login`, { userId: token.id });
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Enhanced security checks for API routes
    if (isApiRoute) {
      // Validate request origin for API routes
      const origin = req.headers.get('origin');
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'https://movieflix.com'
      ];

      if (origin && !allowedOrigins.includes(origin)) {
        DataLeakPrevention.safeLog('warn', `CORS violation detected`, { 
          origin, 
          ip: clientIp,
          path: pathname 
        });
        return NextResponse.json(
          { error: 'Origin not allowed' },
          { status: 403 }
        );
      }

      // Check for suspicious patterns in API requests
      const userAgent = req.headers.get('user-agent') || '';
      const suspiciousPatterns = [
        /sqlmap/i,
        /nikto/i,
        /nmap/i,
        /masscan/i,
        /python-requests/i,
        /curl/i,
        /wget/i
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
        DataLeakPrevention.safeLog('warn', `Suspicious user agent detected`, {
          userAgent,
          ip: clientIp,
          path: pathname
        });
        
        // Don't block immediately, but monitor closely
        // Could implement CAPTCHA here
      }
    }

    // Netflix-level Profile gate: Backend source of truth, Cookie as cache
    // If user is authenticated, check for active profile
    if (token) {
      const shouldSkip = PROFILE_SKIP.some((prefix) => pathname.startsWith(prefix));

      if (!shouldSkip) {
        // 1. Check backend first (source of truth)
        const backendProfile = await getActiveProfile(token.id as string);
        
        if (backendProfile) {
          // Backend has active profile, sync cookie if needed
          const cookieProfile = req.cookies.get('mf_active_profile');
          if (!cookieProfile?.value || cookieProfile.value !== backendProfile.profileId) {
            const response = NextResponse.next();
            Object.entries(securityHeaders).forEach(([key, value]) => {
              response.headers.set(key, value);
            });
            return setProfileCookie(backendProfile.profileId, response);
          }

          // ── PIN Enforcement ──
          const activeProfileId = backendProfile.profileId;
          const isProfileSecure = req.cookies.get("mf_profile_secure")?.value === "true";
          const isProfileVerified = req.cookies.get(`mf_verified_${activeProfileId}`)?.value === "true";

          // If profile is secure but not verified, restrict access to sensitive features
          if (isProfileSecure && !isProfileVerified) {
            const protectedPaths = ["/watch", "/account", "/downloads", "/for-you", "/taste-dna"];
            if (protectedPaths.some(path => pathname.startsWith(path))) {
              DataLeakPrevention.safeLog('info', `Unverified profile access blocked`, {
                userId: token.id,
                profileId: activeProfileId,
                path: pathname
              });
              return NextResponse.redirect(new URL("/profiles/select", req.url));
            }
          }

          // Valid profile and verification state, continue
          return baseResponse;
        }

        // 2. Fallback to cookie if backend is empty (migration scenario)
        const activeProfileCookie = req.cookies.get('mf_active_profile');

        if (activeProfileCookie?.value) {
          // Validate cookie profile and migrate to backend
          const profile = await getProfile(activeProfileCookie.value, token.id as string);
          
          if (profile) {
            // Valid cookie profile, migrate to backend
            const { setActiveProfile } = await import("./lib/active-profile-manager");
            await setActiveProfile(token.id as string, activeProfileCookie.value);
            return baseResponse;
          } else {
            // Invalid cookie, clear it
            const redirectResponse = NextResponse.redirect(new URL('/profiles/select', req.url));
            Object.entries(securityHeaders).forEach(([key, value]) => {
              redirectResponse.headers.set(key, value);
            });
            return clearProfileCookie(redirectResponse);
          }
        }

        // 3. No active profile anywhere -> redirect to profile selection
        DataLeakPrevention.safeLog('info', `No active profile found`, { userId: token.id });
        const redirectResponse = NextResponse.redirect(new URL('/profiles/select', req.url));
        Object.entries(securityHeaders).forEach(([key, value]) => {
          redirectResponse.headers.set(key, value);
        });
        return redirectResponse;
      }
    }

    // Log request duration for monitoring
    const duration = Date.now() - startTime;
    if (duration > 1000) { // Log slow requests
      DataLeakPrevention.safeLog('warn', `Slow request detected`, {
        path: pathname,
        duration,
        ip: clientIp
      });
    }

    return baseResponse;
  } catch (error) {
    DataLeakPrevention.safeLog('error', 'Middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.nextUrl.pathname,
      ip: SecurityUtils.extractIP(req)
    });
    
    // Return error response without exposing internal details
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export default proxy;

export const config = {
  matcher: ["/((?!_next|favicon.ico|health).*)"],
};
