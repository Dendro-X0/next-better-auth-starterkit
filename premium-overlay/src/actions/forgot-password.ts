"use server";

import { auth } from "@/lib/auth/auth";
import { ForgotPasswordSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/security";
import { env } from "~/env";
import { createHash } from "crypto";
import { getAuditRequestContext } from "@/lib/audit/get-audit-request-context";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";

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
  const emailHash: string = createHash("sha256").update(email).digest("hex");

  try {
    // Rate limit forgot-password email sends by email + client IP
    const h: Headers = new Headers(await headers());
    const ip: string = getClientIp(h);
    const rl = await rateLimit({ action: "forgot_password", identifier: email, ip });
    if (!rl.ok) {
      return { error: { message: "Too many password reset requests. Please try again later." } };
    }

    const auditContext = getAuditRequestContext({ headers: h });
    void writeAuditEvent({
      event: "password_reset_requested",
      actorUserId: null,
      targetUserId: null,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      metadata: { emailHash },
    });

    const redirectTo: string = new URL("/auth/reset-password", env.NEXT_PUBLIC_APP_URL).toString();
    await auth.api.requestPasswordReset({ body: { email, redirectTo } });
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
