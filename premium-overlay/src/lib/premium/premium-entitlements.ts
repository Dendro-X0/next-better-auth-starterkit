import type { UserRole } from "@/lib/authz/user-role";
import type { PremiumPlan } from "@/lib/premium/premium-plan";

type GetPremiumEntitlementsParams = Readonly<{
  roles: ReadonlyArray<UserRole>;
  plan: PremiumPlan;
}>;

type PremiumEntitlements = Readonly<{
  canAccessAdminTab: boolean;
  canAccessProfilePlusTab: boolean;
  canAccessSecurityTab: boolean;
}>;

function getPremiumEntitlements(params: GetPremiumEntitlementsParams): PremiumEntitlements {
  const isPremium: boolean = params.plan === "pro";
  const isAdmin: boolean = params.roles.includes("admin");
  const canAccessProfilePlusTab: boolean = isPremium;
  const canAccessAdminTab: boolean = isPremium && isAdmin;
  const canAccessSecurityTab: boolean = isPremium;
  return { canAccessAdminTab, canAccessProfilePlusTab, canAccessSecurityTab };
}

export default getPremiumEntitlements;
