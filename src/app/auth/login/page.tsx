"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation";
import { useActionState, Suspense } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthCard } from "@/components/auth/auth-card"
import { SocialLogin } from "@/components/auth/social-login"
import { SubmitButton } from "@/components/auth/submit-button"
import { FieldMessage } from "@/components/auth/field-message";
import { FormMessage } from "@/components/auth/form-message";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";

import { loginAction, type LoginFormState } from "@/actions/login";

function LoginContent() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  const initialState: LoginFormState = {};
  const [state, formAction] = useActionState(loginAction, initialState);

  const formMessageState = urlError
    ? { error: { message: urlError } }
    : urlMessage
    ? { message: urlMessage }
    : state;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or Username</Label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            placeholder="name@example.com or johndoe"
            autoComplete="username"
            inputMode="text"
            required
          />
          <FieldMessage messages={state?.error?.fields?.identifier} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-sm font-medium text-primary underline underline-offset-2">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <FieldMessage messages={state?.error?.fields?.password} />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="remember" name="remember" />
          <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Remember me
          </Label>
        </div>

        <FormMessage state={formMessageState} />
        <SubmitButton className="w-full">
          Sign in
        </SubmitButton>
      </form>

      <SocialLogin />

      <ResendVerificationForm />

      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-primary underline underline-offset-2">
          Sign up
        </Link>
      </div>
    </div>
  );
}

function LoginForm() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

export default function LoginPage() {
  return (
    <AuthCard title="Sign in to your account" description="Enter your email and password below">
      <LoginForm />
    </AuthCard>
  );
}
