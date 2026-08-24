import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { csrfProtection, shouldProtectFromCSRF } from './lib/csrf';

// Define paths that should bypass CSRF protection
const CSRF_EXEMPT_PATHS = [
  '/api/payment/webhook', // External webhooks (Stripe/Razorpay) validate their own signatures
  '/api/auth',            // Next-auth handles its own CSRF internally
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Enforce CSRF protection on API routes
  if (pathname.startsWith('/api/') && shouldProtectFromCSRF(request.method)) {
    
    // Check if path is exempt
    const isExempt = CSRF_EXEMPT_PATHS.some(path => pathname.startsWith(path));
    
    if (!isExempt) {
      // Create a standard Web Request object for the csrf util if needed, 
      // but NextRequest implements Request so we can pass it directly
      const csrfResult = csrfProtection(request as unknown as Request);
      
      if (!csrfResult.valid) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: 'CSRF token validation failed. Request blocked for security reasons.' 
          }),
          { 
            status: 403, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }
  }

  // Next.js handles session cookies (HttpOnly, Secure) automatically via next-auth
  // We can add generic security headers to all responses here
  const response = NextResponse.next();
  
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
  ],
};
