"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { verifyMagicLinkAction, type FormState } from "@/actions/verify-magic-link";
import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";

/**
 * Client component that reads the token from the URL and submits the verification action.
 */
export default function VerifyMagicLinkClient(): React.JSX.Element {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmittedRef = useRef<boolean>(false);
  const [state, formAction, isPending] = useActionState(verifyMagicLinkAction, {} as FormState);
  const hasResult: boolean = Object.keys(state ?? {}).length > 0;

  useEffect(() => {
    if (!token || hasSubmittedRef.current) {
      return;
    }
    hasSubmittedRef.current = true;
    formRef.current?.requestSubmit();
  }, [token]);
  if (!token) {
    return (
      <AuthCard title="Invalid Link" description="This magic link is invalid or has expired.">
        <div className="text-center">
          <Link href="/auth/magic-link" className="text-sm text-primary hover:underline">
            Request a new link
          </Link>
        </div>
      </AuthCard>
    );
  }
  if (!hasResult || isPending) {
    return (
      <AuthCard title="Verifying..." description="Please wait while we verify your magic link.">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <form ref={formRef} action={formAction} className="hidden">
          <input type="hidden" name="token" value={token} />
          <FormMessage state={state} />
          {isPending && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </form>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Verification Failed" description="This magic link is invalid or has expired.">
      <FormMessage state={state} />
      <div className="mt-6 text-center">
        <Link href="/auth/magic-link" className="text-sm text-primary hover:underline">
          Request a new link
        </Link>
      </div>
    </AuthCard>
  );
}
