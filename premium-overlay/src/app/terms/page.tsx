import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Usage terms for the Next.js Better Auth Starterkit demo site.",
};

export default function TermsPage(): React.ReactElement {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">
        This page provides example terms for demonstration purposes only. Replace this
        content with your organization&quot;s terms prior to production use.
      </p>
      <h2 className="text-xl font-semibold mb-2">Acceptable Use</h2>
      <p className="mb-4">Use this application responsibly and comply with applicable laws.</p>
      <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
      <p className="mb-4">This starter is provided &quot;as is&quot; without warranty. Use at your own risk.</p>
      <h2 className="text-xl font-semibold mb-2">Contact</h2>
      <p>Update this section with your company&quot;s contact details.</p>
    </section>
  );
}
