import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Note: We avoid importing server-only auth utilities here to keep middleware
// compatible with the Edge runtime and to prevent unused imports.

const protectedRoutes: ReadonlyArray<string> = ["/user"];

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const t0: number = Date.now();
  const { pathname } = request.nextUrl;
  // Use Better Auth helper to get the session cookie to avoid name/prefix drift
  const sessionCookie: string | null = getSessionCookie(request);
  const hasAuthCookies: boolean = Boolean(sessionCookie);
  const isProtectedRoute: boolean = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users away from protected routes
  if (!hasAuthCookies && isProtectedRoute) {
    const url = new URL("/auth/login", request.nextUrl.origin);
    const res = NextResponse.redirect(url);
    res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
