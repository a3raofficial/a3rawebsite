import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

// The route must reject these requests before touching the database or email.
vi.mock("@/lib/server/mongodb", () => ({
  getLeadsCollection: vi.fn(() => {
    throw new Error("database should not be called");
  }),
}));
vi.mock("@/lib/server/email", () => ({ sendTeamNotification: vi.fn(), sendClientConfirmation: vi.fn() }));

const { POST } = await import("@/app/api/leads/route");

function request(body: string, headers: Record<string, string> = { "content-type": "application/json" }) {
  return new NextRequest("http://localhost/api/leads", { method: "POST", body, headers });
}

describe("POST /api/leads", () => {
  it("rejects non-JSON content types", async () => {
    const response = await POST(request("name=x", { "content-type": "application/x-www-form-urlencoded" }));
    expect(response.status).toBe(415);
  });

  it("rejects oversized bodies", async () => {
    const response = await POST(request(JSON.stringify({ problemDescription: "x".repeat(20_000) })));
    expect(response.status).toBe(413);
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(request("{not json"));
    expect(response.status).toBe(400);
  });
});
