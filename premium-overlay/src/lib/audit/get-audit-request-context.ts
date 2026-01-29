import "server-only";

import { getClientIp } from "@/lib/security";

type GetAuditRequestContextParams = Readonly<{ headers: Headers }>;

type AuditRequestContext = Readonly<{ ipAddress: string | null; userAgent: string | null }>;

function getAuditRequestContext(params: GetAuditRequestContextParams): AuditRequestContext {
  const ipAddress: string = getClientIp(params.headers);
  const userAgent: string | null = params.headers.get("user-agent");
  return { ipAddress: ipAddress.length > 0 ? ipAddress : null, userAgent };
}

export { getAuditRequestContext };
