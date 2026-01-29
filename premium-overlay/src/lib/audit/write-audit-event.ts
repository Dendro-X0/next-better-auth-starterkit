import "server-only";

import type { AuditEvent } from "@/lib/audit/audit-event";

type WriteAuditEventParams = AuditEvent;

async function writeAuditEvent(_params: WriteAuditEventParams): Promise<void> {
  return;
}

export { writeAuditEvent };
