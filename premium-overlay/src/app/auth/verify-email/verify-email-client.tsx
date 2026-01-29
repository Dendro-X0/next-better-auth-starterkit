"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { verifyEmailAction } from "@/actions/verify-email";
import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";

type VerifyEmailState = Awaited<ReturnType<typeof verifyEmailAction>>;

type VerifyEmailActionState = Readonly<[
  state: VerifyEmailState,
  action: (payload: FormData) => void,
  isPending: boolean,
]>;

export default function VerifyEmailClient(): React.JSX.Element {
  const searchParams = useSearchParams();
  const token: string | null = searchParams.get("token");
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmittedRef = useRef<boolean>(false);
  const [state, formAction, isPending] = useActionState(verifyEmailAction, {} as VerifyEmailState) as VerifyEmailActionState;
  const hasResult: boolean = Object.keys(state ?? {}).length > 0;
  useEffect((): void => {
    if (!token || hasSubmittedRef.current) {
      return;
    }
    hasSubmittedRef.current = true;
    formRef.current?.requestSubmit();
  }, [token]);
  if (!token) {
    return (
      <AuthCard title="Invalid Link" description="This email verification link is invalid or has expired.">
        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }
  if (!hasResult || isPending) {
    return (
      <AuthCard title="Verifying..." description="Please wait while we verify your email address.">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <form ref={formRef} action={formAction} className="hidden">
          <input type="hidden" name="token" value={token} />
          <FormMessage state={state} />
        </form>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Verification Failed" description="This email verification link is invalid or has expired.">
      <FormMessage state={state} />
      <div className="mt-6 text-center">
        <Link href="/auth/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
