import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/** Max request body accepted by the public form endpoints, in bytes. */
export const MAX_BODY_BYTES = 16 * 1024;

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function clientIp(request: NextRequest) {
  return (
    // Netlify sets this to the real visitor IP; fall back to standard proxy headers.
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Reads a small JSON body. Returns the parsed value, or a ready-made error
 * Response for wrong content type, oversized or malformed bodies.
 */
export async function readJsonBody(request: NextRequest): Promise<{ data: unknown } | { error: Response }> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return { error: json({ ok: false, error: "Unsupported content type." }, 415) };
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return { error: json({ ok: false, error: "Request too large." }, 413) };
  }
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) {
    return { error: json({ ok: false, error: "Request too large." }, 413) };
  }
  try {
    return { data: JSON.parse(text) };
  } catch {
    return { error: json({ ok: false, error: "Invalid request." }, 400) };
  }
}

/** Salted one-way hash of an IP, used only for rate limiting. */
export function hashIp(ip: string, salt: string) {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
