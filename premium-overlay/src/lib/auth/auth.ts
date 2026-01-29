import "server-only";

import { db } from "../db";
import * as schema from "../db/schema";
import { env } from "../../../env";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { phoneNumber, twoFactor, magicLink, username } from "better-auth/plugins";
import { emailService } from "../services/email";
import { smsService } from "../services/sms";

type ResetPasswordEmailUser = Readonly<{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
}>;

type ResetPasswordEmailParams = Readonly<{
  user: ResetPasswordEmailUser;
  url: string;
  token: string;
}>;

type TwoFactorOtpOptionsParams = Readonly<{ user: unknown; otp: string }>;

type PhoneNumberSendOtpParams = Readonly<{ phoneNumber: string; code?: string; otp?: string }>;

type UserPhoneFields = Readonly<{ phoneNumber?: unknown; phoneNumberVerified?: unknown }>;

function getUserPhoneFields(user: unknown): Readonly<{ phoneNumber: string | null; phoneNumberVerified: boolean }> {
  if (typeof user !== "object" || user === null) {
    return { phoneNumber: null, phoneNumberVerified: false };
  }
  const data: UserPhoneFields = user as UserPhoneFields;
  const phoneNumber: string | null = typeof data.phoneNumber === "string" ? data.phoneNumber : null;
  const phoneNumberVerified: boolean = typeof data.phoneNumberVerified === "boolean" ? data.phoneNumberVerified : false;
  return { phoneNumber, phoneNumberVerified };
}

async function sendSmsOtp(params: Readonly<{ phoneNumber: string; otp: string; purpose: string }>): Promise<void> {
  const message: string = `${params.purpose}: ${params.otp}`;
  await smsService.send({ to: params.phoneNumber, message });
}

export const auth = betterAuth({
  appName: "Starterkit Boilerplate",
  baseURL: env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  database: drizzleAdapter(db, { schema, provider: "pg" }),
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  user: {
    additionalFields: {
      onboardingComplete: {
        type: "boolean",
        required: false,
      },
    },
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async (
      params: ResetPasswordEmailParams,
      _request?: Request,
    ): Promise<void> => {
      void emailService.sendResetPasswordEmail({ email: params.user.email, url: params.url, name: params.user.name });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // If the first verification email was missed or failed, try again when the user signs in.
    sendOnSignIn: true,
    // Once verified, sign the user in automatically for a smoother flow.
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await emailService.sendVerificationEmail({ email: user.email, url, name: user.name as string });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      scope: ["email", "profile"],
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      scope: ["user:email"],
    },
  },
  plugins: [
    username(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await emailService.sendMagicLinkEmail({ email, url });
      },
    }),
    phoneNumber({
      sendOTP: async (params: PhoneNumberSendOtpParams): Promise<void> => {
        const otp: string = String(params.code ?? params.otp ?? "").trim();
        if (!otp) return;
        await sendSmsOtp({ phoneNumber: params.phoneNumber, otp, purpose: "Your phone verification code" });
      },
    }),
    twoFactor({
      otpOptions: {
        async sendOTP(params: TwoFactorOtpOptionsParams): Promise<void> {
          const fields = getUserPhoneFields(params.user);
          if (!fields.phoneNumber || !fields.phoneNumberVerified) {
            throw new Error("No verified phone number is set for this account.");
          }
          await sendSmsOtp({ phoneNumber: fields.phoneNumber, otp: params.otp, purpose: "Your sign-in code" });
        },
      },
    }),
    nextCookies(), // Must be last plugin for proper cookie handling
  ],
});
