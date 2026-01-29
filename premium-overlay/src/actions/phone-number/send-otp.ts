"use server";

import { headers } from "next/headers";

import { env } from "~/env";
import { rateLimit, getClientIp } from "@/lib/security";
import { PhoneNumberSendOtpSchema } from "@/lib/validations/auth";
import type { FormState } from "@/lib/types/actions";

type SendOtpResponse = Readonly<{ success?: boolean; message?: string; status?: string }>;

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
      const message: unknown = obj.message;
      if (typeof message === "string" && message.trim().length > 0) return message;
    }
  } catch {
    // ignore
  }
  return "Failed to send OTP.";
}

export async function sendPhoneNumberOtpAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validated = PhoneNumberSendOtpSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) {
    return { ...prevState, error: { fields: validated.error.flatten().fieldErrors } };
  }
  const h: Headers = new Headers(await headers());
  const ip: string = getClientIp(h);
  const rl = await rateLimit({ action: "phone_send_otp", identifier: validated.data.phoneNumber, ip });
  if (!rl.ok) {
    return { ...prevState, error: { form: "Too many attempts. Please try again later." } };
  }
  const url: URL = new URL("/api/auth/phone-number/send-otp", env.NEXT_PUBLIC_APP_URL);
  const response: Response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: h.get("Cookie") ?? "",
    },
    body: JSON.stringify({ phoneNumber: validated.data.phoneNumber }),
  });
  if (!response.ok) {
    const message: string = await readApiErrorMessage(response);
    return { ...prevState, error: { form: message } };
  }
  const data: SendOtpResponse = (await response.json()) as SendOtpResponse;
  const message: string = typeof data.message === "string" && data.message.trim().length > 0
    ? data.message
    : "OTP sent.";
  return { success: true, message };
}
