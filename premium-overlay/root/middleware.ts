import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { premiumProtectedRoutes } from "@/lib/premium/premium-protected-routes";

// Note: We avoid importing server-only auth utilities here to keep middleware
// compatible with the Edge runtime and to prevent unused imports.

const protectedRoutes: ReadonlyArray<string> = ["/user", ...premiumProtectedRoutes];

const ONE_YEAR_SECONDS: number = 31_536_000;

function isAuthGuardDisabledForRequest(): boolean {
  const isProduction: boolean = process.env.NODE_ENV === "production";
  if (isProduction) return false;
  const authGuardMode: string = String(process.env.AUTH_GUARD_MODE ?? "strict").trim().toLowerCase();
  return authGuardMode === "off";
}

const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
} as const;

function applySecurityHeaders(params: Readonly<{ request: NextRequest; response: NextResponse }>): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    params.response.headers.set(key, value);
  }
  const isProduction: boolean = process.env.NODE_ENV === "production";
  const isHttps: boolean = params.request.nextUrl.protocol === "https:";
  if (isProduction && isHttps) {
    params.response.headers.set("Strict-Transport-Security", `max-age=${ONE_YEAR_SECONDS}; includeSubDomains; preload`);
  }
}

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const t0: number = Date.now();
  const { pathname } = request.nextUrl;
  const authGuardDisabled: boolean = isAuthGuardDisabledForRequest();
  // Use Better Auth helper to get the session cookie to avoid name/prefix drift
  const sessionCookie: string | null = getSessionCookie(request);
  const hasAuthCookies: boolean = Boolean(sessionCookie);
  const isProtectedRoute: boolean = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users away from protected routes
  if (!authGuardDisabled && !hasAuthCookies && isProtectedRoute) {
    const url = new URL("/auth/login", request.nextUrl.origin);
    const res = NextResponse.redirect(url);
    applySecurityHeaders({ request, response: res });
    res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
    return res;
  }

  const res = NextResponse.next();
  applySecurityHeaders({ request, response: res });
  res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
