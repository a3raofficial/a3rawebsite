import { booking, type BookingConfig } from "@/content/booking";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/**
 * All bookable slot start times (UTC Dates) from `now` until the end of the
 * booking window, ignoring slots that are already taken.
 */
export function generateSlots(now: Date, config: BookingConfig = booking): Date[] {
  const offset = config.utcOffsetMinutes * MINUTE;
  const earliest = now.getTime() + config.minNoticeHours * 60 * MINUTE;

  // Local midnight of "today", expressed as a UTC timestamp of the same wall-clock date.
  const local = new Date(now.getTime() + offset);
  const todayLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());

  const slots: Date[] = [];
  for (let day = 0; day <= config.daysAhead; day++) {
    const midnight = todayLocal + day * DAY;
    if (!(config.days as readonly number[]).includes(new Date(midnight).getUTCDay())) continue;
    for (let m = config.startMinutes; m + config.durationMinutes <= config.endMinutes; m += config.durationMinutes) {
      const start = midnight + m * MINUTE - offset;
      if (start >= earliest) slots.push(new Date(start));
    }
  }
  return slots;
}

/** True if `slot` is exactly one of the currently bookable start times. */
export function isBookableSlot(slot: Date, now: Date, config: BookingConfig = booking): boolean {
  const t = slot.getTime();
  return !Number.isNaN(t) && generateSlots(now, config).some((s) => s.getTime() === t);
}

/** e.g. "Tue, 14 Oct, 11:00 am IST" */
export function formatSlot(slot: Date, config: BookingConfig = booking): string {
  const text = new Intl.DateTimeFormat("en-IN", {
    timeZone: config.timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(slot);
  return `${text} ${config.timeZoneLabel}`;
}
