import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Understand how we handle your data in this starter kit.",
};

export default function PrivacyPage(): React.ReactElement {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">
        This is a demo privacy policy page for the Next.js Better Auth Starterkit. Replace this
        content with your organization’s policy before launching to production.
      </p>
      <h2 className="text-xl font-semibold mb-2">What we collect</h2>
      <p className="mb-4">Basic account information such as email and name used for authentication.</p>
      <h2 className="text-xl font-semibold mb-2">How we use data</h2>
      <p className="mb-4">To provide authentication features like login, password reset, and 2FA.</p>
      <h2 className="text-xl font-semibold mb-2">Contact</h2>
      <p>If you have questions, update this page with your contact details.</p>
    </section>
  );
}
