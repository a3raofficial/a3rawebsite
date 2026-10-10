import { z } from "zod";
import { enquirySchema, type Enquiry } from "@/lib/validation";
import type { EmailResult } from "@/lib/server/email";
import type { Lead } from "@/types/lead";

/** Enquiries allowed per IP within the rate-limit window. */
export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/**
 * Server-side request schema: the shared form schema plus a honeypot and
 * optional source attribution. `.strict()` rejects any unexpected field.
 */
export const enquiryRequestSchema = enquirySchema
  .extend({
    /** Honeypot. Hidden from people; bots tend to fill it in. */
    website: z.string().max(500).optional(),
    source: z.string().trim().max(100).optional(),
  })
  .strict();

/** External effects, injected so the flow can be tested without a database or SMTP. */
export type LeadDeps = {
  countRecentByIp(ipHash: string, since: Date): Promise<number>;
  insertLead(lead: Lead): Promise<string>;
  updateNotifications(id: string, notifications: Lead["notifications"]): Promise<void>;
  sendTeamNotification(lead: Enquiry, id: string): Promise<EmailResult>;
  sendClientConfirmation(lead: Enquiry): Promise<EmailResult>;
  /** Runs work after the response is sent (Next's `after` in production). */
  defer(task: () => Promise<void>): void;
  now(): Date;
  log(message: string, meta?: Record<string, unknown>): void;
};

export type SubmitResult =
  | { status: 201; body: { ok: true } }
  | { status: 400; body: { ok: false; error: string; fieldErrors?: Record<string, string> } }
  | { status: 429; body: { ok: false; error: string } }
  | { status: 503; body: { ok: false; error: string } };

const SAVE_FAILED = "We couldn't save your enquiry right now. Please try again shortly, or email us directly.";

export async function submitEnquiry(raw: unknown, ipHash: string, deps: LeadDeps): Promise<SubmitResult> {
  const parsed = enquiryRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: 400, body: { ok: false, error: "Please check the highlighted fields.", fieldErrors } };
  }

  const { website, source, ...enquiry } = parsed.data;

  // Honeypot filled: accept silently so bots get no signal, but store nothing.
  if (website) {
    deps.log("enquiry discarded by honeypot");
    return { status: 201, body: { ok: true } };
  }

  const now = deps.now();
  try {
    const recent = await deps.countRecentByIp(ipHash, new Date(now.getTime() - RATE_LIMIT_WINDOW_MS));
    if (recent >= RATE_LIMIT_MAX) {
      return {
        status: 429,
        body: { ok: false, error: "We've received several enquiries from you recently. Please try again later." },
      };
    }
  } catch (error) {
    deps.log("rate-limit check failed", { error: (error as Error).name });
    return { status: 503, body: { ok: false, error: SAVE_FAILED } };
  }

  const lead: Lead = {
    ...enquiry,
    email: enquiry.email.toLowerCase(),
    createdAt: now,
    status: "new",
    source: source ?? null,
    ipHash,
    notifications: { team: "pending", client: "pending", updatedAt: now },
  };

  // Persist first: an email failure must never lose the enquiry.
  let id: string;
  try {
    id = await deps.insertLead(lead);
  } catch (error) {
    deps.log("lead insert failed", { error: (error as Error).name });
    return { status: 503, body: { ok: false, error: SAVE_FAILED } };
  }

  deps.defer(async () => {
    const [team, client] = await Promise.all([
      deps.sendTeamNotification(lead, id),
      deps.sendClientConfirmation(lead),
    ]);
    const lastError = [team.error, client.error].filter(Boolean).join("; ") || undefined;
    if (team.state === "failed" || client.state === "failed") {
      deps.log("lead notification failed", { id, team: team.state, client: client.state, lastError });
    }
    try {
      await deps.updateNotifications(id, {
        team: team.state,
        client: client.state,
        ...(lastError && { lastError }),
        updatedAt: deps.now(),
      });
    } catch (error) {
      deps.log("notification status update failed", { id, error: (error as Error).name });
    }
  });

  return { status: 201, body: { ok: true } };
}
