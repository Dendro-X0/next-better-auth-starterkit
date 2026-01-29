"use server";

import { asc, eq, sql } from "drizzle-orm";

import { requireRole } from "@/lib/authz/require-role";
import type { UserRole } from "@/lib/authz/user-role";
import rbacUtils from "@/lib/premium/rbac-utils";
import { db } from "@/lib/db";
import { role, user, userRole } from "@/lib/db/schema";

type DbUserRow = Readonly<{
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  roles: ReadonlyArray<string>;
}>;

type AdminUserRow = Readonly<{
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  roles: ReadonlyArray<UserRole>;
}>;

async function fetchAdminUsers(): Promise<ReadonlyArray<DbUserRow>> {
  const rows: ReadonlyArray<DbUserRow> = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      roles: sql<ReadonlyArray<string>>`coalesce(array_agg(${role.name}) filter (where ${role.name} is not null), array[]::text[])`,
    })
    .from(user)
    .leftJoin(userRole, eq(user.id, userRole.userId))
    .leftJoin(role, eq(userRole.roleId, role.id))
    .groupBy(user.id, user.name, user.email, user.createdAt)
    .orderBy(asc(user.createdAt));
  return rows;
}

export async function listAdminUsersAction(): Promise<ReadonlyArray<AdminUserRow>> {
  await requireRole({ requiredRole: "admin" });
  const rows: ReadonlyArray<DbUserRow> = await fetchAdminUsers();
  const mapped: ReadonlyArray<AdminUserRow> = rows.map((row: DbUserRow): AdminUserRow => {
    const rolesNormalized: ReadonlyArray<UserRole> = rbacUtils.normalizeRoles({ roles: row.roles });
    return { id: row.id, name: row.name, email: row.email, createdAt: row.createdAt, roles: rolesNormalized };
  });
  return mapped;
}
