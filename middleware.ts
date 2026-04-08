import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROFILE_SKIP = [
  '/profiles',
  '/api/profiles',
  '/api/auth',
  '/_next',
  '/favicon',
  '/login',
  '/logout',
];

export async function middleware(req: Request & { nextUrl: URL; cookies: { get: (name: string) => { value: string } | undefined } }) {
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
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ── Profile gate ──────────────────────────────────
  // If user is authenticated, check for active profile cookie
  if (token) {
    const shouldSkip = PROFILE_SKIP.some((prefix) => pathname.startsWith(prefix));

    if (!shouldSkip) {
      const activeProfile = req.cookies.get('mf_active_profile');

      if (!activeProfile?.value) {
        // No active profile → redirect to profile selection
        return NextResponse.redirect(new URL('/profiles/select', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
