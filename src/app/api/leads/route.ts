import { ObjectId } from "mongodb";
import { after, type NextRequest } from "next/server";
import { sendClientConfirmation, sendTeamNotification } from "@/lib/email";
import { clientIp, hashIp, json, readJsonBody } from "@/lib/http";
import { submitEnquiry, type LeadDeps } from "@/lib/leads";
import { getLeadsCollection } from "@/lib/mongodb";

const deps: LeadDeps = {
  async countRecentByIp(ipHash, since) {
    const leads = await getLeadsCollection();
    return leads.countDocuments({ ipHash, createdAt: { $gte: since } });
  },
  async insertLead(lead) {
    const leads = await getLeadsCollection();
    const result = await leads.insertOne(lead);
    return result.insertedId.toHexString();
  },
  async updateNotifications(id, notifications) {
    const leads = await getLeadsCollection();
    await leads.updateOne({ _id: new ObjectId(id) }, { $set: { notifications } });
  },
  sendTeamNotification,
  sendClientConfirmation,
  defer: (task) => after(task),
  now: () => new Date(),
  // Never log enquiry contents or personal data.
  log: (message, meta) => console.warn(`[leads] ${message}`, meta ?? ""),
};

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  if ("error" in body) return body.error;

  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt || !process.env.MONGODB_URI) {
    deps.log("server misconfigured: missing RATE_LIMIT_SALT or MONGODB_URI");
    return json({ ok: false, error: "Enquiries are temporarily unavailable. Please email us directly." }, 503);
  }

  const result = await submitEnquiry(body.data, hashIp(clientIp(request), salt), deps);
  return json(result.body, result.status);
}
