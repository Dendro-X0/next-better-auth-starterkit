import type { EmailSendRequest } from "@/lib/email/email-send-request";

/**
 * Provider-agnostic interface for sending emails.
 *
 * Implementations can wrap providers like Resend, Nodemailer (SMTP), Postmark, or Mailgun.
 */
interface EmailAdapter {
  send(request: EmailSendRequest): Promise<void>;
}

export type { EmailAdapter };
