import "server-only";

import { env } from "~/env";

type SmsProvider = "CONSOLE" | "TWILIO";

type SendSmsParams = Readonly<{
  to: string;
  message: string;
}>;

type SmsService = Readonly<{
  send: (params: SendSmsParams) => Promise<void>;
}>;

function createConsoleSmsService(): SmsService {
  return {
    async send(params: SendSmsParams): Promise<void> {
      console.log(`[sms][console] to=${params.to} message=${params.message}`);
    },
  };
}

function encodeBasicAuth(params: Readonly<{ username: string; password: string }>): string {
  const raw: string = `${params.username}:${params.password}`;
  return Buffer.from(raw).toString("base64");
}

async function readTwilioErrorText(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null && "message" in data) {
      const message: unknown = (data as Readonly<Record<string, unknown>>).message;
      if (typeof message === "string" && message.trim().length > 0) return message;
    }
  } catch {
    // ignore
  }
  try {
    const text: string = await response.text();
    if (text.trim().length > 0) return text;
  } catch {
    // ignore
  }
  return "Unknown SMS provider error.";
}

function createTwilioSmsService(): SmsService {
  const accountSid: string = env.TWILIO_ACCOUNT_SID;
  const authToken: string = env.TWILIO_AUTH_TOKEN;
  const from: string = env.TWILIO_FROM_NUMBER;
  const auth: string = encodeBasicAuth({ username: accountSid, password: authToken });
  const url: string = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  return {
    async send(params: SendSmsParams): Promise<void> {
      const body: URLSearchParams = new URLSearchParams();
      body.set("To", params.to);
      body.set("From", from);
      body.set("Body", params.message);
      const response: Response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      if (!response.ok) {
        const details: string = await readTwilioErrorText(response);
        throw new Error(`Twilio SMS failed: ${details}`);
      }
    },
  };
}

function createSmsService(): SmsService {
  const provider: SmsProvider = env.SMS_PROVIDER;
  if (provider === "TWILIO") return createTwilioSmsService();
  return createConsoleSmsService();
}

export const smsService: SmsService = createSmsService();
