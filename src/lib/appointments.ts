import { z } from "zod";
import { booking } from "@/content/booking";
import type { EmailResult } from "@/lib/email";
import { formatSlot, generateSlots, isBookableSlot } from "@/lib/slots";
import { appointmentSchema } from "@/lib/validation";
import type { Appointment } from "@/types/appointment";

/** Call requests allowed per IP within the window. */
export const APPOINTMENT_RATE_LIMIT_MAX = 3;
export const APPOINTMENT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export const appointmentRequestSchema = appointmentSchema
  .extend({
    website: z.string().max(500).optional(),
    source: z.string().trim().max(100).optional(),
  })
  .strict();

type CallEmail = { name: string; email: string; company?: string; topic: string; slotLabel: string };

export type AppointmentDeps = {
  countRecentByIp(ipHash: string, since: Date): Promise<number>;
  /** Throws an error with `code: 11000` if the slot is already actively booked. */
  insertAppointment(appointment: Appointment): Promise<string>;
  updateNotifications(id: string, notifications: Appointment["notifications"]): Promise<void>;
  sendTeamNotification(call: CallEmail, id: string): Promise<EmailResult>;
  sendClientConfirmation(call: CallEmail): Promise<EmailResult>;
  defer(task: () => Promise<void>): void;
  now(): Date;
  log(message: string, meta?: Record<string, unknown>): void;
};

export type AppointmentResult =
  | { status: 201; body: { ok: true; slotStart?: string; slotLabel?: string } }
  | { status: 400; body: { ok: false; error: string; fieldErrors?: Record<string, string> } }
  | { status: 409; body: { ok: false; error: string; fieldErrors: Record<string, string> } }
  | { status: 429; body: { ok: false; error: string } }
  | { status: 503; body: { ok: false; error: string } };

const SAVE_FAILED = "We couldn't save your request right now. Please try again shortly, or email us directly.";
const SLOT_TAKEN = "Sorry — that time was just taken. Please pick another.";

/** Bookable slots minus the ones already actively booked. */
export function availableSlots(now: Date, taken: Date[]): Date[] {
  const takenSet = new Set(taken.map((d) => d.getTime()));
  return generateSlots(now).filter((slot) => !takenSet.has(slot.getTime()));
}

export async function submitAppointment(
  raw: unknown,
  ipHash: string,
  deps: AppointmentDeps,
): Promise<AppointmentResult> {
  const parsed = appointmentRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    }
    return { status: 400, body: { ok: false, error: "Please check the highlighted fields.", fieldErrors } };
  }

  const { website, source, slotStart, ...request } = parsed.data;
  if (website) {
    deps.log("appointment discarded by honeypot");
    return { status: 201, body: { ok: true } };
  }

  const now = deps.now();
  const start = new Date(slotStart);
  if (!isBookableSlot(start, now)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "That time can't be booked.",
        fieldErrors: { slotStart: "That time is no longer available. Please pick another." },
      },
    };
  }

  try {
    const recent = await deps.countRecentByIp(ipHash, new Date(now.getTime() - APPOINTMENT_RATE_LIMIT_WINDOW_MS));
    if (recent >= APPOINTMENT_RATE_LIMIT_MAX) {
      return {
        status: 429,
        body: { ok: false, error: "You've requested several calls recently. Please email us instead." },
      };
    }
  } catch (error) {
    deps.log("appointment rate-limit check failed", { error: (error as Error).name });
    return { status: 503, body: { ok: false, error: SAVE_FAILED } };
  }

  const appointment: Appointment = {
    ...request,
    email: request.email.toLowerCase(),
    createdAt: now,
    slotStart: start,
    slotEnd: new Date(start.getTime() + booking.durationMinutes * 60_000),
    timeZone: booking.timeZone,
    status: "requested",
    source: source ?? null,
    ipHash,
    notifications: { team: "pending", client: "pending", updatedAt: now },
  };

  let id: string;
  try {
    id = await deps.insertAppointment(appointment);
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return { status: 409, body: { ok: false, error: SLOT_TAKEN, fieldErrors: { slotStart: SLOT_TAKEN } } };
    }
    deps.log("appointment insert failed", { error: (error as Error).name });
    return { status: 503, body: { ok: false, error: SAVE_FAILED } };
  }

  const slotLabel = formatSlot(start);
  const call: CallEmail = {
    name: appointment.name,
    email: appointment.email,
    company: appointment.company,
    topic: appointment.topic,
    slotLabel,
  };

  deps.defer(async () => {
    const [team, client] = await Promise.all([deps.sendTeamNotification(call, id), deps.sendClientConfirmation(call)]);
    const lastError = [team.error, client.error].filter(Boolean).join("; ") || undefined;
    if (team.state === "failed" || client.state === "failed") {
      deps.log("appointment notification failed", { id, team: team.state, client: client.state, lastError });
    }
    try {
      await deps.updateNotifications(id, {
        team: team.state,
        client: client.state,
        ...(lastError && { lastError }),
        updatedAt: deps.now(),
      });
    } catch (error) {
      deps.log("appointment notification status update failed", { id, error: (error as Error).name });
    }
  });

  return { status: 201, body: { ok: true, slotStart: start.toISOString(), slotLabel } };
}
