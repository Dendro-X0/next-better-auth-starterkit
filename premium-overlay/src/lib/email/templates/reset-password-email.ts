import type { EmailMessage } from "@/lib/email/email-message";

import { renderEmailLayout } from "@/lib/email/templates/render-email-layout";

type BuildResetPasswordEmailParams = Readonly<{ name: string; url: string }>;

function buildResetPasswordEmail(params: BuildResetPasswordEmailParams): EmailMessage {
  const subject: string = "Reset your password";
  const bodyHtml: string = `<h1 style=\"margin:0 0 12px;font-size:20px;\">Reset your password</h1><p style=\"margin:0 0 12px;\">Hello ${params.name},</p><p style=\"margin:0 0 16px;\">Click the button below to reset your password:</p><p style=\"margin:0 0 16px;\"><a href=\"${params.url}\" style=\"display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;\">Reset password</a></p><p style=\"margin:0;\">Or copy and paste this URL:</p><p style=\"margin:8px 0 0;word-break:break-all;\"><a href=\"${params.url}\">${params.url}</a></p>`;
  const html: string = renderEmailLayout({ title: subject, bodyHtml });
  const text: string = `Hello ${params.name},\n\nReset your password: ${params.url}`;
  return { subject, html, text };
}

export { buildResetPasswordEmail };
