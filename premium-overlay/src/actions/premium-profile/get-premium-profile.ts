"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { user, userProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { PremiumProfile } from "@/lib/types/premium-profile";
import type { PremiumSocial } from "@/lib/types/premium-social";

type PremiumProfileResult = Readonly<{ profile: PremiumProfile }> | Readonly<{ error: string }>;

type DbUserRow = Readonly<{
  id: string;
  profile: null | Readonly<{
    jobTitle: string | null;
    company: string | null;
    social: PremiumSocial | null;
  }>;
}>;

function toStringValue(value: string | null | undefined): string {
  return value ?? "";
}

function toSocialValue(value: PremiumSocial | null | undefined): PremiumSocial {
  return value ?? {};
}

export async function getPremiumProfile(): Promise<PremiumProfileResult> {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: "Not authenticated" };
  }
  const data: DbUserRow | undefined = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    with: {
      profile: {
        columns: {
          jobTitle: true,
          company: true,
          social: true,
        },
      },
    },
    columns: {
      id: true,
    },
  });
  if (!data) {
    return { error: "User not found." };
  }
  const profile: PremiumProfile = {
    jobTitle: toStringValue(data.profile?.jobTitle),
    company: toStringValue(data.profile?.company),
    social: toSocialValue(data.profile?.social),
  };
  return { profile };
}
