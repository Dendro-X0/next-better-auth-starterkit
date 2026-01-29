import type { PremiumSocial } from "@/lib/types/premium-social";

type PremiumProfile = Readonly<{
  jobTitle: string;
  company: string;
  social: PremiumSocial;
}>;

export type { PremiumProfile };
