import "server-only";

import { headers as nextHeaders } from "next/headers";

import { requireAuth } from "@/lib/authz/require-auth";
import type { UserRole } from "@/lib/authz/user-role";
import { premiumResolveUserRoles } from "@/lib/premium/premium-user-roles";

type RequireRoleParams = Readonly<{
  requiredRole: UserRole;
  headers?: Headers;
}>;

type RoleRank = Readonly<Record<UserRole, number>>;

const roleRank: RoleRank = {
  user: 1,
  moderator: 2,
  admin: 3,
};

function hasRequiredRole(params: Readonly<{ roles: ReadonlyArray<UserRole>; requiredRole: UserRole }>): boolean {
  const highestRoleRank: number = params.roles.reduce((max: number, role: UserRole) => {
    const rank: number = roleRank[role];
    return rank > max ? rank : max;
  }, 0);
  return highestRoleRank >= roleRank[params.requiredRole];
}

async function requireRole(params: RequireRoleParams): Promise<Readonly<{ userId: string; roles: ReadonlyArray<UserRole> }>> {
  const requestHeaders: Headers = params.headers ?? new Headers(await nextHeaders());
  const authResult = await requireAuth({ headers: requestHeaders });
  const roles: ReadonlyArray<UserRole> = await premiumResolveUserRoles({ userId: authResult.userId });
  if (!hasRequiredRole({ roles, requiredRole: params.requiredRole })) {
    throw new Error("Forbidden");
  }
  return { userId: authResult.userId, roles };
}

export { requireRole };
