"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { signupAction, type SignupFormState } from "@/actions/signup";
import { AuthCard } from "@/components/auth/auth-card";
import { FieldMessage } from "@/components/auth/field-message";
import { FormMessage } from "@/components/auth/form-message";
import { SocialLogin } from "@/components/auth/social-login";
import { SubmitButton } from "@/components/auth/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";

export default function SignupPage() {
  const [state, formAction] = useActionState(signupAction, {} as SignupFormState);
  const [password, setPassword] = useState("");

  return (
    <AuthCard title="Create an account" description="Enter your details to get started">
      <form noValidate action={formAction} className="space-y-4">
        <FormMessage state={state} />
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" type="text" placeholder="Choose a username" autoComplete="username" />
          <FieldMessage messages={state.error?.fields?.username} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Enter your email" autoComplete="email" inputMode="email" />
          <FieldMessage messages={state.error?.fields?.email} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && <PasswordStrengthIndicator password={password} />}
          <FieldMessage messages={state.error?.fields?.password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
          <FieldMessage messages={state.error?.fields?.confirmPassword} />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="agreeToTerms" name="agreeToTerms" />
          <div>
            <Label htmlFor="agreeToTerms" className="text-sm">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
        </div>

        <SubmitButton className="w-full">Create account</SubmitButton>
      </form>

      <SocialLogin />

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
