import { describe, expect, it, vi } from "vitest";
import { APPOINTMENT_RATE_LIMIT_MAX, availableSlots, submitAppointment, type AppointmentDeps } from "@/lib/appointments";
import type { Appointment } from "@/types/appointment";

const now = new Date("2026-10-09T03:30:00Z"); // Fri 09:00 IST
const slotStart = "2026-10-12T06:00:00.000Z"; // Mon 11:30 IST

const validInput = {
  name: "Test Person",
  email: "Test@Example.com",
  topic: "We want to explore automating our order intake.",
  slotStart,
  privacyConsent: true,
};

function makeDeps(overrides: Partial<AppointmentDeps> = {}) {
  const deferred: Array<() => Promise<void>> = [];
  const deps: AppointmentDeps = {
    countRecentByIp: vi.fn(async () => 0),
    insertAppointment: vi.fn(async () => "appt-1"),
    updateNotifications: vi.fn(async () => {}),
    sendTeamNotification: vi.fn(async () => ({ state: "sent" as const })),
    sendClientConfirmation: vi.fn(async () => ({ state: "sent" as const })),
    defer: (task) => deferred.push(task),
    now: () => now,
    log: vi.fn(),
    ...overrides,
  };
  return { deps, runDeferred: () => Promise.all(deferred.map((t) => t())) };
}

describe("submitAppointment", () => {
  it("stores a valid request with a 30-minute slot and emails both sides", async () => {
    const { deps, runDeferred } = makeDeps();
    const result = await submitAppointment(validInput, "hash", deps);

    expect(result.status).toBe(201);
    const saved = vi.mocked(deps.insertAppointment).mock.calls[0][0] as Appointment;
    expect(saved.status).toBe("requested");
    expect(saved.email).toBe("test@example.com");
    expect(saved.slotStart.toISOString()).toBe(slotStart);
    expect(saved.slotEnd.getTime() - saved.slotStart.getTime()).toBe(30 * 60_000);

    await runDeferred();
    expect(deps.sendTeamNotification).toHaveBeenCalledWith(
      expect.objectContaining({ slotLabel: expect.stringMatching(/IST$/) }),
      "appt-1",
    );
    expect(deps.updateNotifications).toHaveBeenCalledWith("appt-1", expect.objectContaining({ team: "sent" }));
  });

  it("rejects a time outside the bookable grid", async () => {
    const { deps } = makeDeps();
    const result = await submitAppointment({ ...validInput, slotStart: "2026-10-12T06:10:00.000Z" }, "hash", deps);
    expect(result.status).toBe(400);
    expect(deps.insertAppointment).not.toHaveBeenCalled();
  });

  it("rejects a time inside the notice period", async () => {
    const { deps } = makeDeps();
    const result = await submitAppointment({ ...validInput, slotStart: "2026-10-09T09:30:00.000Z" }, "hash", deps);
    expect(result.status).toBe(400);
  });

  it("returns 409 when the slot was taken in the meantime", async () => {
    const { deps } = makeDeps({
      insertAppointment: vi.fn(async () => {
        throw Object.assign(new Error("E11000 duplicate key"), { code: 11000 });
      }),
    });
    const result = await submitAppointment(validInput, "hash", deps);
    expect(result.status).toBe(409);
  });

  it("returns 503 on other database errors", async () => {
    const { deps } = makeDeps({
      insertAppointment: vi.fn(async () => {
        throw new Error("network");
      }),
    });
    expect((await submitAppointment(validInput, "hash", deps)).status).toBe(503);
  });

  it("rate limits repeated requests", async () => {
    const { deps } = makeDeps({ countRecentByIp: vi.fn(async () => APPOINTMENT_RATE_LIMIT_MAX) });
    expect((await submitAppointment(validInput, "hash", deps)).status).toBe(429);
  });

  it("discards honeypot submissions without saving", async () => {
    const { deps } = makeDeps();
    const result = await submitAppointment({ ...validInput, website: "x" }, "hash", deps);
    expect(result.status).toBe(201);
    expect(deps.insertAppointment).not.toHaveBeenCalled();
  });

  it("keeps the request and records failure when email fails", async () => {
    const { deps, runDeferred } = makeDeps({
      sendClientConfirmation: vi.fn(async () => ({ state: "failed" as const, error: "EENVELOPE" })),
    });
    expect((await submitAppointment(validInput, "hash", deps)).status).toBe(201);
    await runDeferred();
    expect(deps.updateNotifications).toHaveBeenCalledWith(
      "appt-1",
      expect.objectContaining({ client: "failed", lastError: "EENVELOPE" }),
    );
  });
});

describe("availableSlots", () => {
  it("hides taken slots", () => {
    const taken = new Date(slotStart);
    const open = availableSlots(now, [taken]);
    expect(open.some((s) => s.getTime() === taken.getTime())).toBe(false);
    expect(open.length).toBeGreaterThan(0);
  });
});
