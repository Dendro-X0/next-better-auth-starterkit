import { headers } from "next/headers";
import Link from "next/link";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";

type SearchParams = Readonly<{
  revokeOtherSessions?: string;
}>;

type AuthApiFunction = (args: unknown) => Promise<unknown>;

type PageProps = Readonly<{
  searchParams: Promise<SearchParams>;
}>;

function getAuthApiFunction(name: string): AuthApiFunction | null {
  const api = auth.api as unknown as Record<string, unknown>;
  const fn: unknown = api[name];
  if (typeof fn !== "function") return null;
  return fn as AuthApiFunction;
}

async function revokeOtherSessionsViaAuth(params: Readonly<{ headers: Headers }>): Promise<void> {
  const revokeOtherSessions: AuthApiFunction | null = getAuthApiFunction("revokeOtherSessions");
  if (!revokeOtherSessions) return;
  try {
    await revokeOtherSessions({ headers: params.headers });
  } catch {
    await revokeOtherSessions({ headers: params.headers, body: {} });
  }
}

async function maybeRevokeOtherSessions(params: Readonly<{ headers: Headers; revokeOtherSessions: boolean }>): Promise<boolean> {
  if (!params.revokeOtherSessions) return false;
  try {
    const session = await auth.api.getSession({ headers: params.headers });
    if (!session?.user) return false;
    await revokeOtherSessionsViaAuth({ headers: params.headers });
    return true;
  } catch {
    return false;
  }
}

export default async function ChangeEmailCallbackPage(props: PageProps): Promise<React.JSX.Element> {
  const requestHeaders: Headers = new Headers(await headers());
  const searchParams: SearchParams = await props.searchParams;
  const revokeOtherSessions: boolean = searchParams.revokeOtherSessions === "true";
  const revoked: boolean = await maybeRevokeOtherSessions({ headers: requestHeaders, revokeOtherSessions });
  return (
    <div className="container mx-auto max-w-lg p-6">
      <Card>
        <CardHeader>
          <CardTitle>Email updated</CardTitle>
          <CardDescription>Your new email has been verified successfully.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>{revoked ? "Signed out from other devices." : ""}</div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/user">Go to account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
