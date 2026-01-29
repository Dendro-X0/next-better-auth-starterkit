import { Suspense } from "react";
import type React from "react";

import VerifyEmailClient from "./verify-email-client";

export default function VerifyEmailPage(): React.JSX.Element {
  return (
    <Suspense>
      <VerifyEmailClient />
    </Suspense>
  );
}
