import { Suspense } from "react";
import VerifyMagicLinkClient from "./verify-magic-link-client";

/**
 * Server page for verify magic link. Wraps client logic in Suspense
 * to satisfy useSearchParams requirements.
 */
export default function VerifyMagicLinkPage() {
  return (
    <Suspense>
      <VerifyMagicLinkClient />
    </Suspense>
  );
}
