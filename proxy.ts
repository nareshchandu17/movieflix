import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { clearProfileCookie } from "./lib/cookie-utils";

const PROFILE_SKIP = [
  "/profiles",
  "/api/profiles",
  "/api/auth",
  "/_next",
  "/favicon",
  "/login",
  "/logout",
];

const PROTECTED_PROFILE_PATHS = ["/watch", "/account", "/downloads", "/for-you", "/taste-dna"];

const suspiciousUserAgentPatterns = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /python-requests/i,
  /curl/i,
  /wget/i,
];

function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https: wss:; form-action 'self' https://accounts.google.com;",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}

function applySecurityHeaders(response: NextResponse) {
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function createEdgeRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (key: string) => {
    const now = Date.now();
    let record = requests.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      requests.set(key, record);
      return { limited: false, retryAfter: 0 };
    }

    record.count += 1;

    if (record.count > maxRequests) {
      return {
        limited: true,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      };
    }

    return { limited: false, retryAfter: 0 };
  };
}

const authRateLimiter = createEdgeRateLimiter(5, 15 * 60 * 1000);
const generalRateLimiter = createEdgeRateLimiter(100, 60 * 1000);

function isAllowedApiOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host;
    
    // 1. Dynamic Same-Origin Validation
    // Extract the host the request was made to (Vercel uses x-forwarded-host)
    const requestHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
    
    if (requestHost && originHost === requestHost) {
      return true; // Inherently trust same-origin requests
    }
  } catch (error) {
    console.warn("Invalid origin URL", { origin });
    return false; // Reject malformed origin headers
  }

  // 2. Explicit Allowed Origins (for cross-origin requests)
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((value) => value.trim()).filter(Boolean) || [
    "http://localhost:3000",
  ];

  return allowedOrigins.includes(origin);
}

export async function proxy(req: NextRequest) {
  const startTime = Date.now();
  const { pathname } = req.nextUrl;
  const clientIp = getClientIp(req);

  try {
    const isAuthSensitivePath =
      pathname.startsWith("/api/auth") ||
      pathname.includes("/login") ||
      pathname.includes("/password");

    const rateLimit = isAuthSensitivePath
      ? authRateLimiter(`${clientIp}:${pathname}`)
      : generalRateLimiter(clientIp);

    if (rateLimit.limited) {
      return applySecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: "Too many requests. Please try again later.",
            retryAfter: rateLimit.retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": rateLimit.retryAfter.toString(),
              "X-RateLimit-Remaining": "0",
            },
          }
        )
      );
    }

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuthPage = pathname.startsWith("/login");
    const isApiRoute = pathname.startsWith("/api");

    if (token && isAuthPage) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/", req.url)));
    }

    if (isApiRoute) {
      const isNextAuthRoute = pathname.startsWith("/api/auth");
      if (!isNextAuthRoute && !isAllowedApiOrigin(req)) {
        return applySecurityHeaders(
          NextResponse.json({ error: "Origin not allowed" }, { status: 403 })
        );
      }

      const userAgent = req.headers.get("user-agent") || "";
      if (suspiciousUserAgentPatterns.some((pattern) => pattern.test(userAgent))) {
        console.warn("Suspicious user agent detected", { userAgent, ip: clientIp, path: pathname });
      }
    }

    if (token) {
      const shouldSkipProfileGate = PROFILE_SKIP.some((prefix) => pathname.startsWith(prefix));

      if (!shouldSkipProfileGate) {
        const activeProfileId = req.cookies.get("mf_active_profile")?.value;

        if (!activeProfileId) {
          const redirectResponse = NextResponse.redirect(new URL("/profiles/select", req.url));
          return applySecurityHeaders(clearProfileCookie(redirectResponse));
        }

        const isProfileSecure = req.cookies.get("mf_profile_secure")?.value === "true";
        const isProfileVerified = req.cookies.get(`mf_verified_${activeProfileId}`)?.value === "true";

        if (
          isProfileSecure &&
          !isProfileVerified &&
          PROTECTED_PROFILE_PATHS.some((path) => pathname.startsWith(path))
        ) {
          return applySecurityHeaders(NextResponse.redirect(new URL("/profiles/select", req.url)));
        }
      }
    }

    const response = applySecurityHeaders(NextResponse.next());
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn("Slow proxy request detected", { path: pathname, duration, ip: clientIp });
    }

    return response;
  } catch (error) {
    console.error("Proxy error", {
      error: error instanceof Error ? error.message : "Unknown error",
      path: pathname,
      ip: clientIp,
    });

    return applySecurityHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}

export default proxy;

export const config = {
  matcher: ["/((?!_next|favicon.ico|health).*)"],
};
