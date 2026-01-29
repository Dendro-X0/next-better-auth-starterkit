"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { hasEntitlement } from "@/lib/authz/has-entitlement";

async function ensureProAccess(params: Readonly<{ headers: Headers }>): Promise<void> {
  const allowed: boolean = await hasEntitlement({ entitlement: "security_tab", headers: params.headers });
  if (!allowed) throw new Error("Forbidden");
}

type AuthApiFunction = (args: unknown) => Promise<unknown>;

function getAuthApiFunction(name: string): AuthApiFunction {
  const api = auth.api as unknown as Record<string, unknown>;
  const fn: unknown = api[name];
  if (typeof fn !== "function") {
    throw new Error(`Auth API '${name}' is not available`);
  }
  return fn as AuthApiFunction;
}

async function revokeAllViaSignOut(params: Readonly<{ headers: Headers }>): Promise<boolean> {
  try {
    await auth.api.signOut({ headers: params.headers, revokeAllSessions: true } as unknown as Record<string, unknown>);
    return true;
  } catch {
    try {
      await auth.api.signOut({ headers: params.headers, body: { revokeAllSessions: true } } as unknown as Record<string, unknown>);
      return true;
    } catch {
      return false;
    }
  }
}

async function revokeSessionsViaAuth(params: Readonly<{ headers: Headers }>): Promise<void> {
  const revokeSessions: AuthApiFunction = getAuthApiFunction("revokeSessions");
  try {
    await revokeSessions({ headers: params.headers });
  } catch {
    await revokeSessions({ headers: params.headers, body: {} });
  }
}

export async function revokeAllSessionsAction(): Promise<void> {
  const requestHeaders: Headers = new Headers(await headers());
  const authSession = await auth.api.getSession({ headers: requestHeaders });
  if (!authSession?.user) redirect("/auth/login");
  try {
    await ensureProAccess({ headers: requestHeaders });
    const revokedViaSignOut: boolean = await revokeAllViaSignOut({ headers: requestHeaders });
    if (!revokedViaSignOut) {
      await revokeSessionsViaAuth({ headers: requestHeaders });
      await auth.api.signOut({ headers: requestHeaders });
    }
    redirect("/auth/login?message=Signed%20out%20everywhere");
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : "Failed to revoke sessions";
    redirect(`/user?error=${encodeURIComponent(message)}`);
  }
}
