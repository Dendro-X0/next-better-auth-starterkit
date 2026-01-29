import "server-only";
import { env } from "~/env";
import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";

import type { EmailAdapter } from "@/lib/email/email-adapter";
import type { EmailSendRequest } from "@/lib/email/email-send-request";
import type { EmailMessage } from "@/lib/email/email-message";
import { buildMagicLinkEmail } from "@/lib/email/templates/magic-link-email";
import { buildResetPasswordEmail } from "@/lib/email/templates/reset-password-email";
import { buildVerificationEmail } from "@/lib/email/templates/verification-email";

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
  send(payload: EmailSendRequest): Promise<void>;
  sendVerificationEmail(payload: VerificationEmailPayload): Promise<void>;
  sendMagicLinkEmail(payload: MagicLinkEmailPayload): Promise<void>;
  sendResetPasswordEmail(payload: ResetPasswordEmailPayload): Promise<void>;
}

type ResetPasswordEmailPayload = Readonly<{
  email: string;
  url: string;
  name: string;
}>;

function createResendAdapter(params: Readonly<{ from: string; apiKey: string }>): EmailAdapter {
  const resend = new Resend(params.apiKey);
  return {
    async send(request: EmailSendRequest): Promise<void> {
      const res = await resend.emails.send({
        from: params.from,
        to: request.to,
        subject: request.subject,
        html: request.html,
        text: request.text,
      });
      if (res.error) {
        throw new Error(`Resend error: ${res.error.message}`);
      }
    },
  };
}

function createSmtpAdapter(params: Readonly<{ from: string }>): EmailAdapter {
  const transporter: Transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return {
    async send(request: EmailSendRequest): Promise<void> {
      await transporter.sendMail({
        from: params.from,
        to: request.to,
        subject: request.subject,
        html: request.html,
        text: request.text,
      });
    },
  };
}

/**
 * Email service with provider selection via env:
 * - RESEND (requires RESEND_API_KEY)
 * - SMTP (Mailhog in dev)
 */
function createEmailService(): EmailService {
  const from: string = env.EMAIL_FROM ?? "onboarding@resend.dev";

  const adapter: EmailAdapter =
    env.MAIL_PROVIDER === "RESEND" && env.RESEND_API_KEY
      ? createResendAdapter({ from, apiKey: env.RESEND_API_KEY })
      : createSmtpAdapter({ from });

  return {
    async send(payload: EmailSendRequest): Promise<void> {
      await adapter.send(payload);
    },
    async sendVerificationEmail(payload: VerificationEmailPayload): Promise<void> {
      const message: EmailMessage = buildVerificationEmail({ name: payload.name ?? null, url: payload.url });
      await adapter.send({ to: payload.email, subject: message.subject, html: message.html, text: message.text });
    },
    async sendMagicLinkEmail(payload: MagicLinkEmailPayload): Promise<void> {
      const message: EmailMessage = buildMagicLinkEmail({ url: payload.url });
      await adapter.send({ to: payload.email, subject: message.subject, html: message.html, text: message.text });
    },
    async sendResetPasswordEmail(payload: ResetPasswordEmailPayload): Promise<void> {
      const message: EmailMessage = buildResetPasswordEmail({ name: payload.name, url: payload.url });
      await adapter.send({ to: payload.email, subject: message.subject, html: message.html, text: message.text });
    },
  };
}

export const emailService: EmailService = createEmailService();
