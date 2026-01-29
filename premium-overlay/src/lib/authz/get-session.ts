import "server-only";

import { headers as nextHeaders } from "next/headers";

import { auth } from "@/lib/auth/auth";

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

type GetSessionParams = Readonly<{ headers?: Headers }>;

type GetSession = (params?: GetSessionParams) => Promise<AuthSession>;

async function getSession(params: GetSessionParams = {}): Promise<AuthSession> {
  const requestHeaders: Headers = params.headers ?? new Headers(await nextHeaders());
  return auth.api.getSession({ headers: requestHeaders });
}

export { getSession };
