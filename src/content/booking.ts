/**
 * Discovery-call availability. Edit these values to change bookable times;
 * the slot picker and the server both read from here.
 */
export const booking = {
  durationMinutes: 20,
  /** IANA zone used for display, and its fixed UTC offset (India has no DST). */
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",
  utcOffsetMinutes: 330,
  /** Bookable weekdays: 0 = Sunday … 6 = Saturday. */
  days: [1, 2, 3, 4, 5, 6],
  /** Working window in local minutes after midnight: 10:00–19:00. */
  startMinutes: 10 * 60,
  endMinutes: 19 * 60,
  /** Earliest bookable time, relative to now. */
  minNoticeHours: 12,
  /** How far ahead visitors can book, in days. */
  daysAhead: 14,
} as const;

export type BookingConfig = typeof booking;
