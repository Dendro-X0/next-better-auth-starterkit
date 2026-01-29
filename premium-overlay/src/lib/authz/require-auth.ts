import "server-only";

import { headers as nextHeaders } from "next/headers";

import type { User } from "better-auth";

import { env } from "~/env";
import { getSession } from "@/lib/authz/get-session";

type RequireAuthParams = Readonly<{
  headers?: Headers;
}>;

type RequireAuthResult = Readonly<{
  userId: string;
  user: User;
}>;

function isAuthGuardDisabledForRequest(): boolean {
  const isProduction: boolean = process.env.NODE_ENV === "production";
  if (isProduction) return false;
  return env.AUTH_GUARD_MODE === "off";
}

function getDevUser(): User {
  const devUser: User = {
    id: env.AUTH_DEV_USER_ID,
    email: env.AUTH_DEV_USER_EMAIL,
    name: env.AUTH_DEV_USER_NAME,
    emailVerified: true,
    image: null,
  } as User;
  return devUser;
}

async function requireAuth(params: RequireAuthParams = {}): Promise<RequireAuthResult> {
  const requestHeaders: Headers = params.headers ?? new Headers(await nextHeaders());
  const session = await getSession({ headers: requestHeaders });
  if (!session?.user) {
    if (isAuthGuardDisabledForRequest()) {
      const user: User = getDevUser();
      return { userId: user.id, user };
    }
    throw new Error("Not authenticated");
  }
  return { userId: session.user.id, user: session.user };
}

export { requireAuth };
