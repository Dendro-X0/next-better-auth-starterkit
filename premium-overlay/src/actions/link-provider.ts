"use server";

import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";

import { isAuthError } from "@/lib/auth/auth-utils";
import { getAuthApiFunction } from "@/lib/auth/auth-api";
import { requireAuth } from "@/lib/authz/require-auth";
import type { FormState } from "@/lib/types/actions";
import { LinkProviderSchema } from "@/lib/validations/link-provider-schema";

type AuthApiFunction = (args: Readonly<Record<string, unknown>>) => Promise<unknown>;

type LinkSocialAccountResponse = Partial<Readonly<{ url: string; redirect: boolean }>>;

type LinkSocialAccountParams = Readonly<{ headers: Headers; provider: string; callbackURL: string }>;

async function linkSocialAccountViaAuth(params: LinkSocialAccountParams): Promise<LinkSocialAccountResponse> {
  const linkSocialAccount: AuthApiFunction = getAuthApiFunction("linkSocialAccount");
  const response: unknown = await linkSocialAccount({
    headers: params.headers,
    body: { provider: params.provider, callbackURL: params.callbackURL },
  });
  if (typeof response === "object" && response !== null) return response as LinkSocialAccountResponse;
  return {};
}

export async function linkProviderAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const validatedFields = LinkProviderSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { error: { fields: validatedFields.error.flatten().fieldErrors } };
  }
  const requestHeaders: Headers = new Headers(await nextHeaders());
  try {
    await requireAuth({ headers: requestHeaders });
  } catch {
    return { error: { form: "Not authenticated" } };
  }
  try {
    const callbackURL: string = "/user?message=Provider%20linked";
    const result: LinkSocialAccountResponse = await linkSocialAccountViaAuth({
      headers: requestHeaders,
      provider: validatedFields.data.provider,
      callbackURL,
    });
    const url: string | undefined = result.url;
    if (typeof url === "string" && url.length > 0) redirect(url);
    return { success: true, message: "Link flow started." };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (isAuthError(error)) {
      return { error: { form: error.body.message } };
    }
    return { error: { form: "Failed to link provider." } };
  }
}
