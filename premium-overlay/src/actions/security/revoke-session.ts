"use server";

import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { hasEntitlement } from "@/lib/authz/has-entitlement";

type RevokeSessionInput = Readonly<{ sessionToken: string }>;

const requestUrl: string = "http://localhost";

function parseInput(formData: FormData): RevokeSessionInput {
  const raw: FormDataEntryValue | null = formData.get("sessionToken");
  const sessionToken: string = typeof raw === "string" ? raw : "";
  if (!sessionToken) throw new Error("Missing sessionToken");
  return { sessionToken };
}

function getCurrentToken(params: Readonly<{ headers: Headers }>): string | null {
  const request: Request = new Request(requestUrl, { headers: params.headers });
  const token: string | null = getSessionCookie(request);
  return token;
}

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

async function revokeSessionViaAuth(params: Readonly<{ headers: Headers; sessionToken: string }>): Promise<void> {
  const revokeSession: AuthApiFunction = getAuthApiFunction("revokeSession");
  try {
    await revokeSession({ headers: params.headers, body: { token: params.sessionToken } });
    return;
  } catch {
    await revokeSession({ headers: params.headers, body: { sessionToken: params.sessionToken } });
  }
}

export async function revokeSessionAction(formData: FormData): Promise<void> {
  const requestHeaders: Headers = new Headers(await headers());
  const authSession = await auth.api.getSession({ headers: requestHeaders });
  if (!authSession?.user) redirect("/auth/login");
  try {
    await ensureProAccess({ headers: requestHeaders });
    const input: RevokeSessionInput = parseInput(formData);
    const currentToken: string | null = getCurrentToken({ headers: requestHeaders });
    if (!currentToken) throw new Error("Missing current session");
    if (input.sessionToken === currentToken) {
      throw new Error("Cannot revoke current session from this action");
    }
    await revokeSessionViaAuth({ headers: requestHeaders, sessionToken: input.sessionToken });
    redirect("/user?message=Session%20revoked");
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : "Failed to revoke session";
    redirect(`/user?error=${encodeURIComponent(message)}`);
  }
}
