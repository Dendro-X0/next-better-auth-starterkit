"use server";

import { headers } from "next/headers";

import { env } from "~/env";
import { rateLimit, getClientIp } from "@/lib/security";
import type { FormState } from "@/lib/types/actions";

type SendOtpResponse = Readonly<{ success?: boolean; message?: string }>;

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
  return "Failed to send code.";
}

export async function sendTwoFactorOtpAction(prevState: FormState, _formData: FormData): Promise<FormState> {
  const h: Headers = new Headers(await headers());
  const ip: string = getClientIp(h);
  const rl = await rateLimit({ action: "send_2fa_otp", identifier: ip, ip });
  if (!rl.ok) {
    return { ...prevState, error: { form: "Too many attempts. Please try again later." } };
  }
  const url: URL = new URL("/api/auth/two-factor/send-otp", env.NEXT_PUBLIC_APP_URL);
  const response: Response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: h.get("Cookie") ?? "",
    },
    body: JSON.stringify({ trustDevice: false }),
  });
  if (!response.ok) {
    const message: string = await readApiErrorMessage(response);
    return { ...prevState, error: { form: message } };
  }
  const data: SendOtpResponse = (await response.json()) as SendOtpResponse;
  return {
    success: true,
    message: typeof data.message === "string" && data.message.trim().length > 0 ? data.message : "Code sent.",
  };
}
