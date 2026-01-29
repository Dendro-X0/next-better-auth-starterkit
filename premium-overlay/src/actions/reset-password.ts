"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { ResetPasswordSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/security";
import type { ZodIssue } from "zod";
import { createHash } from "crypto";
import { getAuditRequestContext } from "@/lib/audit/get-audit-request-context";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";

export type FormState = {
  error?: { message: string };
  message?: string;
};
export async function resetPasswordAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = ResetPasswordSchema.safeParse(data);

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.issues
      .map((e: ZodIssue) => e.message)
      .join(", ");
    return { error: { message: errorMessages || "Invalid fields provided." } };
  }

  const { token, password } = validatedFields.data;

  try {
    // Rate limit reset attempts by token + client IP to mitigate brute force/guessing
    const h: Headers = new Headers(await headers());
    const ip: string = getClientIp(h);
    const rl = await rateLimit({ action: "reset_password", identifier: token, ip });
    if (!rl.ok) {
      return { error: { message: "Too many reset attempts. Please request a new link." } };
    }

    await auth.api.resetPassword({ body: { token, newPassword: password } });
    const auditContext = getAuditRequestContext({ headers: h });
    const tokenHash: string = createHash("sha256").update(token).digest("hex");
    void writeAuditEvent({
      event: "password_reset_completed",
      actorUserId: null,
      targetUserId: null,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      metadata: { tokenHash },
    });
    redirect("/auth/login?message=Password has been reset successfully.");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Reset password error:", error);

    if (isAuthError(error)) {
      return { error: { message: error.body.message } };
    }

    return { error: { message: "An error occurred. Please try again." } };
  }
}
