import type { ObjectId } from "mongodb";
import type { NotificationState } from "@/types/lead";

/**
 * "requested" and "confirmed" hold the slot; set "cancelled" in Atlas to free it.
 * A unique partial index on slotStart enforces one active booking per slot.
 */
export type AppointmentStatus = "requested" | "confirmed" | "cancelled" | "completed";
export const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = ["requested", "confirmed"];

/** Shape of a document in the `appointments` collection. */
export type Appointment = {
  _id?: ObjectId;
  createdAt: Date;
  name: string;
  email: string;
  company?: string;
  topic: string;
  slotStart: Date;
  slotEnd: Date;
  timeZone: string;
  status: AppointmentStatus;
  privacyConsent: true;
  source: string | null;
  ipHash: string;
  notifications: {
    team: NotificationState;
    client: NotificationState;
    lastError?: string;
    updatedAt: Date;
  };
};
