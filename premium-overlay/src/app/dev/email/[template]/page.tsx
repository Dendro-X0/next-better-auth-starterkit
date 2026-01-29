import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import type { EmailMessage } from "@/lib/email/email-message";
import { buildMagicLinkEmail } from "@/lib/email/templates/magic-link-email";
import { buildResetPasswordEmail } from "@/lib/email/templates/reset-password-email";
import { buildVerificationEmail } from "@/lib/email/templates/verification-email";

type PageParams = Readonly<{ params: Readonly<{ template: string }> }>;

type TemplateSlug = "verification" | "reset-password" | "magic-link";

function getTemplateMessage(params: Readonly<{ template: TemplateSlug }>): EmailMessage {
  const exampleUrl: string = "https://example.com";
  if (params.template === "verification") return buildVerificationEmail({ name: "Jane", url: exampleUrl });
  if (params.template === "reset-password") return buildResetPasswordEmail({ name: "Jane", url: exampleUrl });
  return buildMagicLinkEmail({ url: exampleUrl });
}

export default function EmailTemplatePreviewPage(props: PageParams): ReactElement {
  if (process.env.NODE_ENV === "production") notFound();
  const template: string = props.params.template;
  if (template !== "verification" && template !== "reset-password" && template !== "magic-link") notFound();
  const message: EmailMessage = getTemplateMessage({ template });
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Email template: {template}</h1>
      <div className="mt-6 rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Subject</div>
        <div className="mt-1 font-mono text-sm">{message.subject}</div>
      </div>
      <div className="mt-6 rounded-lg border">
        <div className="border-b p-4 text-sm text-muted-foreground">HTML preview</div>
        <div className="bg-white" dangerouslySetInnerHTML={{ __html: message.html }} />
      </div>
      <div className="mt-6 rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Text</div>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-sm">{message.text}</pre>
      </div>
    </main>
  );
}
