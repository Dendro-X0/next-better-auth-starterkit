"use server";

import { headers } from "next/headers";

import { hasEntitlement } from "@/lib/authz/has-entitlement";
import { requireAuth } from "@/lib/authz/require-auth";
import type { PremiumEntitlement } from "@/lib/premium/premium-entitlement";
import type { ServerActionResult } from "@/lib/types/server-action-result";
import type { HeadlessDemoData } from "@/app/examples/headless/headless-demo-types";

type HeadlessDemoState = ServerActionResult<HeadlessDemoData> | null;

async function runHeadlessDemoAction(_prevState: HeadlessDemoState, _formData: FormData): Promise<HeadlessDemoState> {
  const requestHeaders: Headers = new Headers(await headers());
  try {
    const authResult = await requireAuth({ headers: requestHeaders });
    const entitlement: PremiumEntitlement = "security_tab";
    const canAccessEntitlement: boolean = await hasEntitlement({ entitlement, headers: requestHeaders });
    const data: HeadlessDemoData = { userId: authResult.userId, entitlementChecked: entitlement, canAccessEntitlement };
    return { ok: true, data };
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: { code: "UNKNOWN", message } };
  }
}

export { runHeadlessDemoAction };
