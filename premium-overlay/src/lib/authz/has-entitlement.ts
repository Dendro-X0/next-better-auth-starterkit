import "server-only";

import { headers as nextHeaders } from "next/headers";

import { requireAuth } from "@/lib/authz/require-auth";
import type { PremiumEntitlement } from "@/lib/premium/premium-entitlement";
import { premiumResolveUserEntitlement } from "@/lib/premium/premium-user-entitlement";

type HasEntitlementParams = Readonly<{
  entitlement: PremiumEntitlement;
  headers?: Headers;
}>;

async function hasEntitlement(params: HasEntitlementParams): Promise<boolean> {
  const requestHeaders: Headers = params.headers ?? new Headers(await nextHeaders());
  const authResult = await requireAuth({ headers: requestHeaders });
  const allowed: boolean = await premiumResolveUserEntitlement({ userId: authResult.userId, entitlement: params.entitlement });
  return allowed;
}

export { hasEntitlement };
