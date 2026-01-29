import { z } from "zod";

export const LinkProviderSchema = z.object({
  provider: z.enum(["google", "github"], { message: "Unsupported provider." }),
});
