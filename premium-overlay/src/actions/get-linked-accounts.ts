"use server";

import { headers as nextHeaders } from "next/headers";

import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { requireAuth } from "@/lib/authz/require-auth";
import type { LinkedAccount } from "@/lib/types/linked-account";
import type { ServerActionResult } from "@/lib/types/server-action-result";
import { eq } from "drizzle-orm";

type GetLinkedAccountsOk = Readonly<{ accounts: ReadonlyArray<LinkedAccount> }>;

type AccountRow = Readonly<{ providerId: string; accountId: string; createdAt: Date }>;

export async function getLinkedAccounts(): Promise<ServerActionResult<GetLinkedAccountsOk>> {
  const requestHeaders: Headers = new Headers(await nextHeaders());
  let userId: string;
  try {
    const authResult = await requireAuth({ headers: requestHeaders });
    userId = authResult.userId;
  } catch {
    return { ok: false, error: { code: "NOT_AUTHENTICATED", message: "Not authenticated" } };
  }
  const accounts: ReadonlyArray<AccountRow> = (await db.query.account.findMany({
    where: eq(account.userId, userId),
    columns: { providerId: true, accountId: true, createdAt: true },
    orderBy: (t, { asc }) => [asc(t.providerId)],
  })) as ReadonlyArray<AccountRow>;
  const linkedAccounts: ReadonlyArray<LinkedAccount> = accounts.map((row: AccountRow): LinkedAccount => {
    const providerId: string = row.providerId;
    const accountId: string = row.accountId;
    const createdAt: string = row.createdAt.toISOString();
    return { providerId, accountId, createdAt };
  });
  return { ok: true, data: { accounts: linkedAccounts } };
}
