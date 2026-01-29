import { NextResponse } from "next/server";

/**
 * POST /api/rum
 * Minimal ingestion endpoint for Web Vitals. Logs to function logs for now.
 */
export async function POST(request: Request): Promise<Response> {
  const start: number = Date.now();
  try {
    const body = await request.json();
    const metric: {
      name: string;
      id: string;
      value: number;
      label: "web-vital" | "custom";
      path?: string;
      url?: string;
      connection?: string;
      viewport?: string;
      ua?: string;
      sampleRate?: number;
    } = body;

    console.log("web-vitals", { ...metric, ts: new Date().toISOString() });

    const headers = new Headers();
    headers.set("Server-Timing", `rum;dur=${Date.now() - start}`);
    return new NextResponse(null, { status: 204, headers });
  } catch (err) {
    const headers = new Headers();
    headers.set("Server-Timing", `rum;dur=${Date.now() - start}`);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400, headers });
  }
}
