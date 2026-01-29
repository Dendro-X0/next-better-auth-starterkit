"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { SignupSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/security";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Form state type for signup action
 */
export type SignupFormState = {
  success?: boolean;
  error?: {
    message?: string;
    fields?: {
      email?: string[];
      password?: string[];
      name?: string[];
      username?: string[];
      confirmPassword?: string[];
    };
  };
  message?: string;
};

/**
 * Robust signup action using AuthService abstraction
 * Handles validation, user creation, and error states
 */
export async function signupAction(
  prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  try {
    const credentials = Object.fromEntries(formData.entries());
    const validatedFields = SignupSchema.safeParse(credentials);

    if (!validatedFields.success) {
      return {
        error: {
          fields: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    const { email, password, name, username } = validatedFields.data as {
      email: string;
      password: string;
      name: string;
      username: string;
    };

    // Enforce username uniqueness before calling Better Auth
    const existingUsername = await db.query.user.findFirst({ where: eq(user.username, username) });
    if (existingUsername) {
      return {
        error: {
          fields: { username: ["Username is already taken"] },
        },
      };
    }

    // Rate limit signups by email + client IP
    const h = await headers();
    const ip: string = getClientIp(h);
    const rl = await rateLimit({ action: "signup", identifier: email, ip });
    if (!rl.ok) {
      return { error: { message: "Too many sign up attempts. Please try again later." } };
    }

    await auth.api.signUpEmail({ body: { email, password, name, username, displayUsername: username } });

    redirect("/auth/login?message=Account created successfully. Please sign in.");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Signup action error:", error);

    if (isAuthError(error)) {
      return { error: { message: error.body.message } };
    }

    return {
      error: {
        message: "An error occurred during sign up. The email may already be in use.",
      },
    };
  }
}
