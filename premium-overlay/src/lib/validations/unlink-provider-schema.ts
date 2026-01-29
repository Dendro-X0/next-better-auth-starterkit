import { z } from "zod";

export const UnlinkProviderSchema = z.object({
  providerId: z.enum(["email", "google", "github"], { message: "Unsupported provider." }),
  accountId: z.string().trim().min(1, { message: "Account id is required." }).optional(),
});
