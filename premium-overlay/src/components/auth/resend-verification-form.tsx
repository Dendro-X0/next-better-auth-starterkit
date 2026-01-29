"use client";

import { useActionState } from "react";
import type { ResendVerificationState } from "@/actions/resend-verification";
import { resendVerification } from "@/actions/resend-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useFormStatus } from "react-dom";
import { FormMessage } from "@/components/auth/form-message";

export function ResendVerificationForm(): React.ReactElement {
  const [state, action] = useActionState(resendVerification, {} as ResendVerificationState);
  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-sm font-medium">Didn&apos;t receive the verification email?</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Enter your email address and we&apos;ll send a new verification link.
      </p>
      <form action={action} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="resend_email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="resend_email"
              name="resend_email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              autoComplete="username"
              required
            />
          </div>
        </div>
        <FormMessage state={state ? { message: state.success, error: state.error ? { message: state.error } : undefined } : null} />
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

function SubmitButton(): React.ReactElement {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending} aria-label="Resend verification email">
      {pending ? "Sending..." : "Resend verification"}
    </Button>
  );
}

