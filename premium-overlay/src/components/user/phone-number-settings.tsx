"use client";

import { useActionState, useMemo, useState } from "react";
import type React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import { FieldMessage } from "@/components/auth/field-message";

import type { FormState } from "@/lib/types/actions";
import { sendPhoneNumberOtpAction } from "@/actions/phone-number/send-otp";
import { verifyPhoneNumberAction } from "@/actions/phone-number/verify";

type PhoneNumberSettingsProps = Readonly<{
  phoneNumber: string;
  phoneNumberVerified: boolean;
}>;

export function PhoneNumberSettings(props: PhoneNumberSettingsProps): React.JSX.Element {
  const initialSendState: FormState = {};
  const initialVerifyState: FormState = {};
  const [phoneNumber, setPhoneNumber] = useState<string>(props.phoneNumber);
  const [code, setCode] = useState<string>("");
  const [sendState, sendAction] = useActionState(sendPhoneNumberOtpAction, initialSendState);
  const [verifyState, verifyAction] = useActionState(verifyPhoneNumberAction, initialVerifyState);
  const verified: boolean = useMemo(() => {
    if (verifyState?.success) return true;
    return props.phoneNumberVerified;
  }, [props.phoneNumberVerified, verifyState?.success]);
  const statusLabel: string = verified ? "Verified" : phoneNumber.trim().length > 0 ? "Unverified" : "Not set";

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS verification</CardTitle>
        <CardDescription>
          Add a verified phone number to receive SMS one-time codes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">Status: {statusLabel}</div>
        <form action={sendAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone number (E.164)</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              autoComplete="tel"
              inputMode="tel"
            />
            <FieldMessage messages={sendState?.error?.fields?.phoneNumber as string[] | undefined} />
          </div>
          <FormMessage state={sendState} />
          <Button type="submit" variant="secondary">Send code</Button>
        </form>
        <form action={verifyAction} className="space-y-3">
          <input type="hidden" name="phoneNumber" value={phoneNumber} />
          <div className="space-y-2">
            <Label htmlFor="phoneCode">Verification code</Label>
            <Input
              id="phoneCode"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
            <FieldMessage messages={verifyState?.error?.fields?.code as string[] | undefined} />
          </div>
          <FormMessage state={verifyState} />
          <Button type="submit">Verify</Button>
        </form>
      </CardContent>
    </Card>
  );
}
