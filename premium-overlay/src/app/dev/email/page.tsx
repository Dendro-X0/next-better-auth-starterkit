import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

type TemplateLink = Readonly<{ slug: string; label: string }>;

const templates: readonly TemplateLink[] = [
  { slug: "verification", label: "Verification email" },
  { slug: "reset-password", label: "Reset password" },
  { slug: "magic-link", label: "Magic link" },
] as const;

export default function EmailTemplatesIndexPage(): ReactElement {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Email templates</h1>
      <p className="mt-2 text-sm text-muted-foreground">Development-only preview pages for the built-in templates.</p>
      <ul className="mt-6 space-y-2">
        {templates.map((t: TemplateLink) => (
          <li key={t.slug}>
            <Link className="text-primary underline" href={`/dev/email/${t.slug}`}>
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
