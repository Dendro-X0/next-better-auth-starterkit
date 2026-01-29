"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { LoginSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/security";
import { getAuditRequestContext } from "@/lib/audit/get-audit-request-context";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";

/**
 * Form state type for login action
 */
export type LoginFormState = {
  success?: boolean;
  error?: {
    message?: string;
    fields?: {
      identifier?: string[];
      password?: string[];
    };
  };
};

/**
 * Robust login action using AuthService abstraction
 * Handles validation, authentication, and error states
 */
export async function loginAction(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  try {
    const credentials = Object.fromEntries(formData.entries());
    const validatedFields = LoginSchema.safeParse(credentials);

    if (!validatedFields.success) {
      return {
        error: {
          fields: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    const { identifier, password } = validatedFields.data;
    const isEmail = /.+@.+\..+/.test(identifier);

    // Rate limit logins by email + client IP
    const h: Headers = new Headers(await headers());
    const ip: string = getClientIp(h);
    const rl = await rateLimit({ action: "login", identifier, ip });
    if (!rl.ok) {
      return { error: { message: "Too many login attempts. Please try again later." } };
    }

    const response: unknown = isEmail
      ? await auth.api.signInEmail({ body: { email: identifier, password } })
      : await auth.api.signInUsername({ body: { username: identifier, password } });

    if (typeof response === "object" && response !== null && "twoFactorRedirect" in response) {
      const raw: unknown = (response as Readonly<Record<string, unknown>>).twoFactorRedirect;
      if (raw === true) {
        redirect("/auth/verify-2fa");
      }
    }

    const auditContext = getAuditRequestContext({ headers: h });
    void writeAuditEvent({
      event: "sign_in",
      actorUserId: null,
      targetUserId: null,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      metadata: { identifier, method: isEmail ? "email" : "username", result: "success" },
    });
    redirect("/user?message=Logged%20in%20successfully");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Login action error:", error);

    if (isAuthError(error)) {
      const h: Headers = new Headers(await headers());
      const auditContext = getAuditRequestContext({ headers: h });
      void writeAuditEvent({
        event: "sign_in",
        actorUserId: null,
        targetUserId: null,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
        metadata: { result: "failed", reason: error.body.message },
      });
      return { error: { message: error.body.message } };
    }

    return { error: { message: "Invalid email or password. Please try again." } };
  }
}
