"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAuthError } from "@/lib/auth/auth-utils";
import { Verify2FASchema } from "@/lib/validations/auth";
import { rateLimit, getClientIp } from "@/lib/security";
import { env } from "~/env";

export type FormState = {
  error?: {
    form?: string;
    fields?: {
      code?: string[];
      backupCode?: string[];
    };
  };
  message?: string;
};

export async function verifyTwoFactorAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = Verify2FASchema.safeParse(data);

  if (!validatedFields.success) {
    const formErrors = validatedFields.error.flatten().formErrors;
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      error: {
        form: formErrors.join(", "),
        fields: {
          code: fieldErrors.code,
          backupCode: fieldErrors.backupCode,
        },
      },
    };
  }

  const { method, code, backupCode, rememberDevice } = validatedFields.data;
  const shouldRemember = rememberDevice === "on";

  async function readApiErrorMessage(response: Response): Promise<string> {
    try {
      const data: unknown = await response.json();
      if (typeof data === "object" && data !== null) {
        const obj: Readonly<Record<string, unknown>> = data as Readonly<Record<string, unknown>>;
        const err: unknown = obj.error;
        if (typeof err === "object" && err !== null) {
          const msg: unknown = (err as Readonly<Record<string, unknown>>).message;
          if (typeof msg === "string" && msg.trim().length > 0) return msg;
        }
        const message: unknown = obj.message;
        if (typeof message === "string" && message.trim().length > 0) return message;
      }
    } catch {
      // ignore
    }
    return "Verification failed.";
  }

  try {
    const h: Headers = new Headers(await headers());
    const ip: string = getClientIp(h);
    const rl = await rateLimit({ action: "verify_2fa", identifier: ip, ip });
    if (!rl.ok) {
      return { error: { form: "Too many verification attempts. Please try again later." } };
    }

    const cookie: string = h.get("Cookie") ?? "";

    if (method === "backup") {
      const backup: string = String(backupCode ?? "").trim();
      const response: Response = await fetch(new URL("/api/auth/two-factor/use-backup-code", env.NEXT_PUBLIC_APP_URL), {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ code: backup }),
      });
      if (!response.ok) {
        const message: string = await readApiErrorMessage(response);
        return { error: { form: message } };
      }
      redirect("/user?message=Successfully signed in!");
    }

    const verificationCode: string = String(code ?? "").trim();
    const endpoint: string = method === "sms" ? "/api/auth/two-factor/verify-otp" : "/api/auth/two-factor/verify-totp";
    const response: Response = await fetch(new URL(endpoint, env.NEXT_PUBLIC_APP_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ code: verificationCode, trustDevice: shouldRemember }),
    });
    if (!response.ok) {
      const message: string = await readApiErrorMessage(response);
      return { error: { form: message } };
    }
    redirect("/user?message=Successfully signed in!");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Verify 2FA error:", error);

    if (isAuthError(error)) {
      return { error: { form: error.body.message } };
    }

    return { error: { form: "An unexpected error occurred." } };
  }
}
