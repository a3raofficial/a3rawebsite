import { ObjectId } from "mongodb";
import { after, type NextRequest } from "next/server";
import { submitAppointment, type AppointmentDeps } from "@/lib/appointments";
import { sendAppointmentClientConfirmation, sendAppointmentTeamNotification } from "@/lib/server/email";
import { clientIp, hashIp, json, readJsonBody } from "@/lib/server/http";
import { getAppointmentsCollection } from "@/lib/server/mongodb";
import { ACTIVE_APPOINTMENT_STATUSES } from "@/types/appointment";

const deps: AppointmentDeps = {
  async countRecentByIp(ipHash, since) {
    const appointments = await getAppointmentsCollection();
    return appointments.countDocuments({ ipHash, createdAt: { $gte: since } });
  },
  async countOverlapping(start, end) {
    const appointments = await getAppointmentsCollection();
    return appointments.countDocuments({
      status: { $in: ACTIVE_APPOINTMENT_STATUSES },
      slotStart: { $lt: end },
      slotEnd: { $gt: start },
    });
  },
  async insertAppointment(appointment) {
    const appointments = await getAppointmentsCollection();
    const result = await appointments.insertOne(appointment);
    return result.insertedId.toHexString();
  },
  async updateNotifications(id, notifications) {
    const appointments = await getAppointmentsCollection();
    await appointments.updateOne({ _id: new ObjectId(id) }, { $set: { notifications } });
  },
  sendTeamNotification: sendAppointmentTeamNotification,
  sendClientConfirmation: sendAppointmentClientConfirmation,
  defer: (task) => after(task),
  now: () => new Date(),
  // Never log request contents or personal data.
  log: (message, meta) => console.warn(`[appointments] ${message}`, meta ?? ""),
};

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  if ("error" in body) return body.error;

  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt || !process.env.MONGODB_URI) {
    deps.log("server misconfigured: missing RATE_LIMIT_SALT or MONGODB_URI");
    return json({ ok: false, error: "Booking is temporarily unavailable. Please email us directly." }, 503);
  }

  const result = await submitAppointment(body.data, hashIp(clientIp(request), salt), deps);
  return json(result.body, result.status);
}
