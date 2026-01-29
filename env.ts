import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    /**
     * PostgreSQL database URL. For CI/build without envs, we default to a local placeholder.
     * pg.Pool does not establish a connection until the first query, so this default
     * allows builds to succeed while still failing fast at runtime when the DB is actually used.
     */
    DATABASE_URL: z
      .string()
      .url()
      .default("postgresql://postgres:postgres@localhost:5432/postgres"),
    /** Secret for Better Auth. Defaults to a dev-safe value so builds can pass. */
    BETTER_AUTH_SECRET: z.string().min(1).default("dev-better-auth-secret"),
    RESEND_API_KEY: z.string().optional(),
    /** Sender email. Optional; defaults to Resend's demo sender in email service. */
    EMAIL_FROM: z.string().optional(),
    MAIL_PROVIDER: z.enum(["RESEND", "SMTP"]).default("RESEND"),
    SMTP_HOST: z.string().default("localhost"),
    SMTP_PORT: z.coerce.number().default(1025),
    // Parse booleans safely from env strings ("true"/"false"/"1"/"0").
    SMTP_SECURE: z
      .preprocess((val) => {
        if (typeof val === "string") {
          const s = val.trim().toLowerCase();
          if (["1", "true", "yes", "on"].includes(s)) return true;
          if (["0", "false", "no", "off", ""].includes(s)) return false;
        }
        return val;
      }, z.boolean())
      .default(false),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    // OAuth credentials default to placeholders to avoid failing builds.
    GOOGLE_CLIENT_ID: z.string().min(1).default("test-google-client-id"),
    GOOGLE_CLIENT_SECRET: z.string().min(1).default("test-google-client-secret"),
    GITHUB_CLIENT_ID: z.string().min(1).default("test-github-client-id"),
    GITHUB_CLIENT_SECRET: z.string().min(1).default("test-github-client-secret"),
    // Pro features
    SMS_PROVIDER: z.enum(["CONSOLE", "TWILIO"]).default("CONSOLE"),
    TWILIO_ACCOUNT_SID: z.string().min(1).default("test-twilio-account-sid"),
    TWILIO_AUTH_TOKEN: z.string().min(1).default("test-twilio-auth-token"),
    TWILIO_FROM_NUMBER: z.string().min(1).default("+10000000000"),
    PREMIUM_PLAN: z.enum(["free", "pro"]).default("free"),
    AUTH_GUARD_MODE: z.enum(["strict", "off"]).default("strict"),
    AUTH_DEV_USER_ID: z.string().min(1).default("dev-user"),
    AUTH_DEV_USER_EMAIL: z.string().email().default("dev@example.com"),
    AUTH_DEV_USER_NAME: z.string().min(1).default("Dev User"),
    // Optional: Upstash Redis for distributed rate limiting
    UPSTASH_REDIS_URL: z.string().url().optional(),
    UPSTASH_REDIS_TOKEN: z.string().min(1).optional(),
  },
  client: {
    /** Public app URL. Default to localhost so builds do not fail. */
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    MAIL_PROVIDER: process.env.MAIL_PROVIDER,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
    UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,
    SMS_PROVIDER: process.env.SMS_PROVIDER,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
    PREMIUM_PLAN: process.env.PREMIUM_PLAN,
    AUTH_GUARD_MODE: process.env.AUTH_GUARD_MODE,
    AUTH_DEV_USER_ID: process.env.AUTH_DEV_USER_ID,
    AUTH_DEV_USER_EMAIL: process.env.AUTH_DEV_USER_EMAIL,
    AUTH_DEV_USER_NAME: process.env.AUTH_DEV_USER_NAME,
  },
});
