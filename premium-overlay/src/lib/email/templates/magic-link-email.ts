import type { EmailMessage } from "@/lib/email/email-message";

import { renderEmailLayout } from "@/lib/email/templates/render-email-layout";

type BuildMagicLinkEmailParams = Readonly<{ url: string }>;

function buildMagicLinkEmail(params: BuildMagicLinkEmailParams): EmailMessage {
  const subject: string = "Your magic sign-in link";
  const bodyHtml: string = `<h1 style=\"margin:0 0 12px;font-size:20px;\">Sign in</h1><p style=\"margin:0 0 16px;\">Click the button below to sign in:</p><p style=\"margin:0 0 16px;\"><a href=\"${params.url}\" style=\"display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;\">Sign in</a></p><p style=\"margin:0;\">Or copy and paste this URL:</p><p style=\"margin:8px 0 0;word-break:break-all;\"><a href=\"${params.url}\">${params.url}</a></p>`;
  const html: string = renderEmailLayout({ title: subject, bodyHtml });
  const text: string = `Sign in: ${params.url}`;
  return { subject, html, text };
}

export { buildMagicLinkEmail };
