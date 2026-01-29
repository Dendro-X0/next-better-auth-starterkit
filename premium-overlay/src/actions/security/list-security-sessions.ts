"use server";

import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";

import { auth } from "@/lib/auth/auth";
import { hasEntitlement } from "@/lib/authz/has-entitlement";
import type { SecuritySession } from "@/lib/types/security-session";

type ListSecuritySessionsResult = Readonly<{ sessions: ReadonlyArray<SecuritySession> }> | Readonly<{ error: string }>;

const requestUrl: string = "http://localhost";

const unixEpochMs: number = 0;

type AuthApiFunction = (args: unknown) => Promise<unknown>;

type UnknownRecord = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getAuthApiFunction(name: string): AuthApiFunction {
  const api = auth.api as unknown as Record<string, unknown>;
  const fn: unknown = api[name];
  if (typeof fn !== "function") {
    throw new Error(`Auth API '${name}' is not available`);
  }
  return fn as AuthApiFunction;
}

function toDate(value: unknown): Date {
  const fallback: Date = new Date(unixEpochMs);
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed: Date = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

function getString(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  return null;
}

function extractSessions(value: unknown): ReadonlyArray<unknown> {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  const sessions: unknown = value.sessions;
  if (Array.isArray(sessions)) return sessions;
  const data: unknown = value.data;
  if (Array.isArray(data)) return data;
  const response: unknown = value.response;
  if (Array.isArray(response)) return response;
  if (isRecord(response)) {
    const nestedSessions: unknown = response.sessions;
    if (Array.isArray(nestedSessions)) return nestedSessions;
  }
  return [];
}

function toSecuritySession(params: Readonly<{ item: unknown; currentToken: string | null }>): SecuritySession | null {
  if (!isRecord(params.item)) return null;
  const token: string | null = getString(params.item.sessionToken) ?? getString(params.item.token);
  if (!token) return null;
  const id: string = getString(params.item.sessionId) ?? getString(params.item.id) ?? token;
  const createdAt: Date = toDate(params.item.createdAt);
  const rawLastUsedAt: Date = toDate(params.item.updatedAt ?? params.item.lastActive);
  const lastUsedAt: Date = rawLastUsedAt.getTime() === unixEpochMs ? createdAt : rawLastUsedAt;
  const rawExpiresAt: Date = toDate(params.item.expiresAt);
  const expiresAt: Date = rawExpiresAt.getTime() === unixEpochMs ? createdAt : rawExpiresAt;
  const ipAddress: string | null = getString(params.item.ipAddress);
  const userAgent: string | null = getString(params.item.userAgent);
  const isCurrent: boolean = Boolean(params.currentToken) && token === params.currentToken;
  return { id, token, createdAt, lastUsedAt, expiresAt, ipAddress, userAgent, isCurrent };
}

async function listSessionsViaAuth(params: Readonly<{ headers: Headers; currentToken: string | null }>): Promise<ReadonlyArray<SecuritySession>> {
  const listApiNames: ReadonlyArray<string> = ["listSessions", "listDeviceSessions"];
  const results: Array<SecuritySession> = [];
  for (const name of listApiNames) {
    try {
      const listFn: AuthApiFunction = getAuthApiFunction(name);
      const raw: unknown = await listFn({ headers: params.headers });
      const items: ReadonlyArray<unknown> = extractSessions(raw);
      for (const item of items) {
        const session: SecuritySession | null = toSecuritySession({ item, currentToken: params.currentToken });
        if (session) results.push(session);
      }
      if (results.length > 0) return results;
    } catch {
      continue;
    }
  }
  return results;
}

function toRequestCookie(params: Readonly<{ headers: Headers }>): string | null {
  const request: Request = new Request(requestUrl, { headers: params.headers });
  const token: string | null = getSessionCookie(request);
  return token;
}

async function ensureProAccess(params: Readonly<{ headers: Headers }>): Promise<void> {
  const allowed: boolean = await hasEntitlement({ entitlement: "security_tab", headers: params.headers });
  if (!allowed) throw new Error("Forbidden");
}

export async function listSecuritySessionsAction(): Promise<ListSecuritySessionsResult> {
  const requestHeaders: Headers = new Headers(await headers());
  const authSession = await auth.api.getSession({ headers: requestHeaders });
  if (!authSession?.user) return { error: "Not authenticated" };
  try {
    await ensureProAccess({ headers: requestHeaders });
    const currentToken: string | null = toRequestCookie({ headers: requestHeaders });
    const sessions: ReadonlyArray<SecuritySession> = await listSessionsViaAuth({ headers: requestHeaders, currentToken });
    return { sessions };
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : "Failed to load sessions";
    return { error: message };
  }
}
