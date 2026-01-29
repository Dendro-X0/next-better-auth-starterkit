"use server";

import { headers } from "next/headers";

import { env } from "~/env";
import { rateLimit, getClientIp } from "@/lib/security";
import { PhoneNumberVerifySchema } from "@/lib/validations/auth";
import type { FormState } from "@/lib/types/actions";

type VerifyResponse = Readonly<{ phoneNumberVerified?: boolean; isVerified?: boolean }>;

async function readApiErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null) {
      const obj: Readonly<Record<string, unknown>> = data as Readonly<Record<string, unknown>>;
      const err: unknown = obj.error;
      if (typeof err === "object" && err !== null) {
        const msg: unknown = (err as Readonly<Record<string, unknown>>).message;
        if (typeof msg === "string" && msg.trim().length > 0) return msg;
      }
    }
  } catch {
    // ignore
  }
  return "Failed to verify phone number.";
}

export async function verifyPhoneNumberAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validated = PhoneNumberVerifySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) {
    return { ...prevState, error: { fields: validated.error.flatten().fieldErrors } };
  }
  const h: Headers = new Headers(await headers());
  const ip: string = getClientIp(h);
  const rl = await rateLimit({ action: "phone_verify", identifier: validated.data.phoneNumber, ip });
  if (!rl.ok) {
    return { ...prevState, error: { form: "Too many attempts. Please try again later." } };
  }
  const url: URL = new URL("/api/auth/phone-number/verify", env.NEXT_PUBLIC_APP_URL);
  const response: Response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: h.get("Cookie") ?? "",
    },
    body: JSON.stringify({
      phoneNumber: validated.data.phoneNumber,
      code: validated.data.code,
      updatePhoneNumber: true,
      disableSession: false,
    }),
  });
  if (!response.ok) {
    const message: string = await readApiErrorMessage(response);
    return { ...prevState, error: { form: message } };
  }
  const data: VerifyResponse = (await response.json()) as VerifyResponse;
  const verified: boolean = Boolean(data.phoneNumberVerified ?? data.isVerified);
  if (!verified) {
    return { ...prevState, error: { form: "Invalid code." } };
  }
  return { success: true, message: "Phone number verified." };
}
