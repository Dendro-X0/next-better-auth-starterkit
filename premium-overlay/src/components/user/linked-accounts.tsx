"use client";

import type React from "react";
import { useActionState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import toastUtils from "@/lib/ui/toast";
import { linkProviderAction } from "@/actions/link-provider";
import { unlinkProviderAction } from "@/actions/unlink-provider";
import type { LinkedAccount } from "@/lib/types/linked-account";

type ProviderRow = Readonly<{
  providerId: "google" | "github";
  label: string;
}>;

const PROVIDERS: ReadonlyArray<ProviderRow> = [
  { providerId: "google", label: "Google" },
  { providerId: "github", label: "GitHub" },
] as const;

type LinkedAccountsProps = Readonly<{ accounts: ReadonlyArray<LinkedAccount> }>;

function isProviderLinked(params: Readonly<{ accounts: ReadonlyArray<LinkedAccount>; providerId: string }>): boolean {
  return params.accounts.some((a: LinkedAccount): boolean => a.providerId === params.providerId);
}

export function LinkedAccounts(props: LinkedAccountsProps): React.JSX.Element {
  const [linkState, linkAction] = useActionState(linkProviderAction, null);
  const [unlinkState, unlinkAction] = useActionState(unlinkProviderAction, null);
  useEffect(() => {
    toastUtils.fromFormState(unlinkState, "Provider unlinked.");
  }, [unlinkState]);
  useEffect(() => {
    toastUtils.fromFormState(linkState, "Redirecting to provider...");
  }, [linkState]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Accounts</CardTitle>
        <CardDescription>Connect or disconnect sign-in providers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormMessage state={unlinkState ?? linkState} />
        <div className="space-y-3">
          {PROVIDERS.map((p: ProviderRow): React.JSX.Element => {
            const linked: boolean = isProviderLinked({ accounts: props.accounts, providerId: p.providerId });
            return (
              <div key={p.providerId} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{p.label}</div>
                  {linked ? <Badge variant="secondary">Linked</Badge> : <Badge variant="outline">Not linked</Badge>}
                </div>
                {linked ? (
                  <form action={unlinkAction}>
                    <input type="hidden" name="providerId" value={p.providerId} />
                    <SubmitButton variant="outline">Unlink</SubmitButton>
                  </form>
                ) : (
                  <form action={linkAction}>
                    <input type="hidden" name="provider" value={p.providerId} />
                    <SubmitButton>Link</SubmitButton>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
