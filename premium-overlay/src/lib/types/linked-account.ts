import type { AuthProviderId } from "@/lib/types/auth-provider-id";

type LinkedAccountParams = Readonly<{
  providerId: AuthProviderId | (string & {});
  accountId: string;
  createdAt: string;
}>;

export type LinkedAccount = Readonly<LinkedAccountParams>;
