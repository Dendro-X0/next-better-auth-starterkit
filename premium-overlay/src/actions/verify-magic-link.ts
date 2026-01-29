"use server";

import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";

export type FormState = {
  error?: {
    message: string;
  };
};

export async function verifyMagicLinkAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const token = formData.get("token") as string;
  try {
    await auth.api.verifyEmail({ query: { token } });
    redirect("/user?message=Successfully signed in!");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Verify magic link error:", error);

    if (isAuthError(error)) {
      return { error: { message: error.body.message } };
    }

    return { error: { message: "Invalid magic link." } };
  }
}
