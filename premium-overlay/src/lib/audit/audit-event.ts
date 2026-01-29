type AuditEvent = Readonly<{
  event: "role_changed" | "sign_in" | "password_reset_requested" | "password_reset_completed" | "2fa_enabled" | "2fa_disabled";
  actorUserId: string | null;
  targetUserId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Readonly<Record<string, unknown>>;
}>;

export type { AuditEvent };
