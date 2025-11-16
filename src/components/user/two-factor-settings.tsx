"use client"

import { useActionState, useState, useEffect } from "react"
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
import toastUtils from "@/lib/ui/toast"

interface TwoFactorSettingsProps {
  isEnabled: boolean
  backupCodes?: string[]
}

export function TwoFactorSettings({
  isEnabled: initialEnabled,
  backupCodes: initialBackupCodes,
}: TwoFactorSettingsProps) {
  // Component UI state
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
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
                <Button onClick={() => setShowPasswordDialog(true)}>Enable 2FA</Button>
              ) : (
                <form action={disable2FAFormAction}>
                  <SubmitButton variant="destructive">Disable 2FA</SubmitButton>
                </form>
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
              <form action={generateCodesFormAction}>
                <SubmitButton variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New Codes
                </SubmitButton>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Password</DialogTitle>
            <DialogDescription>For your security, please enter your password to continue.</DialogDescription>
          </DialogHeader>
          <form action={enable2FAFormAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              <FormMessage state={enable2FAState} />
            </div>
            <SubmitButton className="w-full">
              Enable 2FA
            </SubmitButton>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app. You&apos;ll be asked for a code on your next login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrSvg && (
              <div className="flex justify-center">
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}`} 
                    alt="2FA QR Code" 
                    className="border rounded-lg" 
                    width="192" 
                    height="192" 
                  />
                </div>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                After scanning, close this dialog. Your setup is complete.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
