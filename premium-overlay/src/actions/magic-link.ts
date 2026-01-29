"use server";

import { auth } from "@/lib/auth/auth";
import { env } from "~/env";
import { MagicLinkSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import type { FormState } from "@/lib/types/actions";
import { rateLimit, getClientIp } from "@/lib/security";

export async function sendMagicLinkAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = MagicLinkSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: { form: "Invalid email provided." } };
  }

  const { email } = validatedFields.data;

  try {
    // Rate limit magic-link sends by email + client IP
    const h = await headers();
    const ip: string = getClientIp(h);
    const rl = await rateLimit({ action: "magic_link", identifier: email, ip });
    if (!rl.ok) {
      return { error: { form: "Too many magic link requests. Please try again later." } };
    }

    await auth.api.signInMagicLink({
      headers: h,
      body: {
        email,
        callbackURL: new URL("/user", env.NEXT_PUBLIC_APP_URL).toString(),
      },
    });
  } catch (error: unknown) {
    // Log the error for debugging, but don't expose it to the client to prevent email enumeration.
    console.error("Magic link error:", error);
  }

  // Always return the same message to prevent email enumeration.
  return {
    success: true,
    message: "If an account with that email exists, a magic link has been sent.",
  };
}
