import { describe, expect, it } from "vitest";
import { formatSlot, generateSlots, isBookableSlot } from "@/lib/slots";

// Friday 2026-10-09 09:00 IST
const now = new Date("2026-10-09T03:30:00Z");
const ist = (iso: string) => new Date(`${iso}+05:30`);

describe("generateSlots", () => {
  const slots = generateSlots(now);

  it("only offers times between 10:00 and 18:30 IST on Mon–Sat", () => {
    for (const slot of slots) {
      const local = new Date(slot.getTime() + 330 * 60_000);
      const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
      expect(minutes).toBeGreaterThanOrEqual(600);
      expect(minutes).toBeLessThanOrEqual(18 * 60 + 30);
      expect(local.getUTCDay()).not.toBe(0);
    }
  });

  it("respects the 12-hour minimum notice", () => {
    expect(slots[0].getTime()).toBeGreaterThanOrEqual(now.getTime() + 12 * 3_600_000);
    // 09:00 + 12h = 21:00 → first slot is Saturday 10:00 IST
    expect(slots[0]).toEqual(ist("2026-10-10T10:00:00"));
  });

  it("skips Sundays", () => {
    expect(slots.some((s) => s.getTime() === ist("2026-10-11T10:00:00").getTime())).toBe(false);
    expect(slots.some((s) => s.getTime() === ist("2026-10-12T10:00:00").getTime())).toBe(true);
  });

  it("creates 18 half-hour slots per working day", () => {
    const saturday = slots.filter((s) => s.toISOString().startsWith("2026-10-10"));
    expect(saturday).toHaveLength(18);
  });
});

describe("isBookableSlot", () => {
  it("accepts a generated slot and rejects off-grid, past or Sunday times", () => {
    expect(isBookableSlot(ist("2026-10-12T11:30:00"), now)).toBe(true);
    expect(isBookableSlot(ist("2026-10-12T11:15:00"), now)).toBe(false);
    expect(isBookableSlot(ist("2026-10-09T15:00:00"), now)).toBe(false); // within notice period
    expect(isBookableSlot(ist("2026-10-11T11:00:00"), now)).toBe(false); // Sunday
    expect(isBookableSlot(new Date("invalid"), now)).toBe(false);
  });
});

describe("formatSlot", () => {
  it("formats in IST", () => {
    expect(formatSlot(ist("2026-10-12T11:30:00"))).toMatch(/Mon.*12 Oct.*11:30.*IST$/i);
  });
});
