import type { ObjectId } from "mongodb";
import type { Enquiry } from "@/lib/validation";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

/** Delivery state of an email tied to a lead. "skipped" = email not configured. */
export type NotificationState = "pending" | "sent" | "failed" | "skipped";

/** Shape of a document in the `leads` collection. */
export type Lead = Enquiry & {
  _id?: ObjectId;
  createdAt: Date;
  status: LeadStatus;
  source: string | null;
  /** Salted hash of the submitter's IP, used only for rate limiting. */
  ipHash: string;
  notifications: {
    team: NotificationState;
    client: NotificationState;
    /** Short error code/message from the last failed attempt; never contains lead content. */
    lastError?: string;
    updatedAt: Date;
  };
};
