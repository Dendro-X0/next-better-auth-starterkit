"use client";

import type React from "react";
import { useActionState, useEffect, useRef, useState } from "react";

import { changeEmailAction } from "@/actions/user";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toastUtils from "@/lib/ui/toast";
import type { FormState } from "@/lib/types/actions";

type ChangeEmailProps = Readonly<{
  currentEmail: string;
}>;

export function ChangeEmail(props: ChangeEmailProps): React.JSX.Element {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState<boolean>(false);
  const [state, formAction] = useActionState(changeEmailAction, null as FormState | null);
  const effectiveRevokeOtherSessions: boolean = state?.success ? false : revokeOtherSessions;
  const shouldShowStepUpFields: boolean =
    typeof state?.error?.form === "string" && state.error.form.toLowerCase().includes("2fa");
  useEffect(() => {
    toastUtils.fromFormState(state, "Email change requested. Check your inbox.");
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Email</CardTitle>
        <CardDescription>Send a verification link to your new email address.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormMessage state={state} />
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="revokeOtherSessions" value={String(effectiveRevokeOtherSessions)} />
          <div className="space-y-2">
            <Label>Current Email</Label>
            <Input value={props.currentEmail} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email</Label>
            <Input id="newEmail" name="newEmail" type="email" placeholder="new@email.com" required />
          </div>
          {shouldShowStepUpFields ? (
            <div className="space-y-3 rounded-md border p-3">
              <div className="text-sm font-medium">Step-up verification</div>
              <div className="text-xs text-muted-foreground">
                For sensitive changes, please provide either a 2FA code or a backup code.
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">2FA Code</Label>
                <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupCode">Backup Code</Label>
                <Input id="backupCode" name="backupCode" autoCapitalize="off" autoCorrect="off" placeholder="Backup code" />
              </div>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <Checkbox
              id="revokeOtherSessions"
              checked={effectiveRevokeOtherSessions}
              onCheckedChange={(checked: boolean | "indeterminate") => setRevokeOtherSessions(checked === true)}
            />
            <Label htmlFor="revokeOtherSessions">Sign out from other devices after requesting the change</Label>
          </div>
          <div className="flex justify-end">
            <SubmitButton>Send verification email</SubmitButton>
          </div>
        </form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Your email will only be updated after you verify the link sent to the new address.
      </CardFooter>
    </Card>
  );
}
