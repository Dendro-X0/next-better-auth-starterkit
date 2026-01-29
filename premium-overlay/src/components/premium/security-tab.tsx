import type { ReactElement } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SecuritySession } from "@/lib/types/security-session";
import { listSecuritySessionsAction } from "@/actions/security/list-security-sessions";
import { revokeAllSessionsAction } from "@/actions/security/revoke-all-sessions";
import { revokeOtherSessionsAction } from "@/actions/security/revoke-other-sessions";
import { revokeSessionAction } from "@/actions/security/revoke-session";

type ListResult = Awaited<ReturnType<typeof listSecuritySessionsAction>>;

type FormatDateParams = Readonly<{ date: Date }>;

type FormatUserAgentParams = Readonly<{ userAgent: string | null }>;

type RenderSessionRowParams = Readonly<{ session: SecuritySession }>;

function formatDate(params: FormatDateParams): string {
  return params.date.toLocaleString();
}

function formatUserAgent(params: FormatUserAgentParams): string {
  return params.userAgent ?? "Unknown device";
}

function renderSessionRow(params: RenderSessionRowParams): ReactElement {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="font-medium break-all">{formatUserAgent({ userAgent: params.session.userAgent })}</div>
          {params.session.isCurrent ? <Badge variant="secondary">Current</Badge> : null}
        </div>
        <div className="text-sm text-muted-foreground break-all">IP: {params.session.ipAddress ?? "-"}</div>
        <div className="text-sm text-muted-foreground">Last used: {formatDate({ date: params.session.lastUsedAt })}</div>
        <div className="text-sm text-muted-foreground">Expires: {formatDate({ date: params.session.expiresAt })}</div>
      </div>
      {params.session.isCurrent ? null : (
        <form action={revokeSessionAction} className="shrink-0">
          <input type="hidden" name="sessionToken" value={params.session.token} />
          <Button type="submit" variant="outline">Revoke</Button>
        </form>
      )}
    </div>
  );
}

export async function SecurityTab(): Promise<ReactElement> {
  const result: ListResult = await listSecuritySessionsAction();
  if ("error" in result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>{result.error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const sessions: ReadonlyArray<SecuritySession> = result.sessions;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Manage your active sessions and sign out from other devices.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-muted-foreground">Active sessions: {sessions.length}</div>
          <div className="flex flex-wrap gap-2">
            <form action={revokeOtherSessionsAction}>
              <Button type="submit" variant="outline">Sign out other devices</Button>
            </form>
            <form action={revokeAllSessionsAction}>
              <Button type="submit" variant="destructive">Sign out everywhere</Button>
            </form>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground">No sessions found.</div>
          ) : (
            sessions.map((s: SecuritySession): ReactElement => {
              return <div key={s.id}>{renderSessionRow({ session: s })}</div>;
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
