import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes: ReadonlyArray<string> = ["/user"];

const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const t0: number = Date.now();
  const { pathname } = request.nextUrl;
  const sessionCookie: string | null = getSessionCookie(request);
  const hasAuthCookies: boolean = Boolean(sessionCookie);
  const isProtectedRoute: boolean = protectedRoutes.some((route: string): boolean =>
    pathname.startsWith(route)
  );
  if (!hasAuthCookies && isProtectedRoute) {
    const url: URL = new URL("/auth/login", request.nextUrl.origin);
    const res: NextResponse = NextResponse.redirect(url);
    res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
    return res;
  }
  const res: NextResponse = NextResponse.next();
  res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
  return res;
};

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
