import "server-only";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { isAuthError } from "@/lib/auth/auth-utils";
import { getAuthApiFunction } from "@/lib/auth/auth-api";
import { requireAuth } from "@/lib/authz/require-auth";
import { env } from "~/env";
import { eq } from "drizzle-orm";

type StepUpParams = Readonly<{
  headers: Headers;
  userId?: string;
  code?: string;
  backupCode?: string;
}>;

type StepUpResult = Readonly<{ ok: true }> | Readonly<{ ok: false; error: string }>;

type AuthApiFunction = ReturnType<typeof getAuthApiFunction>;

type TwoFactorEnabledRow = Readonly<{ twoFactorEnabled: boolean | null }>;

type VerifyTwoFactorOtpParams = Readonly<{ headers: Headers; verificationCode: string }>;

type VerifyTwoFactorBackupCodeParams = Readonly<{ headers: Headers; backupCode: string }>;

async function verifyTwoFactorOtp(params: VerifyTwoFactorOtpParams): Promise<StepUpResult> {
  const verifyTwoFactorOTP: AuthApiFunction = getAuthApiFunction("verifyTwoFactorOTP");
  try {
    await verifyTwoFactorOTP({ headers: params.headers, body: { code: params.verificationCode, trustDevice: false } });
    return { ok: true };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { ok: false, error: `2FA verification failed: ${error.body.message}` };
    }
    return { ok: false, error: "2FA verification failed." };
  }
}

async function verifyTwoFactorBackupCode(params: VerifyTwoFactorBackupCodeParams): Promise<StepUpResult> {
  try {
    const cookie: string = params.headers.get("Cookie") ?? "";
    const response: Response = await fetch(new URL("/api/auth/two-factor/use-backup-code", env.NEXT_PUBLIC_APP_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ code: params.backupCode }),
    });
    if (!response.ok) {
      try {
        const data: unknown = await response.json();
        if (typeof data === "object" && data !== null && "error" in data) {
          const err: unknown = (data as Readonly<Record<string, unknown>>).error;
          if (typeof err === "object" && err !== null && "message" in err) {
            const message: unknown = (err as Readonly<Record<string, unknown>>).message;
            if (typeof message === "string" && message.trim().length > 0) {
              return { ok: false, error: `2FA verification failed: ${message}` };
            }
          }
        }
      } catch {
        // ignore
      }
      return { ok: false, error: "2FA verification failed." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "2FA verification failed." };
  }
}

async function requireStepUp(params: StepUpParams): Promise<StepUpResult> {
  const isProduction: boolean = process.env.NODE_ENV === "production";
  if (!isProduction && env.AUTH_GUARD_MODE === "off") return { ok: true };
  const isPro: boolean = env.PREMIUM_PLAN === "pro";
  if (!isPro) return { ok: true };
  const userId: string =
    typeof params.userId === "string" && params.userId.length > 0
      ? params.userId
      : (await requireAuth({ headers: params.headers })).userId;
  const rows: ReadonlyArray<TwoFactorEnabledRow> = (await db
    .select({ twoFactorEnabled: user.twoFactorEnabled })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)) as ReadonlyArray<TwoFactorEnabledRow>;
  const twoFactorEnabled: boolean = Boolean(rows[0]?.twoFactorEnabled);
  if (!twoFactorEnabled) return { ok: true };
  const backupCode: string = String(params.backupCode ?? "").trim();
  if (backupCode) {
    return verifyTwoFactorBackupCode({ headers: params.headers, backupCode });
  }
  const verificationCode: string = String(params.code ?? "").trim();
  if (!verificationCode) {
    return { ok: false, error: "2FA required: provide a 2FA code or a backup code." };
  }
  return verifyTwoFactorOtp({ headers: params.headers, verificationCode });
}

export { requireStepUp };
