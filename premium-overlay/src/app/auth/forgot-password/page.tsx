"use client"

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { forgotPasswordAction, type FormState } from "@/actions/forgot-password";
import { useActionState } from "react";

export default function ForgotPasswordPage() {
  const initialState: FormState = {};
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);

  if (state.message) {
    return (
      <AuthCard
        title="Check your email"
        description="We've sent a password reset link to your email address"
      >
        <FormMessage state={state} />
        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email address and we'll send you a reset link"
    >
      <form action={formAction} className="space-y-4">
        <FormMessage state={state} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Enter your email" required autoComplete="email" inputMode="email" />
        </div>
        <SubmitButton className="w-full">Send reset link</SubmitButton>
      </form>
      <div className="text-center">
        <Link href="/auth/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
