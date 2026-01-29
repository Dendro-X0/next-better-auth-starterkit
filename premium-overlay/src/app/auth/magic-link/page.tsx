"use client"

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { sendMagicLinkAction } from "@/actions/magic-link";

export default function MagicLinkPage() {
  const [state, formAction] = useActionState(sendMagicLinkAction, null);

  if (state?.success && state.message) {
    return (
      <AuthCard
        title="Check your email"
        description="We've sent a magic link to your email address"
      >
        <FormMessage state={state} />
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Click the link in your email to sign in instantly
          </p>
          <Link href="/auth/login" className="text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Sign in with magic link"
      description="Enter your email to receive a secure sign-in link"
    >
      <form action={formAction} className="space-y-4">
        <FormMessage state={state} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Enter your email" required autoComplete="email" inputMode="email" />
        </div>
        <SubmitButton className="w-full">Send magic link</SubmitButton>
      </form>
      <div className="text-center">
        <Link href="/auth/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
