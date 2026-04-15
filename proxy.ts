import { NextResponse, NextRequest } from "next/server";
// Unified Proxy Handler (Next.js 16 Convention)
import { getToken } from "next-auth/jwt";
import { getProfile } from "./lib/profile-validation";
import { getActiveProfile } from "./lib/active-profile-manager";
import { clearProfileCookie, setProfileCookie } from "./lib/cookie-utils";

const PROFILE_SKIP = [
  '/profiles',
  '/api/profiles',
  '/api/auth',
  '/_next',
  '/favicon',
  '/login',
  '/logout',
];

export async function proxy(req: NextRequest) {
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
            return NextResponse.redirect(new URL("/profiles/select", req.url));
          }
        }

        // Valid profile and verification state, continue
        return NextResponse.next();
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
          return NextResponse.next();
        } else {
          // Invalid cookie, clear it
          const response = NextResponse.redirect(new URL('/profiles/select', req.url));
          return clearProfileCookie(response);
        }
      }

      // 3. No active profile anywhere -> redirect to profile selection
      return NextResponse.redirect(new URL('/profiles/select', req.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
