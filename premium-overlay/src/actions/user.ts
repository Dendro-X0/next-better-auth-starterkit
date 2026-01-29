"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getAuthApiFunction } from "@/lib/auth/auth-api";
import { requireAuth } from "@/lib/authz/require-auth";
import { requireStepUp } from "@/lib/authz/require-step-up";
import { isAuthError } from "@/lib/auth/auth-utils";
import { getAuditRequestContext } from "@/lib/audit/get-audit-request-context";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import {
  ChangePasswordSchema,
  ChangeEmailSchema,
  DeleteAccountSchema,
  NotificationSettingsSchema,
  PrivacySettingsSchema,
  ProfileSchema,
  setPasswordSchema,
} from "@/lib/validations/auth";
import { env } from "~/env";
import { db } from "@/lib/db";
import { account, user, userProfile } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import type { UserProfile as UserProfileType, UserSettings } from "@/lib/types/user";
import type { FormState } from "@/lib/types/actions";
import type { ServerActionResult } from "@/lib/types/server-action-result";

type AuthApiFunction = ReturnType<typeof getAuthApiFunction>;

async function changeEmailViaAuth(params: Readonly<{ headers: Headers; newEmail: string; callbackURL: string }>): Promise<void> {
  const changeEmail: AuthApiFunction = getAuthApiFunction("changeEmail");
  await changeEmail({ headers: params.headers, body: { newEmail: params.newEmail, callbackURL: params.callbackURL } });
}

async function revokeOtherSessionsViaAuth(params: Readonly<{ headers: Headers }>): Promise<void> {
  const revokeOtherSessions: AuthApiFunction = getAuthApiFunction("revokeOtherSessions");
  try {
    await revokeOtherSessions({ headers: params.headers });
  } catch {
    await revokeOtherSessions({ headers: params.headers, body: {} });
  }
}

async function verifyTwoFactorOtpViaAuth(params: Readonly<{ headers: Headers; code: string }>): Promise<void> {
  const verifyTwoFactorOTP: AuthApiFunction = getAuthApiFunction("verifyTwoFactorOTP");
  await verifyTwoFactorOTP({ headers: params.headers, body: { code: params.code, trustDevice: false } });
}

async function deleteUserViaAuth(params: Readonly<{ headers: Headers; password?: string; callbackURL: string }>): Promise<void> {
  const deleteUser: AuthApiFunction = getAuthApiFunction("deleteUser");
  const body: Readonly<Record<string, string>> = params.password
    ? { password: params.password, callbackURL: params.callbackURL }
    : { callbackURL: params.callbackURL };
  try {
    await deleteUser({ headers: params.headers, body });
  } catch {
    await deleteUser({ headers: params.headers, body: { ...body } });
  }
}

export async function getUserProfile(): Promise<ServerActionResult<Readonly<{ profile: UserProfileType }>>> {
  const requestHeaders: Headers = new Headers(await headers());
  let userId: string;
  try {
    const authResult = await requireAuth({ headers: requestHeaders });
    userId = authResult.userId;
  } catch {
    return { ok: false, error: { code: "NOT_AUTHENTICATED", message: "Not authenticated" } };
  }

  const data = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      profile: true,
    },
  });

  if (!data) {
    return { ok: false, error: { code: "NOT_FOUND", message: "User not found." } };
  }

  const profile: UserProfileType = {
    id: data.id,
    name: data.name,
    email: data.email,
    phoneNumber: data.phoneNumber ?? "",
    phoneNumberVerified: Boolean(data.phoneNumberVerified),
    avatar: data.image || "",
    username: data.username || "",
    bio: data.profile?.bio || "",
    location: data.profile?.location || "",
    website: data.profile?.website || "",
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
    emailVerified: data.emailVerified,
  };
  return { ok: true, data: { profile } };
}

export async function getUserSettings(): Promise<ServerActionResult<Readonly<{ settings: UserSettings }>>> {
  const requestHeaders: Headers = new Headers(await headers());
  let userId: string;
  try {
    const authResult = await requireAuth({ headers: requestHeaders });
    userId = authResult.userId;
  } catch {
    return { ok: false, error: { code: "NOT_AUTHENTICATED", message: "Not authenticated" } };
  }

  const data = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      profile: true,
    },
  });

  if (!data) {
    return { ok: false, error: { code: "NOT_FOUND", message: "User not found." } };
  }

  const emailAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, "email")),
    columns: { password: true },
  });

  const notifications = NotificationSettingsSchema.parse(data.profile?.notifications || {});
  const privacy = PrivacySettingsSchema.parse(data.profile?.privacy || {});

  const settings: UserSettings = {
    hasPassword: !!emailAccount?.password,
    twoFactorEnabled: data.twoFactorEnabled ?? false,
    backupCodes: [], // This would be stored securely, not in the user record
    trustedDevices: [], // This would be managed separately
    notifications,
    privacy,
  };
  return { ok: true, data: { settings } };
}

export async function changeEmailAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const validatedFields = ChangeEmailSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { error: { fields: validatedFields.error.flatten().fieldErrors } };
  }
  const requestHeaders: Headers = new Headers(await headers());
  let userId: string;
  try {
    const authResult = await requireAuth({ headers: requestHeaders });
    userId = authResult.userId;
  } catch {
    return { error: { form: "Not authenticated" } };
  }
  const stepUpResult = await requireStepUp({
    headers: requestHeaders,
    userId,
    code: validatedFields.data.code,
    backupCode: validatedFields.data.backupCode,
  });
  if (!stepUpResult.ok) {
    return { error: { form: stepUpResult.error } };
  }
  const callbackBasePath: string = "/auth/change-email";
  const callbackURL: string = validatedFields.data.revokeOtherSessions
    ? `${callbackBasePath}?revokeOtherSessions=true`
    : callbackBasePath;
  try {
    await changeEmailViaAuth({ headers: requestHeaders, newEmail: validatedFields.data.newEmail, callbackURL });
    return { success: true, message: "Verification email sent to your new address." };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: { form: error.body.message } };
    }
    return { error: { form: "Failed to request email change." } };
  }
}

export async function deleteAccountAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const validatedFields = DeleteAccountSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { error: { fields: validatedFields.error.flatten().fieldErrors } };
  }
  const requestHeaders: Headers = new Headers(await headers());
  let userId: string;
  try {
    const authResult = await requireAuth({ headers: requestHeaders });
    userId = authResult.userId;
  } catch {
    return { error: { form: "Not authenticated" } };
  }
  const userRow = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { twoFactorEnabled: true },
  });
  if (!userRow) {
    return { error: { form: "User not found." } };
  }
  const emailAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, "email")),
    columns: { password: true },
  });
  const hasPassword: boolean = Boolean(emailAccount?.password);
  const twoFactorEnabled: boolean = Boolean(userRow.twoFactorEnabled);
  const callbackURL: string = "/goodbye";
  try {
    if (hasPassword) {
      const password: string = String(validatedFields.data.password ?? "").trim();
      if (!password) return { error: { form: "Password is required." } };
      await deleteUserViaAuth({ headers: requestHeaders, password, callbackURL });
      redirect("/goodbye");
    }
    if (twoFactorEnabled) {
      const verificationCode: string = String(validatedFields.data.code || validatedFields.data.backupCode || "").trim();
      if (!verificationCode) return { error: { form: "2FA code or backup code is required." } };
      await verifyTwoFactorOtpViaAuth({ headers: requestHeaders, code: verificationCode });
      await deleteUserViaAuth({ headers: requestHeaders, callbackURL });
      redirect("/goodbye");
    }
    await deleteUserViaAuth({ headers: requestHeaders, callbackURL });
    redirect("/goodbye");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (isAuthError(error)) {
      return { error: { form: error.body.message } };
    }
    return { error: { form: "Failed to delete account." } };
  }
}

export async function updateProfileAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const requestHeaders: Headers = new Headers(await headers());
  let userId: string;
  try {
    const authResult = await requireAuth({ headers: requestHeaders });
    userId = authResult.userId;
  } catch {
    return { error: { form: "Not authenticated" } };
  }

  const validatedFields = ProfileSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { 
      error: { 
        fields: validatedFields.error.flatten().fieldErrors 
      }
    };
  }

  try {
    const { name, username, bio, location, website } = validatedFields.data;

    // Enforce username uniqueness when changed
    if (username) {
      const taken = await db.query.user.findFirst({
        where: and(eq(user.username, username), ne(user.id, userId)),
      });
      if (taken) {
        return { error: { fields: { username: ["Username is already taken"] } } };
      }
    }

    await db.update(user).set({ name, username }).where(eq(user.id, userId));

    await db
      .insert(userProfile)
      .values({ id: userId, bio, location, website })
      .onConflictDoUpdate({
        target: userProfile.id,
        set: { bio, location, website },
      });

    return { success: true, message: "Profile updated successfully" };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function setPasswordAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const validatedFields = setPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { 
      error: { 
        fields: validatedFields.error.flatten().fieldErrors 
      }
    };
  }

  try {
    const h: Headers = new Headers(await headers());
    await auth.api.setPassword({
      headers: h,
      body: { newPassword: validatedFields.data.newPassword },
    });
    return { success: true, message: "Password set successfully." };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: { form: error.body.message } };
    }
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function changePasswordAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const validatedFields = ChangePasswordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { 
      error: { 
        fields: validatedFields.error.flatten().fieldErrors 
      }
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  const h: Headers = new Headers(await headers());
  let userId: string;
  try {
    const authResult = await requireAuth({ headers: h });
    userId = authResult.userId;
  } catch {
    return { error: { form: "Not authenticated" } };
  }
  const stepUpResult = await requireStepUp({
    headers: h,
    userId,
    code: validatedFields.data.code,
    backupCode: validatedFields.data.backupCode,
  });
  if (!stepUpResult.ok) {
    return { error: { form: stepUpResult.error } };
  }
  try {
    await auth.api.changePassword({
      headers: h,
      body: { currentPassword, newPassword },
    });
    return { success: true, message: "Password changed successfully." };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: { form: error.body.message } };
    }
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function updateNotificationSettingsAction(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const requestHeaders: Headers = new Headers(await headers());
  let userId: string;
  try {
    const authResult = await requireAuth({ headers: requestHeaders });
    userId = authResult.userId;
  } catch {
    return { error: { form: "Not authenticated" } };
  }

  const validatedFields = NotificationSettingsSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: { form: "Invalid fields provided." } };
  }

  try {
    await db
      .insert(userProfile)
      .values({ id: userId, notifications: validatedFields.data })
      .onConflictDoUpdate({
        target: userProfile.id,
        set: { notifications: validatedFields.data },
      });
    return { success: true, message: "Notification settings updated successfully" };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function enable2FAAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const password = formData.get("password") as string;
  if (!password) {
    return { error: { form: "Password is required." } };
  }

  try {
    const requestHeaders: Headers = new Headers(await headers());
    let userId: string;
    try {
      const authResult = await requireAuth({ headers: requestHeaders });
      userId = authResult.userId;
    } catch {
      return { error: { form: "Not authenticated" } };
    }
    const res = await fetch(new URL("/api/auth/two-factor/enable", env.NEXT_PUBLIC_APP_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: requestHeaders.get("Cookie") || "",
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: { form: data.error?.message || "Failed to enable 2FA." } };
    }

    const auditContext = getAuditRequestContext({ headers: requestHeaders });
    void writeAuditEvent({
      event: "2fa_enabled",
      actorUserId: userId,
      targetUserId: userId,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      metadata: {},
    });

    return {
      success: true,
      message: "2FA enabled successfully. Scan the QR code below.",
      qrCode: data.totpURI,
      secret: data.secret,
      backupCodes: data.backupCodes,
    };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function disable2FAAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const password: string = String(formData.get("password") ?? "").trim();
  if (!password) {
    return { error: { form: "Password is required." } };
  }
  const code: string = String(formData.get("code") ?? "").trim();
  const backupCode: string = String(formData.get("backupCode") ?? "").trim();
  const hasCode: boolean = code.length > 0;
  const hasBackupCode: boolean = backupCode.length > 0;
  if (hasCode && hasBackupCode) {
    return { error: { form: "Provide either a 2FA code or a backup code, not both." } };
  }
  const requestHeaders: Headers = new Headers(await headers());
  let userId: string;
  try {
    const authResult = await requireAuth({ headers: requestHeaders });
    userId = authResult.userId;
  } catch {
    return { error: { form: "Not authenticated" } };
  }
  const stepUpResult = await requireStepUp({
    headers: requestHeaders,
    userId,
    code,
    backupCode,
  });
  if (!stepUpResult.ok) {
    return { error: { form: stepUpResult.error } };
  }
  try {
    const res = await fetch(new URL("/api/auth/two-factor/disable", env.NEXT_PUBLIC_APP_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: requestHeaders.get("Cookie") || "",
      },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { error: { form: data.error?.message || "Failed to disable 2FA." } };
    }
    const auditContext = getAuditRequestContext({ headers: requestHeaders });
    void writeAuditEvent({
      event: "2fa_disabled",
      actorUserId: userId,
      targetUserId: userId,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      metadata: {},
    });
    return { success: true, message: "2FA disabled successfully" };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function generateBackupCodesAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  try {
    const password = String(formData.get("password") ?? "").trim();
    if (!password) {
      return { error: { form: "Password is required." } };
    }
    const res = await fetch(new URL("/api/auth/two-factor/regenerate-backup-codes", env.NEXT_PUBLIC_APP_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await headers()).get("Cookie") || "",
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: { form: data.error?.message || "Failed to generate backup codes." } };
    }

    return {
      success: true,
      message: "New backup codes generated. Please save them in a safe place.",
      backupCodes: data.backupCodes,
    };
  } catch {
    return { error: { form: "An unexpected error occurred." } };
  }
}

export async function uploadAvatarAction(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const file = formData.get("avatar") as File;

  if (!file || file.size === 0) {
    return { error: { form: "Please select a file to upload." } };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: { form: "File size must be less than 5MB" } };
  }

  if (!file.type.startsWith("image/")) {
    return { error: { form: "File must be an image" } };
  }

  try {
    // This is a placeholder for your file upload logic.
    // You would typically upload the file to a service like S3, Cloudinary, etc.
    // and then update the user's avatar URL in the database.
    console.log("Uploading avatar:", file.name);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, message: "Avatar uploaded successfully" };
  } catch {
    return { error: { form: "Failed to upload avatar." } };
  }
}
