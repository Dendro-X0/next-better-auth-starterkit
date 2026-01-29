"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

/**
 * DevEnvWarning displays a dismissible banner in development if
 * NEXT_PUBLIC_APP_URL does not match the current origin. This helps
 * prevent auth link issues when the dev port changes.
 */
export function DevEnvWarning(): null | ReactElement {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const key = "dev-env-warning-dismissed";
    return sessionStorage.getItem(key) === "true";
  });

  const appUrl: string = (process.env.NEXT_PUBLIC_APP_URL as string) || "";

  const mismatch: boolean = useMemo((): boolean => {
    if (typeof window === "undefined") return false;
    if (!appUrl) return false;
    try {
      const expected = new URL(appUrl).origin;
      const current = window.location.origin;
      return expected !== current;
    } catch {
      return false;
    }
  }, [appUrl]);

  const onDismiss = (): void => {
    setDismissed(true);
    sessionStorage.setItem("dev-env-warning-dismissed", "true");
  };

  if (process.env.NODE_ENV === "production") return null;
  if (!mismatch || dismissed) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center p-2">
      <Alert className="max-w-3xl w-full bg-amber-50 border-amber-200 text-amber-900 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <AlertDescription className="text-sm">
            NEXT_PUBLIC_APP_URL is <code className="font-mono">{appUrl}</code> but your browser origin is
            <code className="font-mono"> {typeof window !== "undefined" ? window.location.origin : ""}</code>.
            Update <code>.env.local</code> and restart the dev server so auth links (magic link, verification) work correctly.
          </AlertDescription>
          <Button variant="ghost" size="icon" aria-label="Dismiss warning" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}
