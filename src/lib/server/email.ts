import "server-only";
import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";
import type { Enquiry } from "@/lib/validation";
import type { NotificationState } from "@/types/lead";

/*
 * Transactional email via Gmail SMTP (App Password). When the a3ra.in
 * domain is set up, only this file and the env vars need to change.
 */

let transporter: Transporter | undefined;

function getTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  transporter ??= nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  return transporter;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function recipients(): string[] {
  return (process.env.LEAD_NOTIFICATION_RECIPIENTS ?? process.env.GMAIL_USER ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
}

export type EmailResult = { state: NotificationState; error?: string };

async function send(message: SendMailOptions): Promise<EmailResult> {
  const transport = getTransporter();
  if (!transport) return { state: "skipped", error: "email not configured" };
  try {
    await transport.sendMail({ from: `"A3RA" <${process.env.GMAIL_USER}>`, ...message });
    return { state: "sent" };
  } catch (error) {
    // Keep only a short code so no lead content ends up in logs or the DB.
    const code = (error as { code?: string; responseCode?: number }).code ?? "SEND_FAILED";
    return { state: "failed", error: String(code).slice(0, 80) };
  }
}

/** Internal notification to the A3RA team. Reply-To is the prospect. */
export function sendTeamNotification(lead: Enquiry, leadId: string): Promise<EmailResult> {
  const to = recipients();
  if (to.length === 0) return Promise.resolve({ state: "skipped", error: "no recipients" });

  const rows: Array<[string, string | undefined]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Company", lead.company],
    ["Wants to improve", lead.serviceInterest],
    ["Timeline", lead.timeline],
  ];
  const text = [
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    "",
    lead.problemDescription ?? "(No description given.)",
    "",
    `Lead ID: ${leadId}`,
  ].join("\n");
  const html = `
    <h2 style="font-family:sans-serif">New enquiry</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      ${rows
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${escapeHtml(v!)}</td></tr>`)
        .join("")}
    </table>
    <p style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(lead.problemDescription ?? "(No description given.)")}</p>
    <p style="font-family:sans-serif;color:#888;font-size:12px">Lead ID: ${leadId}</p>`;

  return send({
    to,
    replyTo: lead.email,
    subject: `New enquiry: ${lead.serviceInterest} — ${lead.name}`.slice(0, 150),
    text,
    html,
  });
}

/** Confirmation to the prospect. Contains no internal information. */
export function sendClientConfirmation(lead: Enquiry): Promise<EmailResult> {
  const firstName = lead.name.split(/\s+/)[0];
  const text = [
    `Hi ${firstName},`,
    "",
    "Thanks for getting in touch with A3RA. We've received your enquiry and one of the founders will reply personally.",
    "",
    "If you'd like to add anything in the meantime, just reply to this email.",
    "",
    "— The A3RA team",
    "Building a Brighter Era.",
  ].join("\n");
  const html = `
    <div style="font-family:sans-serif;line-height:1.6">
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>Thanks for getting in touch with A3RA. We've received your enquiry and one of the founders will reply personally.</p>
      <p>If you'd like to add anything in the meantime, just reply to this email.</p>
      <p>— The A3RA team<br><span style="color:#888">Building a Brighter Era.</span></p>
    </div>`;

  return send({
    to: lead.email,
    replyTo: process.env.GMAIL_USER,
    subject: "We've received your enquiry — A3RA",
    text,
    html,
  });
}

type CallRequest = { name: string; email: string; company?: string; topic: string; slotLabel: string };

/** Tells the team a discovery call was requested and what to do next. */
export function sendAppointmentTeamNotification(call: CallRequest, appointmentId: string): Promise<EmailResult> {
  const to = recipients();
  if (to.length === 0) return Promise.resolve({ state: "skipped", error: "no recipients" });

  const rows: Array<[string, string | undefined]> = [
    ["When", call.slotLabel],
    ["Name", call.name],
    ["Email", call.email],
    ["Company", call.company],
  ];
  const nextStep =
    "Next step: create a Google Calendar event with a Meet link for this time, invite the client (or reply to this email with the link), then set status to \"confirmed\" in Atlas. If you can't make it, reply with alternatives and set status to \"cancelled\" to free the slot.";
  const text = [
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    "",
    call.topic,
    "",
    nextStep,
    "",
    `Appointment ID: ${appointmentId}`,
  ].join("\n");
  const html = `
    <h2 style="font-family:sans-serif">Discovery call requested</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      ${rows
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${escapeHtml(v!)}</td></tr>`)
        .join("")}
    </table>
    <p style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(call.topic)}</p>
    <p style="font-family:sans-serif;background:#f4f5f8;padding:12px;border-radius:8px">${escapeHtml(nextStep)}</p>
    <p style="font-family:sans-serif;color:#888;font-size:12px">Appointment ID: ${appointmentId}</p>`;

  return send({
    to,
    replyTo: call.email,
    subject: `Call request: ${call.slotLabel} — ${call.name}`.slice(0, 150),
    text,
    html,
  });
}

/** Tells the prospect the request was received; the Meet link follows from the team. */
export function sendAppointmentClientConfirmation(call: CallRequest): Promise<EmailResult> {
  const firstName = call.name.split(/\s+/)[0];
  const lines = [
    `Thanks for requesting a discovery call with A3RA for ${call.slotLabel}.`,
    "We'll confirm by email shortly with a Google Meet link. If that time no longer works for us, we'll suggest alternatives.",
    "If you need to change anything, just reply to this email.",
  ];
  const text = [`Hi ${firstName},`, "", ...lines.flatMap((l) => [l, ""]), "— The A3RA team", "Building a Brighter Era."].join(
    "\n",
  );
  const html = `
    <div style="font-family:sans-serif;line-height:1.6">
      <p>Hi ${escapeHtml(firstName)},</p>
      ${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
      <p>— The A3RA team<br><span style="color:#888">Building a Brighter Era.</span></p>
    </div>`;

  return send({
    to: call.email,
    replyTo: process.env.GMAIL_USER,
    subject: `Call request received — ${call.slotLabel}`,
    text,
    html,
  });
}
