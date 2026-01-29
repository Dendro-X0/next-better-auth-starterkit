/**
 * Re-export for modular path: `@/lib/security/ip`
 */
/**
 * Extract the best-effort client IP from Next.js `Headers`.
 * Falls back to "unknown" when not available (e.g., during local dev).
 */
export function getClientIp(headers: Headers): string {
  const HEADER_KEYS: readonly string[] = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "x-client-ip",
    "x-appengine-user-ip",
  ] as const;

  for (const key of HEADER_KEYS) {
    const value: string | null = headers.get(key);
    if (value) {
      // x-forwarded-for can contain a list, take the first
      const first = value.split(",")[0]?.trim();
      if (first) return first;
    }
  }

  // Node/Next.js doesn't reliably expose remote address via headers
  return "unknown";
}
