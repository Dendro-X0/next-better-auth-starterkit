import type { PremiumEntitlement } from "@/lib/premium/premium-entitlement";

type HeadlessDemoData = Readonly<{
  userId: string;
  entitlementChecked: PremiumEntitlement;
  canAccessEntitlement: boolean;
}>;

export type { HeadlessDemoData };
