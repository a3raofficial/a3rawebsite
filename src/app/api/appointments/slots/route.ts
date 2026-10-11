import { connection } from "next/server";
import { booking } from "@/content/booking";
import { availableSlots } from "@/lib/appointments";
import { json } from "@/lib/server/http";
import { getAppointmentsCollection } from "@/lib/server/mongodb";
import { ACTIVE_APPOINTMENT_STATUSES } from "@/types/appointment";

/** Open discovery-call slots. Exposes only times, never who booked them. */
export async function GET() {
  await connection(); // depends on the current time and live bookings
  const now = new Date();
  try {
    const appointments = await getAppointmentsCollection();
    const taken = await appointments
      .find(
        { slotEnd: { $gt: now }, status: { $in: ACTIVE_APPOINTMENT_STATUSES } },
        { projection: { slotStart: 1, slotEnd: 1 } },
      )
      .toArray();
    return json({
      ok: true,
      timeZone: booking.timeZone,
      timeZoneLabel: booking.timeZoneLabel,
      durationMinutes: booking.durationMinutes,
      slots: availableSlots(
        now,
        taken.map((a) => ({ start: a.slotStart, end: a.slotEnd })),
      ).map((d) => d.toISOString()),
    });
  } catch (error) {
    console.warn("[appointments] slot lookup failed", (error as Error).name);
    return json({ ok: false, error: "Booking is temporarily unavailable." }, 503);
  }
}
