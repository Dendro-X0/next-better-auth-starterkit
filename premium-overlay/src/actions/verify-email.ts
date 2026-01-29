"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";

type VerifyEmailState = Readonly<{ error?: Readonly<{ message: string }> }>;

type VerifyEmailAction = (prevState: VerifyEmailState, formData: FormData) => Promise<VerifyEmailState>;

const verifyEmailAction: VerifyEmailAction = async function verifyEmailAction(
  _prevState: VerifyEmailState,
  formData: FormData,
): Promise<VerifyEmailState> {
  const token: string = String(formData.get("token") ?? "").trim();
  if (!token) {
    return { error: { message: "Invalid verification link." } };
  }
  try {
    await auth.api.verifyEmail({ query: { token } });
    redirect("/user?message=Email%20verified");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (isAuthError(error)) {
      return { error: { message: error.body.message } };
    }
    return { error: { message: "Invalid or expired verification link." } };
  }
};

export { verifyEmailAction };
