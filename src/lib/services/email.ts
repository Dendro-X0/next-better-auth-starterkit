import "server-only";
import { env } from "~/env";
import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";

type EmailPayload = Readonly<{
  to: string;
  subject: string;
  html: string;
  text?: string;
}>;

type VerificationEmailPayload = Readonly<{
  email: string;
  url: string;
  name?: string;
}>;

type MagicLinkEmailPayload = Readonly<{
  email: string;
  url: string;
}>;

interface EmailService {
  send(payload: EmailPayload): Promise<void>;
  sendVerificationEmail(payload: VerificationEmailPayload): Promise<void>;
  sendMagicLinkEmail(payload: MagicLinkEmailPayload): Promise<void>;
  sendPasswordResetEmail(payload: VerificationEmailPayload): Promise<void>;
}

/**
 * Email service with provider selection via env:
 * - RESEND (requires RESEND_API_KEY)
 * - SMTP (Mailhog in dev)
 */
function createEmailService(): EmailService {
  const from: string = env.EMAIL_FROM ?? "onboarding@resend.dev";

  if (env.MAIL_PROVIDER === "RESEND" && env.RESEND_API_KEY) {
    const resend = new Resend(env.RESEND_API_KEY);
    return {
      async send(payload: EmailPayload): Promise<void> {
        const res = await resend.emails.send({
          from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        });
        if (res.error) {
          throw new Error(`Resend error: ${res.error.message}`);
        }
      },
      async sendVerificationEmail({ email, url, name }: VerificationEmailPayload): Promise<void> {
        const subject = "Verify your email";
        const html = `<p>Hello ${name ?? "there"},</p><p>Please verify your email by clicking the link below:</p><p><a href="${url}">Verify Email</a></p>`;
        await this.send({ to: email, subject, html, text: `Verify your email: ${url}` });
      },
      async sendMagicLinkEmail({ email, url }: MagicLinkEmailPayload): Promise<void> {
        const subject = "Your magic sign-in link";
        const html = `<p>Click the link below to sign in:</p><p><a href="${url}">Sign in</a></p>`;
        await this.send({ to: email, subject, html, text: `Sign in: ${url}` });
      },
      async sendPasswordResetEmail({ email, url, name }: VerificationEmailPayload): Promise<void> {
        const subject = "Reset your password";
        const html = `<p>Hello ${name ?? "there"},</p><p>Please reset your password by clicking the link below:</p><p><a href="${url}">Reset Password</a></p>`;
        await this.send({ to: email, subject, html, text: `Reset your password: ${url}` });
      },
    };
  }

  // Default to SMTP
  const transporter: Transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  return {
    async send(payload: EmailPayload): Promise<void> {
      await transporter.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });
    },
    async sendVerificationEmail({ email, url, name }: VerificationEmailPayload): Promise<void> {
      const subject = "Verify your email";
      const html = `<p>Hello ${name ?? "there"},</p><p>Please verify your email by clicking the link below:</p><p><a href="${url}">Verify Email</a></p>`;
      await this.send({ to: email, subject, html, text: `Verify your email: ${url}` });
    },
    async sendMagicLinkEmail({ email, url }: MagicLinkEmailPayload): Promise<void> {
      const subject = "Your magic sign-in link";
      const html = `<p>Click the link below to sign in:</p><p><a href="${url}">Sign in</a></p>`;
      await this.send({ to: email, subject, html, text: `Sign in: ${url}` });
    },
    async sendPasswordResetEmail({ email, url, name }: VerificationEmailPayload): Promise<void> {
      const subject = "Reset your password";
      const html = `<p>Hello ${name ?? "there"},</p><p>Please reset your password by clicking the link below:</p><p><a href="${url}">Reset Password</a></p>`;
      await this.send({ to: email, subject, html, text: `Reset your password: ${url}` });
    },
  };
}

export const emailService: EmailService = createEmailService();
