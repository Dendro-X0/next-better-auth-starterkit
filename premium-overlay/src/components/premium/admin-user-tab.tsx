import Link from "next/link";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/authz/require-role";

async function AdminUserTab(): Promise<ReactElement> {
  try {
    await requireRole({ requiredRole: "admin" });
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
          <CardDescription>Manage users and roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin">Open Admin</Link>
          </Button>
        </CardContent>
      </Card>
    );
  } catch {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
          <CardDescription>You do not have access to admin features.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
}

export { AdminUserTab };
