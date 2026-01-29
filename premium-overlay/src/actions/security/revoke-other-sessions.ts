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

async function revokeOtherSessionsViaAuth(params: Readonly<{ headers: Headers }>): Promise<void> {
  const revokeOtherSessions: AuthApiFunction = getAuthApiFunction("revokeOtherSessions");
  try {
    await revokeOtherSessions({ headers: params.headers });
  } catch {
    await revokeOtherSessions({ headers: params.headers, body: {} });
  }
}

export async function revokeOtherSessionsAction(): Promise<void> {
  const requestHeaders: Headers = new Headers(await headers());
  const authSession = await auth.api.getSession({ headers: requestHeaders });
  if (!authSession?.user) redirect("/auth/login");
  try {
    await ensureProAccess({ headers: requestHeaders });
    await revokeOtherSessionsViaAuth({ headers: requestHeaders });
    redirect("/user?message=Signed%20out%20from%20other%20devices");
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : "Failed to revoke other sessions";
    redirect(`/user?error=${encodeURIComponent(message)}`);
  }
}
