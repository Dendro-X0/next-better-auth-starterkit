import Link from "next/link";
import type { ReactElement } from "react";

import { listAdminUsersAction } from "@/actions/admin/list-admin-users";
import { setUserRoleAction } from "@/actions/admin/set-user-role";
import { requireRole } from "@/lib/authz/require-role";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AdminUserRow = Awaited<ReturnType<typeof listAdminUsersAction>>[number];

function formatUserLabel(params: Readonly<{ name: string; email: string }>): string {
  return params.name.trim().length > 0 ? params.name : params.email;
}

function getPrimaryRole(params: Readonly<{ roles: ReadonlyArray<"user" | "moderator" | "admin"> }>): "user" | "moderator" | "admin" {
  if (params.roles.includes("admin")) return "admin";
  if (params.roles.includes("moderator")) return "moderator";
  return "user";
}

function renderUserRow(params: Readonly<{ user: AdminUserRow }>): ReactElement {
  const primaryRole: AdminUserRow["roles"][number] = getPrimaryRole({ roles: params.user.roles });
  return (
    <tr key={params.user.id} className="border-b last:border-b-0">
      <td className="py-2 pr-4 align-top">{formatUserLabel({ name: params.user.name, email: params.user.email })}</td>
      <td className="py-2 pr-4 align-top font-mono">{params.user.email}</td>
      <td className="py-2 pr-4 align-top">
        <div className="flex flex-wrap gap-2">
          {params.user.roles.map((r: AdminUserRow["roles"][number]) => (
            <Badge key={`${params.user.id}-${r}`} variant={r === "admin" ? "destructive" : "secondary"}>
              {r}
            </Badge>
          ))}
        </div>
      </td>
      <td className="py-2 pr-4 align-top">
        <form action={setUserRoleAction} className="flex items-center gap-2">
          <input type="hidden" name="userId" value={params.user.id} />
          <select name="role" defaultValue={primaryRole} className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="user">user</option>
            <option value="moderator">moderator</option>
            <option value="admin">admin</option>
          </select>
          <Button type="submit" size="sm" variant="outline">
            Save
          </Button>
        </form>
      </td>
    </tr>
  );
}

export default async function AdminPage(): Promise<ReactElement> {
  try {
    await requireRole({ requiredRole: "admin" });
  } catch {
    return (
      <div className="container mx-auto max-w-3xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>You do not have access to this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/user">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const users: ReadonlyArray<AdminUserRow> = await listAdminUsersAction();
  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
          <CardDescription>Manage users and roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">Total users: {users.length}</div>
            <Button asChild variant="outline">
              <Link href="/user">Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Roles are resolved from premium RBAC tables.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Roles</th>
                  <th className="py-2 pr-4 font-medium">Change role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: AdminUserRow) => renderUserRow({ user: u }))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
