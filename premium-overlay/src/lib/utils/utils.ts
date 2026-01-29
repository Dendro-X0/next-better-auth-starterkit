import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Type guard to check if an error is from Better Auth
 */
export function isBetterAuthError(error: unknown): error is { message: string } {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const errorObj = error as Record<string, unknown>;
  return "message" in errorObj && typeof errorObj.message === "string";
}
