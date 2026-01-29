import { toast } from "sonner";
import type { FormState } from "@/lib/types/actions";

/**
 * Utilities to standardize Sonner toast usage across the app.
 * One export per file as per project conventions.
 */
const toastUtils = {
  /** Show a success toast. */
  success(message: string): void {
    toast.success(message);
  },

  /** Show an error toast. */
  error(message: string): void {
    toast.error(message);
  },

  /** Show an info toast. */
  info(message: string): void {
    toast(message);
  },

  /**
   * Display a toast from a FormState.
   * - Prefers field-agnostic form error, then success message.
   */
  fromFormState(state: FormState | null | undefined, fallbackSuccess: string = "Success") : void {
    if (!state) return;
    if (state.error?.form) {
      toast.error(state.error.form);
      return;
    }
    if (state.success) {
      toast.success(state.message ?? fallbackSuccess);
    }
  },
} as const;

export default toastUtils;
