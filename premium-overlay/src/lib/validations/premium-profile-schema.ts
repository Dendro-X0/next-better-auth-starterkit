import { z } from "zod";
import type { ZodType } from "zod";

type PremiumProfileSchema = Readonly<{
  jobTitle?: string;
  company?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
}>;

const premiumProfileSchema: ZodType<PremiumProfileSchema> = z.object({
  jobTitle: z.string().max(80, "Job title must be 80 characters or less.").optional().or(z.literal("")),
  company: z.string().max(80, "Company must be 80 characters or less.").optional().or(z.literal("")),
  twitter: z.string().max(200, "Twitter must be 200 characters or less.").optional().or(z.literal("")),
  github: z.string().max(200, "GitHub must be 200 characters or less.").optional().or(z.literal("")),
  linkedin: z.string().max(200, "LinkedIn must be 200 characters or less.").optional().or(z.literal("")),
});

export { premiumProfileSchema };
