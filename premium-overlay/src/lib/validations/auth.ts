import { z } from "zod";

export const LoginSchema = z.object({
  identifier: z
    .string()
    .min(3, { message: "Please enter your email or username." })
    .max(100, { message: "Identifier is too long." })
    .refine(
      (val) => {
        const isEmail = /.+@.+\..+/.test(val);
        const isUsername = /^[a-zA-Z0-9._-]{3,30}$/.test(val);
        return isEmail || isUsername;
      },
      { message: "Enter a valid email or username." },
    ),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export const SignupSchema = z
  .object({
    name: z.string().min(3, {
      message: "Name must be at least 3 characters long.",
    }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long." })
      .max(30, { message: "Username must be at most 30 characters long." })
      .regex(/^[a-zA-Z0-9._-]+$/, {
        message: "Username can only contain letters, numbers, dots, underscores, and hyphens.",
      }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirmPassword: z.string(),
    // Accept HTML form checkbox values ("on") as true, or boolean true.
    // Using union+transform avoids z.coerce.boolean() pitfalls with "on".
    agreeToTerms: z
      .union([z.literal("on"), z.boolean()])
      .transform((v) => (v === "on" ? true : v))
      .refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const PhoneNumberSendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(8, { message: "Phone number is required." })
    .max(20, { message: "Phone number is too long." })
    .regex(/^\+\d{7,19}$/, { message: "Phone number must be in E.164 format (e.g. +1234567890)." }),
});

export const PhoneNumberVerifySchema = z.object({
  phoneNumber: PhoneNumberSendOtpSchema.shape.phoneNumber,
  code: z
    .string()
    .trim()
    .min(4, { message: "Verification code is required." })
    .max(12, { message: "Verification code is too long." }),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address."),
});

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
    token: z.string().min(1, "Reset token is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const MagicLinkSchema = z.object({
  email: z.string().email("Invalid email address."),
});

export const Verify2FASchema = z
  .object({
    method: z.enum(["totp", "sms", "backup"]).default("totp"),
    code: z.string().trim().optional(),
    backupCode: z.string().trim().optional(),
    rememberDevice: z.string().optional(), // 'on' or undefined
  })
  .superRefine((data, ctx) => {
    const hasCode: boolean = Boolean(data.code && data.code.length > 0);
    const hasBackupCode: boolean = Boolean(data.backupCode && data.backupCode.length > 0);

    if (data.method === "backup") {
      if (hasCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Use the backup code field for this method.",
          path: ["code"],
        });
      }
      if (!hasBackupCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Backup code is required.",
          path: ["backupCode"],
        });
      }
      return;
    }

    if (hasBackupCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use the verification code field for this method.",
        path: ["backupCode"],
      });
    }
    if (!hasCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Verification code is required.",
        path: ["code"],
      });
      return;
    }
    if (!/^\d{6}$/.test(String(data.code))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Code must be a 6-digit number.",
        path: ["code"],
      });
    }
  });

export const ProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  username: z.string().min(3, "Username must be at least 3 characters long."),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  location: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal('')),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
    code: z.string().trim().optional(),
    backupCode: z.string().trim().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    const hasCode: boolean = Boolean(data.code && data.code.length > 0);
    const hasBackupCode: boolean = Boolean(data.backupCode && data.backupCode.length > 0);
    if (hasCode && hasBackupCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either a 2FA code or a backup code, not both.",
        path: ["code"],
      });
    }
    if (hasCode && !/^\d{6}$/.test(String(data.code))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "2FA code must be a 6-digit number.",
        path: ["code"],
      });
    }
  });

export const ChangeEmailSchema = z
  .object({
    newEmail: z.string().email({ message: "Please enter a valid email address." }),
    revokeOtherSessions: z
      .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
      .optional()
      .transform((v) => (v === "on" || v === "true" || v === true ? true : false)),
    code: z.string().trim().optional(),
    backupCode: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const hasCode: boolean = Boolean(data.code && data.code.length > 0);
    const hasBackupCode: boolean = Boolean(data.backupCode && data.backupCode.length > 0);
    if (hasCode && hasBackupCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either a 2FA code or a backup code, not both.",
        path: ["code"],
      });
    }
    if (hasCode && !/^\d{6}$/.test(String(data.code))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "2FA code must be a 6-digit number.",
        path: ["code"],
      });
    }
  });

export const DeleteAccountSchema = z
  .object({
    confirm: z.string().trim().min(1, { message: "Please type DELETE to confirm." }),
    password: z.string().trim().optional(),
    code: z.string().trim().optional(),
    backupCode: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.confirm !== "DELETE") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Confirmation must be DELETE.", path: ["confirm"] });
    }
    const hasCode: boolean = Boolean(data.code && data.code.length > 0);
    const hasBackupCode: boolean = Boolean(data.backupCode && data.backupCode.length > 0);
    if (hasCode && hasBackupCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Provide either a 2FA code or a backup code, not both.", path: ["code"] });
    }
    if (hasCode && !/^\d{6}$/.test(String(data.code))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "2FA code must be a 6-digit number.", path: ["code"] });
    }
  });

export const NotificationSettingsSchema = z
  .object({
    email: z
      .object({
        security: z.coerce.boolean().default(false),
        marketing: z.coerce.boolean().default(false),
        updates: z.coerce.boolean().default(false),
      })
      .default({ security: false, marketing: false, updates: false }),
    push: z
      .object({
        security: z.coerce.boolean().default(false),
        mentions: z.coerce.boolean().default(false),
        updates: z.coerce.boolean().default(false),
      })
      .default({ security: false, mentions: false, updates: false }),
  })
  .default({
    email: { security: false, marketing: false, updates: false },
    push: { security: false, mentions: false, updates: false },
  });

export const PrivacySettingsSchema = z.object({
  profileVisibility: z.enum(["public", "private"]).default("public"),
  showEmail: z.coerce.boolean().default(false),
  showLocation: z.coerce.boolean().default(true),
});

