import type { EmailMessage } from "@/lib/email/email-message";

import { renderEmailLayout } from "@/lib/email/templates/render-email-layout";

type BuildVerificationEmailParams = Readonly<{ name: string | null; url: string }>;

function buildVerificationEmail(params: BuildVerificationEmailParams): EmailMessage {
  const subject: string = "Verify your email";
  const nameLabel: string = params.name ?? "there";
  const bodyHtml: string = `<h1 style=\"margin:0 0 12px;font-size:20px;\">Verify your email</h1><p style=\"margin:0 0 12px;\">Hello ${nameLabel},</p><p style=\"margin:0 0 16px;\">Please verify your email by clicking the button below:</p><p style=\"margin:0 0 16px;\"><a href=\"${params.url}\" style=\"display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;\">Verify email</a></p><p style=\"margin:0;\">Or copy and paste this URL:</p><p style=\"margin:8px 0 0;word-break:break-all;\"><a href=\"${params.url}\">${params.url}</a></p>`;
  const html: string = renderEmailLayout({ title: subject, bodyHtml });
  const text: string = `Hello ${nameLabel},\n\nVerify your email: ${params.url}`;
  return { subject, html, text };
}

export { buildVerificationEmail };
