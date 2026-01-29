"use client"

import { useActionState, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmitButton } from "@/components/auth/submit-button"
import { FormMessage } from "@/components/auth/form-message";
import { FieldMessage } from "@/components/auth/field-message";
import { changePasswordAction, setPasswordAction } from "@/actions/user"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import toastUtils from "@/lib/ui/toast"

export function PasswordForm({ hasPassword }: { hasPassword?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [changeState, changeAction] = useActionState(changePasswordAction, null);
  const [setState, setAction] = useActionState(setPasswordAction, null);
  const shouldShowStepUpFields: boolean =
    Boolean(hasPassword) && typeof changeState?.error?.form === "string" && changeState.error.form.toLowerCase().includes("2fa");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if ((changeState && "success" in changeState) || (setState && "success" in setState)) {
      formRef.current?.reset();
    }
  }, [changeState, setState]);

  useEffect(() => {
    toastUtils.fromFormState(changeState, "Password changed successfully.");
  }, [changeState]);

  useEffect(() => {
    toastUtils.fromFormState(setState, "Password set successfully.");
  }, [setState]);

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hasPassword ? "Change Password" : "Set Password"}</CardTitle>
        <CardDescription>
          {hasPassword
            ? "Update your password to keep your account secure."
            : "Set a password to log in with your email and password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormMessage state={hasPassword ? changeState : setState} />
        <form ref={formRef} id="password-form" action={hasPassword ? changeAction : setAction} className="space-y-4">
          {hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("current")}
                  aria-label={showPasswords.current ? "Hide password" : "Show password"}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <FieldMessage messages={changeState?.error?.fields?.currentPassword} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Enter your new password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("new")}
                aria-label={showPasswords.new ? "Hide password" : "Show password"}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <FieldMessage messages={hasPassword ? changeState?.error?.fields?.newPassword : setState?.error?.fields?.newPassword} />
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirm your new password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("confirm")}
                aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <FieldMessage messages={hasPassword ? changeState?.error?.fields?.confirmPassword : setState?.error?.fields?.confirmPassword} />
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
                <FieldMessage messages={changeState?.error?.fields?.code} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupCode">Backup Code</Label>
                <Input id="backupCode" name="backupCode" autoCapitalize="off" autoCorrect="off" placeholder="Backup code" />
                <FieldMessage messages={changeState?.error?.fields?.backupCode} />
              </div>
            </div>
          ) : null}

          <div className="flex justify-end">
            <SubmitButton>{hasPassword ? "Change Password" : "Set Password"}</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
