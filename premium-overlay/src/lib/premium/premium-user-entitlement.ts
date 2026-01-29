import type { UserRole } from "@/lib/authz/user-role";
import type { PremiumEntitlement } from "@/lib/premium/premium-entitlement";
import getPremiumEntitlements from "@/lib/premium/premium-entitlements";
import type { PremiumPlan } from "@/lib/premium/premium-plan";
import resolvePremiumPlan from "@/lib/premium/resolve-premium-plan";
import { premiumResolveUserRoles } from "@/lib/premium/premium-user-roles";

type ResolveUserEntitlementParams = Readonly<{
  userId: string;
  entitlement: PremiumEntitlement;
}>;

type ResolveUserEntitlement = (params: ResolveUserEntitlementParams) => Promise<boolean>;

const premiumResolveUserEntitlement: ResolveUserEntitlement = async function premiumResolveUserEntitlement(
  params: ResolveUserEntitlementParams,
): Promise<boolean> {
  const roles: ReadonlyArray<UserRole> = await premiumResolveUserRoles({ userId: params.userId });
  const plan: PremiumPlan = await resolvePremiumPlan({ userId: params.userId });
  const entitlements = getPremiumEntitlements({ roles, plan });
  if (params.entitlement === "admin_tab") return entitlements.canAccessAdminTab;
  if (params.entitlement === "profile_plus_tab") return entitlements.canAccessProfilePlusTab;
  if (params.entitlement === "security_tab") return entitlements.canAccessSecurityTab;
  return false;
};

export { premiumResolveUserEntitlement };
