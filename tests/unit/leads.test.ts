import { describe, expect, it, vi } from "vitest";
import { hashIp } from "@/lib/http";
import { RATE_LIMIT_MAX, submitEnquiry, type LeadDeps } from "@/lib/leads";
import type { Lead } from "@/types/lead";

const validInput = {
  name: "Test Person",
  email: "Test@Example.com",
  company: "Example Ltd",
  serviceInterest: "Not sure yet",
  problemDescription: "We spend hours each week copying orders between two systems.",
  budgetRange: "Not sure yet",
  timeline: "Just exploring",
  privacyConsent: true,
};

function makeDeps(overrides: Partial<LeadDeps> = {}) {
  const deferred: Array<() => Promise<void>> = [];
  const deps: LeadDeps = {
    countRecentByIp: vi.fn(async () => 0),
    insertLead: vi.fn(async () => "lead-123"),
    updateNotifications: vi.fn(async () => {}),
    sendTeamNotification: vi.fn(async () => ({ state: "sent" as const })),
    sendClientConfirmation: vi.fn(async () => ({ state: "sent" as const })),
    defer: (task) => deferred.push(task),
    now: () => new Date("2026-10-09T10:00:00Z"),
    log: vi.fn(),
    ...overrides,
  };
  const runDeferred = () => Promise.all(deferred.map((task) => task()));
  return { deps, runDeferred };
}

describe("submitEnquiry", () => {
  it("saves a valid enquiry, then sends both emails and records their status", async () => {
    const { deps, runDeferred } = makeDeps();
    const result = await submitEnquiry(validInput, "hash", deps);

    expect(result).toEqual({ status: 201, body: { ok: true } });
    const saved = vi.mocked(deps.insertLead).mock.calls[0][0] as Lead;
    expect(saved.email).toBe("test@example.com");
    expect(saved.status).toBe("new");
    expect(saved.privacyConsent).toBe(true);
    expect(saved.notifications.team).toBe("pending");
    // Emails are not sent before the response.
    expect(deps.sendTeamNotification).not.toHaveBeenCalled();

    await runDeferred();
    expect(deps.sendTeamNotification).toHaveBeenCalledWith(expect.objectContaining({ name: "Test Person" }), "lead-123");
    expect(deps.sendClientConfirmation).toHaveBeenCalledOnce();
    expect(deps.updateNotifications).toHaveBeenCalledWith(
      "lead-123",
      expect.objectContaining({ team: "sent", client: "sent" }),
    );
  });

  it("rejects invalid input with field errors and saves nothing", async () => {
    const { deps } = makeDeps();
    const result = await submitEnquiry(
      { ...validInput, email: "not-an-email", problemDescription: "short", privacyConsent: false },
      "hash",
      deps,
    );

    expect(result.status).toBe(400);
    if (result.status !== 400) throw new Error("unreachable");
    expect(Object.keys(result.body.fieldErrors ?? {})).toEqual(
      expect.arrayContaining(["email", "problemDescription", "privacyConsent"]),
    );
    expect(deps.insertLead).not.toHaveBeenCalled();
  });

  it("rejects unexpected fields", async () => {
    const { deps } = makeDeps();
    const result = await submitEnquiry({ ...validInput, status: "qualified" }, "hash", deps);
    expect(result.status).toBe(400);
    expect(deps.insertLead).not.toHaveBeenCalled();
  });

  it("rejects non-string values such as query operators", async () => {
    const { deps } = makeDeps();
    const result = await submitEnquiry({ ...validInput, email: { $gt: "" } }, "hash", deps);
    expect(result.status).toBe(400);
  });

  it("rejects line breaks in single-line fields", async () => {
    const { deps } = makeDeps();
    const result = await submitEnquiry({ ...validInput, name: "Test\r\nBcc: x@y.z" }, "hash", deps);
    expect(result.status).toBe(400);
  });

  it("silently discards honeypot submissions", async () => {
    const { deps } = makeDeps();
    const result = await submitEnquiry({ ...validInput, website: "http://spam.example" }, "hash", deps);
    expect(result.status).toBe(201);
    expect(deps.insertLead).not.toHaveBeenCalled();
  });

  it("rate limits repeated submissions from the same IP", async () => {
    const { deps } = makeDeps({ countRecentByIp: vi.fn(async () => RATE_LIMIT_MAX) });
    const result = await submitEnquiry(validInput, "hash", deps);
    expect(result.status).toBe(429);
    expect(deps.insertLead).not.toHaveBeenCalled();
  });

  it("returns 503 without sending email when the database insert fails", async () => {
    const { deps, runDeferred } = makeDeps({
      insertLead: vi.fn(async () => {
        throw new Error("connection lost");
      }),
    });
    const result = await submitEnquiry(validInput, "hash", deps);
    await runDeferred();
    expect(result.status).toBe(503);
    expect(deps.sendTeamNotification).not.toHaveBeenCalled();
  });

  it("returns 503 when the rate-limit lookup fails", async () => {
    const { deps } = makeDeps({
      countRecentByIp: vi.fn(async () => {
        throw new Error("timeout");
      }),
    });
    const result = await submitEnquiry(validInput, "hash", deps);
    expect(result.status).toBe(503);
  });

  it("keeps the lead and records the failure when email sending fails", async () => {
    const { deps, runDeferred } = makeDeps({
      sendTeamNotification: vi.fn(async () => ({ state: "failed" as const, error: "EAUTH" })),
    });
    const result = await submitEnquiry(validInput, "hash", deps);
    await runDeferred();

    expect(result.status).toBe(201);
    expect(deps.insertLead).toHaveBeenCalledOnce();
    expect(deps.updateNotifications).toHaveBeenCalledWith(
      "lead-123",
      expect.objectContaining({ team: "failed", client: "sent", lastError: "EAUTH" }),
    );
  });

  it("records 'skipped' when email is not configured", async () => {
    const skipped = vi.fn(async () => ({ state: "skipped" as const, error: "email not configured" }));
    const { deps, runDeferred } = makeDeps({ sendTeamNotification: skipped, sendClientConfirmation: skipped });
    await submitEnquiry(validInput, "hash", deps);
    await runDeferred();
    expect(deps.updateNotifications).toHaveBeenCalledWith(
      "lead-123",
      expect.objectContaining({ team: "skipped", client: "skipped" }),
    );
  });
});

describe("hashIp", () => {
  it("is stable and does not contain the IP", () => {
    const a = hashIp("203.0.113.7", "salt");
    expect(a).toBe(hashIp("203.0.113.7", "salt"));
    expect(a).not.toContain("203.0.113.7");
    expect(a).not.toBe(hashIp("203.0.113.7", "other-salt"));
  });
});
