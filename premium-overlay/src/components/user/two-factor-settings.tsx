"use client"

import { useActionState, useState, useEffect } from "react"
import Image from "next/image"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormMessage } from "@/components/auth/form-message"
import { SubmitButton } from "@/components/auth/submit-button"
import { enable2FAAction, disable2FAAction, generateBackupCodesAction } from "@/actions/user"
import { Shield, ShieldCheck, Download, RefreshCw, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TwoFactorSettingsProps {
  isEnabled: boolean
  backupCodes?: string[]
}

type PasswordDialogMode = "enable" | "disable" | "regenerate";

export function TwoFactorSettings({
  isEnabled: initialEnabled,
  backupCodes: initialBackupCodes,
}: TwoFactorSettingsProps) {
  // Component UI state
  const [passwordDialogMode, setPasswordDialogMode] = useState<PasswordDialogMode | null>(null)
  const [qrSvg, setQrSvg] = useState<string>("")
  // Action states
  const [enable2FAState, enable2FAFormAction] = useActionState(enable2FAAction, null);
  const [disable2FAState, disable2FAFormAction] = useActionState(disable2FAAction, null);
  const [generateCodesState, generateCodesFormAction] = useActionState(generateBackupCodesAction, null);

  // Derived state from server actions
  const isEnabled: boolean = disable2FAState?.success
    ? false
    : enable2FAState?.success
      ? true
      : initialEnabled

  const backupCodes: string[] = generateCodesState?.backupCodes
    || enable2FAState?.backupCodes
    || initialBackupCodes
    || []

  const qrCode: string = enable2FAState?.qrCode || ""

  const closePasswordDialog = (): void => {
    setPasswordDialogMode(null)
  }

  const openPasswordDialog = (mode: PasswordDialogMode): void => {
    setPasswordDialogMode(mode)
  }

  const passwordDialogAction =
    passwordDialogMode === "enable"
      ? enable2FAFormAction
      : passwordDialogMode === "disable"
        ? disable2FAFormAction
        : generateCodesFormAction

  const passwordDialogState =
    passwordDialogMode === "enable"
      ? enable2FAState
      : passwordDialogMode === "disable"
        ? disable2FAState
        : generateCodesState

  const shouldShowDisableStepUpFields: boolean =
    passwordDialogMode === "disable" && typeof disable2FAState?.error?.form === "string" && disable2FAState.error.form.toLowerCase().includes("2fa");

  const passwordDialogTitle: string =
    passwordDialogMode === "enable"
      ? "Confirm Your Password"
      : passwordDialogMode === "disable"
        ? "Disable Two-Factor Authentication"
        : "Generate New Backup Codes"

  const passwordDialogDescription: string =
    passwordDialogMode === "enable"
      ? "For your security, please enter your password to continue."
      : passwordDialogMode === "disable"
        ? "Enter your password to disable 2FA."
        : "Enter your password to generate a new set of backup codes."

  const passwordDialogSubmitLabel: string =
    passwordDialogMode === "enable"
      ? "Enable 2FA"
      : passwordDialogMode === "disable"
        ? "Disable 2FA"
        : "Generate Codes"

  // Generate an SVG QR code from the otpauth URI provided by the server
  useEffect(() => {
    let active = true
    async function generate(): Promise<void> {
      if (!qrCode) { setQrSvg(""); return }
      // If backend already returned SVG content, use it directly
      if (qrCode.trim().startsWith("<svg")) { setQrSvg(qrCode); return }
      try {
        const svg: string = await QRCode.toString(qrCode, { type: "svg", margin: 1, width: 192 })
        if (active) setQrSvg(svg)
      } catch {
        if (active) setQrSvg("")
      }
    }
    generate()
    return () => { active = false }
  }, [qrCode])

  const downloadBackupCodes = () => {
    const content = backupCodes.join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "backup-codes.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isEnabled ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <Shield className="h-5 w-5" />}
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account with two-factor authentication
              </CardDescription>
            </div>
            <Badge variant={isEnabled ? "default" : "secondary"}>{isEnabled ? "Enabled" : "Disabled"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormMessage state={enable2FAState} />
          <FormMessage state={disable2FAState} />

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication adds an additional layer of security to your account by requiring more than just
              a password to sign in.
            </p>

            <div className="flex gap-2">
              {!isEnabled ? (
                <Button onClick={() => openPasswordDialog("enable")}>Enable 2FA</Button>
              ) : (
                <Button variant="destructive" onClick={() => openPasswordDialog("disable")}>Disable 2FA</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isEnabled && backupCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Backup Codes
            </CardTitle>
            <CardDescription>
              Save these backup codes in a safe place. You can use them to access your account if you lose your
              authenticator device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormMessage state={generateCodesState} />
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Each backup code can only be used once. Generate new codes if you&apos;ve used most of them.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-background rounded border">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadBackupCodes}>
                <Download className="h-4 w-4 mr-2" />
                Download Codes
              </Button>
              <Button variant="outline" onClick={() => openPasswordDialog("regenerate")}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={passwordDialogMode !== null} onOpenChange={(open) => { if (!open) closePasswordDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{passwordDialogTitle}</DialogTitle>
            <DialogDescription>{passwordDialogDescription}</DialogDescription>
          </DialogHeader>
          {passwordDialogMode === "enable" && enable2FAState?.success ? (
            <div className="space-y-4">
              <FormMessage state={enable2FAState} />
              <div className="flex justify-center">
                {qrSvg ? (
                  <Image
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}`}
                    alt="2FA QR Code"
                    className="border rounded-lg"
                    width={192}
                    height={192}
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center w-48 h-48 border rounded-lg text-sm text-muted-foreground">
                    Generating QR code...
                  </div>
                )}
              </div>
              <Button className="w-full" type="button" onClick={closePasswordDialog}>
                Close
              </Button>
            </div>
          ) : passwordDialogMode === "disable" && disable2FAState?.success ? (
            <div className="space-y-4">
              <FormMessage state={disable2FAState} />
              <Button className="w-full" type="button" onClick={closePasswordDialog}>
                Close
              </Button>
            </div>
          ) : passwordDialogMode === "regenerate" && generateCodesState?.success ? (
            <div className="space-y-4">
              <FormMessage state={generateCodesState} />
              <Button className="w-full" type="button" onClick={closePasswordDialog}>
                Close
              </Button>
            </div>
          ) : (
            <form action={passwordDialogAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
                <FormMessage state={passwordDialogState} />
              </div>
              {shouldShowDisableStepUpFields ? (
                <div className="space-y-3 rounded-md border p-3">
                  <div className="text-sm font-medium">Step-up verification</div>
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
              <SubmitButton className="w-full">
                {passwordDialogSubmitLabel}
              </SubmitButton>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
