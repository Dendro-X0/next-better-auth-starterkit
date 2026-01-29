import type { UserRole } from "@/lib/authz/user-role";

type RolePriority = Readonly<Record<UserRole, number>>;

type NormalizeRolesParams = Readonly<{
  roles: ReadonlyArray<string>;
}>;

type GetPrimaryRoleParams = Readonly<{
  roles: ReadonlyArray<UserRole>;
}>;

type ShouldBlockLastAdminDemotionParams = Readonly<{
  targetHasAdminRole: boolean;
  nextRole: UserRole;
  adminCount: number;
}>;

const rolePriority: RolePriority = {
  user: 1,
  moderator: 2,
  admin: 3,
} as const;

const rbacUtils = {
  isUserRole(value: string): value is UserRole {
    return value === "admin" || value === "moderator" || value === "user";
  },

  normalizeRoles(params: NormalizeRolesParams): ReadonlyArray<UserRole> {
    const normalized: ReadonlyArray<UserRole> = params.roles.filter(rbacUtils.isUserRole);
    if (normalized.length > 0) return normalized;
    const fallback: ReadonlyArray<UserRole> = ["user"];
    return fallback;
  },

  getPrimaryRole(params: GetPrimaryRoleParams): UserRole {
    const highest: UserRole = params.roles.reduce((best: UserRole, role: UserRole) => {
      return rolePriority[role] > rolePriority[best] ? role : best;
    }, "user");
    return highest;
  },

  shouldBlockLastAdminDemotion(params: ShouldBlockLastAdminDemotionParams): boolean {
    const isDemoting: boolean = params.targetHasAdminRole && params.nextRole !== "admin";
    if (!isDemoting) return false;
    return params.adminCount <= 1;
  },
} as const;

export default rbacUtils;
