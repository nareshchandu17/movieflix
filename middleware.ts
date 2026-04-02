import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
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

  // Allow access - no mandatory redirection to /login

  // Redirect authenticated users away from login
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // No onboarding redirect - let onboarding be handled on home page
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
