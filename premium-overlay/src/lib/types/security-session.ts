type SecuritySession = Readonly<{
  id: string;
  token: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
}>;

export type { SecuritySession };
