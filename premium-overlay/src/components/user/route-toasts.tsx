"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * RouteToasts listens for query params like `message` and `error` and
 * displays Sonner toast notifications. After showing, it cleans the URL
 * to avoid repeated toasts on navigation.
 */
export function RouteToasts(): null {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastShownKeyRef = useRef<string>("");

  useEffect((): void => {
    const MESSAGE_PARAM: string = "message";
    const ERROR_PARAM: string = "error";

    const message: string | null = searchParams.get(MESSAGE_PARAM);
    const error: string | null = searchParams.get(ERROR_PARAM);

    if (!message && !error) return;

    const key: string = `${pathname}|${message ?? ""}|${error ?? ""}`;
    if (lastShownKeyRef.current === key) return;

    if (message) toast.success(decodeURIComponent(message));
    if (error) toast.error(decodeURIComponent(error));

    const params = new URLSearchParams(searchParams.toString());
    params.delete(MESSAGE_PARAM);
    params.delete(ERROR_PARAM);
    const query = params.toString();
    const nextUrl: string = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl, { scroll: false });
    lastShownKeyRef.current = key;
  }, [pathname, router, searchParams]);

  return null;
}
