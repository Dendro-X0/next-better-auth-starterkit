import type { ServerActionError } from "@/lib/types/server-action-error";

type ServerActionResult<TData> = Readonly<{ ok: true; data: TData }> | Readonly<{ ok: false; error: ServerActionError }>;

export type { ServerActionResult };
