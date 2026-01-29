import { createAuthClient } from "better-auth/client";
import { magicLinkClient, usernameClient, twoFactorClient } from "better-auth/client/plugins";

/**
 * Better Auth client configured with username, magic link, and 2FA plugins.
 */
export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  plugins: [
    usernameClient(),
    magicLinkClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/verify-2fa";
      },
    }),
  ],
});