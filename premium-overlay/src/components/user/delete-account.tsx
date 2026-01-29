"use client";

import type React from "react";
import { useActionState, useEffect, useState } from "react";

import { deleteAccountAction } from "@/actions/user";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toastUtils from "@/lib/ui/toast";

type DeleteAccountProps = Readonly<{
  hasPassword: boolean;
  twoFactorEnabled: boolean;
}>;

export function DeleteAccount(props: DeleteAccountProps): React.JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const [state, formAction] = useActionState(deleteAccountAction, null);
  const isDialogOpen: boolean = open && state?.success !== true;
  useEffect(() => {
    toastUtils.fromFormState(state, "Account deletion initiated.");
  }, [state]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>Permanently delete your account and all associated data.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Delete account
          </Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm account deletion</DialogTitle>
              <DialogDescription>This action is permanent. Type DELETE and confirm to continue.</DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <FormMessage state={state} />
              <div className="space-y-2">
                <Label htmlFor="confirm">Type DELETE</Label>
                <Input id="confirm" name="confirm" placeholder="DELETE" required />
              </div>
              {props.hasPassword ? (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" autoComplete="current-password" required />
                </div>
              ) : props.twoFactorEnabled ? (
                <div className="space-y-2">
                  <Label htmlFor="code">2FA Code</Label>
                  <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" />
                  <div className="text-xs text-muted-foreground">Or use a backup code:</div>
                  <Input id="backupCode" name="backupCode" autoCapitalize="off" autoCorrect="off" placeholder="Backup code" />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">If you signed in recently, you can delete without additional verification. Otherwise, sign in again and retry.</div>
              )}
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <SubmitButton variant="destructive">Confirm delete</SubmitButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
