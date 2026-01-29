import type { UserRole } from "@/lib/authz/user-role";

type ResolveUserRoles = (params: Readonly<{ userId: string }>) => Promise<ReadonlyArray<UserRole>>;

const premiumResolveUserRoles: ResolveUserRoles = async (): Promise<ReadonlyArray<UserRole>> => {
  const roles: ReadonlyArray<UserRole> = ["user"];
  return roles;
};

export { premiumResolveUserRoles };
