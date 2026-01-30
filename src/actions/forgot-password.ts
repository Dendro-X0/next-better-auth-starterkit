"use server";

import { auth } from "@/lib/auth/auth";
import { ForgotPasswordSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/security";

export type FormState = {
  error?: { message: string };
  message?: string;
};

export async function forgotPasswordAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = ForgotPasswordSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: { message: "Invalid email provided." } };
  }

  const { email } = validatedFields.data;

  try {
    // Rate limit forgot-password email sends by email + client IP
    const h: Headers = await headers();
    const ip: string = getClientIp(h);
    const rl = await rateLimit({ action: "forgot_password", identifier: email, ip });
    if (!rl.ok) {
      return { error: { message: "Too many password reset requests. Please try again later." } };
    }

    await auth.api.requestPasswordReset({ body: { email } });
  } catch (error: unknown) {
    // Log the error for debugging, but don't expose it to the client to prevent email enumeration.
    console.error("Forgot password error:", error);
  }

  // Always return the same message to prevent email enumeration.
  return {
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };
}
