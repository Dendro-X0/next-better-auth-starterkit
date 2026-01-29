"use server";

import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { requireRole } from "@/lib/authz/require-role";
import type { UserRole } from "@/lib/authz/user-role";
import rbacUtils from "@/lib/premium/rbac-utils";
import { db } from "@/lib/db";
import { role, user, userRole } from "@/lib/db/schema";
import { getAuditRequestContext } from "@/lib/audit/get-audit-request-context";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";

type SetUserRoleInput = Readonly<{
  userId: string;
  role: UserRole;
}>;

type CountRow = Readonly<{
  count: number;
}>;

type ExistsRow = Readonly<{
  id: string;
}>;

function parseInput(formData: FormData): SetUserRoleInput {
  const rawUserId: FormDataEntryValue | null = formData.get("userId");
  const rawRole: FormDataEntryValue | null = formData.get("role");
  const userId: string = typeof rawUserId === "string" ? rawUserId : "";
  const roleValue: string = typeof rawRole === "string" ? rawRole : "";
  if (!userId) throw new Error("Missing userId");
  if (!rbacUtils.isUserRole(roleValue)) throw new Error("Invalid role");
  const role: UserRole = roleValue;
  return { userId, role };
}

async function assertUserExists(params: Readonly<{ userId: string }>): Promise<void> {
  const rows: ReadonlyArray<ExistsRow> = await db.select({ id: user.id }).from(user).where(eq(user.id, params.userId)).limit(1);
  if (rows.length === 0) throw new Error("User not found");
}

async function assertRoleExists(params: Readonly<{ roleId: UserRole }>): Promise<void> {
  const rows: ReadonlyArray<ExistsRow> = await db.select({ id: role.id }).from(role).where(eq(role.id, params.roleId)).limit(1);
  if (rows.length === 0) throw new Error("Role not found");
}

async function isUserAdmin(params: Readonly<{ userId: string }>): Promise<boolean> {
  const rows: ReadonlyArray<ExistsRow> = await db
    .select({ id: userRole.userId })
    .from(userRole)
    .where(and(eq(userRole.userId, params.userId), eq(userRole.roleId, "admin")))
    .limit(1);
  return rows.length > 0;
}

async function countAdmins(): Promise<number> {
  const rows: ReadonlyArray<CountRow> = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userRole)
    .where(eq(userRole.roleId, "admin"));
  const count: number = rows[0]?.count ?? 0;
  return count;
}

async function replaceUserRole(params: Readonly<{ userId: string; roleId: UserRole }>): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(userRole).where(eq(userRole.userId, params.userId));
    await tx.insert(userRole).values({ userId: params.userId, roleId: params.roleId, createdAt: new Date() });
  });
}

export async function setUserRoleAction(formData: FormData): Promise<void> {
  const requestHeaders: Headers = new Headers(await headers());
  const actor = await requireRole({ requiredRole: "admin", headers: requestHeaders });
  try {
    const input: SetUserRoleInput = parseInput(formData);
    await assertUserExists({ userId: input.userId });
    await assertRoleExists({ roleId: input.role });
    const targetIsAdmin: boolean = await isUserAdmin({ userId: input.userId });
    const adminCount: number = await countAdmins();
    const shouldBlock: boolean = rbacUtils.shouldBlockLastAdminDemotion({
      targetHasAdminRole: targetIsAdmin,
      nextRole: input.role,
      adminCount,
    });
    if (shouldBlock) redirect("/admin?error=Cannot%20demote%20the%20last%20admin");
    await replaceUserRole({ userId: input.userId, roleId: input.role });
    const auditContext = getAuditRequestContext({ headers: requestHeaders });
    void writeAuditEvent({
      event: "role_changed",
      actorUserId: actor.userId,
      targetUserId: input.userId,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      metadata: { role: input.role },
    });
    redirect("/admin?message=Role%20updated");
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : "Failed to update role";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
}
