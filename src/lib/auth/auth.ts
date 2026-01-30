import { db } from "../db";
import * as schema from "../db/schema";
import { env } from "../../../env";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor, magicLink, username } from "better-auth/plugins";
import { emailService } from "../services/email";

export const auth = betterAuth({
  appName: "Starterkit Boilerplate",
  baseURL: env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  database: drizzleAdapter(db, { schema, provider: "pg" }),
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  user: {
    additionalFields: {
      onboardingComplete: {
        type: "boolean",
        required: false,
        default: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await emailService.sendPasswordResetEmail({ email: user.email, url, name: user.name as string });
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
    twoFactor(),
    nextCookies(), // Must be last plugin for proper cookie handling
  ],
});
