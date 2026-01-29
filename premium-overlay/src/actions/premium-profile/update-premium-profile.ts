"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import type { FormState } from "@/lib/types/actions";
import type { PremiumSocial } from "@/lib/types/premium-social";
import { premiumProfileSchema } from "@/lib/validations/premium-profile-schema";

type ParsedPremiumProfile = Readonly<{
  jobTitle?: string;
  company?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
}>;

function normalizeString(value: string | undefined): string {
  return (value ?? "").trim();
}

function toOptionalString(value: string | undefined): string | undefined {
  const v: string = normalizeString(value);
  if (!v) return undefined;
  return v;
}

function toPremiumSocial(params: ParsedPremiumProfile): PremiumSocial {
  const twitter: string | undefined = toOptionalString(params.twitter);
  const github: string | undefined = toOptionalString(params.github);
  const linkedin: string | undefined = toOptionalString(params.linkedin);
  const social: PremiumSocial = {
    twitter,
    github,
    linkedin,
  };
  return social;
}

export async function updatePremiumProfileAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: { form: "Not authenticated" } };
  }
  const validatedFields = premiumProfileSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { error: { fields: validatedFields.error.flatten().fieldErrors } };
  }
  try {
    const data: ParsedPremiumProfile = validatedFields.data;
    const jobTitle: string | undefined = toOptionalString(data.jobTitle);
    const company: string | undefined = toOptionalString(data.company);
    const social: PremiumSocial = toPremiumSocial(data);
    await db
      .insert(userProfile)
      .values({ id: session.user.id, jobTitle, company, social })
      .onConflictDoUpdate({
        target: userProfile.id,
        set: { jobTitle, company, social },
      });
    return { success: true, message: "Premium profile updated successfully" };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}
