"use server";

import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/security";

export type ResendVerificationState = Readonly<{
  success?: string;
  error?: string;
}>;

const EmailSchema = z.object({
  email: z.string().email(),
});

/**
 * Resend a verification email via Better Auth.
 */
export async function resendVerification(
  _prev: ResendVerificationState,
  formData: FormData,
): Promise<ResendVerificationState> {
  const parsed = EmailSchema.safeParse({ email: String(formData.get("resend_email") ?? "") });
  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }
  const { email } = parsed.data;

  // Basic rate limit: 5 per 10 minutes per email + IP
  const h = await headers();
  const ip: string = getClientIp(h);
  const rl = await rateLimit({ action: "resend-verification", identifier: email, ip, limit: 5, windowSeconds: 600 });
  if (!rl.ok) {
    return { error: "Too many requests. Please try again later." };
  }

  try {
    await auth.api.sendVerificationEmail({ body: { email, callbackURL: "/" } });
    return { success: "Verification email sent. Please check your inbox (and spam folder)." };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: error.body.message };
    }
    console.error("resendVerification error:", error);
    return { error: "Failed to send verification email. Please try again later." };
  }
}
