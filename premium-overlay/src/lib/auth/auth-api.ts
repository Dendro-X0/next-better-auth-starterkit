import "server-only";

import { auth } from "@/lib/auth/auth";

type AuthApiFunction = (args: Readonly<Record<string, unknown>>) => Promise<unknown>;

export function getAuthApiFunction(name: string): AuthApiFunction {
  const api: Record<string, unknown> = auth.api as unknown as Record<string, unknown>;
  const fn: unknown = api[name];
  if (typeof fn !== "function") {
    throw new Error(`Auth API '${name}' is not available`);
  }
  return fn as AuthApiFunction;
}
