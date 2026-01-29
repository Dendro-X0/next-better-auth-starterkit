"use server";

import { headers as nextHeaders } from "next/headers";
import { revalidatePath } from "next/cache";

import { isAuthError } from "@/lib/auth/auth-utils";
import { getAuthApiFunction } from "@/lib/auth/auth-api";
import { requireAuth } from "@/lib/authz/require-auth";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import type { FormState } from "@/lib/types/actions";
import { UnlinkProviderSchema } from "@/lib/validations/unlink-provider-schema";
import { and, eq, inArray } from "drizzle-orm";

type AuthApiFunction = (args: Readonly<Record<string, unknown>>) => Promise<unknown>;

type UnlinkAccountParams = Readonly<{ headers: Headers; providerId: string; accountId?: string }>;

type AccountProviderRow = Readonly<{ providerId: string; password: string | null }>;

async function unlinkAccountViaAuth(params: UnlinkAccountParams): Promise<void> {
  const unlinkAccount: AuthApiFunction = getAuthApiFunction("unlinkAccount");
  await unlinkAccount({ headers: params.headers, body: { providerId: params.providerId, ...(params.accountId ? { accountId: params.accountId } : {}) } });
}

type CountMethodsParams = Readonly<{ userId: string }>;

async function countAuthMethods(params: CountMethodsParams): Promise<number> {
  const rows: ReadonlyArray<AccountProviderRow> = (await db.query.account.findMany({
    where: and(eq(account.userId, params.userId), inArray(account.providerId, ["email", "google", "github"])),
    columns: { providerId: true, password: true },
  })) as ReadonlyArray<AccountProviderRow>;
  const providerIds: ReadonlyArray<string> = rows.map((r: AccountProviderRow): string => r.providerId);
  const uniqueProviderCount: number = new Set(providerIds).size;
  return uniqueProviderCount;
}

export async function unlinkProviderAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const validatedFields = UnlinkProviderSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { error: { fields: validatedFields.error.flatten().fieldErrors } };
  }
  if (validatedFields.data.providerId === "email") {
    return { error: { form: "Email/password cannot be unlinked." } };
  }
  const requestHeaders: Headers = new Headers(await nextHeaders());
  let userId: string;
  try {
    const authResult = await requireAuth({ headers: requestHeaders });
    userId = authResult.userId;
  } catch {
    return { error: { form: "Not authenticated" } };
  }
  const methodCount: number = await countAuthMethods({ userId });
  if (methodCount <= 1) {
    return { error: { form: "You cannot unlink your last sign-in method." } };
  }
  try {
    await unlinkAccountViaAuth({ headers: requestHeaders, providerId: validatedFields.data.providerId, accountId: validatedFields.data.accountId });
    revalidatePath("/user");
    return { success: true, message: "Provider unlinked." };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: { form: error.body.message } };
    }
    return { error: { form: "Failed to unlink provider." } };
  }
}
