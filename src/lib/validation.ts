import { z } from "zod";

/**
 * Enquiry form schema. Shared by the browser form and, in the backend
 * phase, the server endpoint — the server must re-validate every request.
 */
export const serviceInterests = [
  "AI strategy",
  "Custom software",
  "Business optimization",
  "Product development",
  "Not sure yet",
] as const;

export const budgetRanges = [
  "Under ₹1 lakh",
  "₹1–5 lakh",
  "₹5–15 lakh",
  "Above ₹15 lakh",
  "Not sure yet",
] as const;

export const timelines = ["As soon as possible", "Within 1–3 months", "3–6 months", "Just exploring"] as const;

// Single-line fields must not contain line breaks or other control characters.
const noControlChars = /^[^\u0000-\u001f\u007f]*$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .regex(noControlChars, "Please remove any line breaks.")
    .optional()
    .transform((v) => (v ? v : undefined));

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(100)
    .regex(noControlChars, "Please remove any line breaks."),
  email: z.email("Please enter a valid email address.").max(200),
  company: optionalText(200),
  serviceInterest: z.enum(serviceInterests, { error: "Please choose an area of interest." }),
  problemDescription: z
    .string()
    .trim()
    .min(20, "Please tell us a little more — at least a sentence or two.")
    .max(3000, "Please keep this under 3,000 characters."),
  budgetRange: z.enum(budgetRanges).optional(),
  timeline: z.enum(timelines).optional(),
  privacyConsent: z.literal(true, { error: "Please confirm you agree to us storing your details." }),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;

/** Discovery-call request. Shares contact fields with the enquiry form. */
export const appointmentSchema = enquirySchema
  .pick({ name: true, email: true, company: true, privacyConsent: true })
  .extend({
    topic: z
      .string()
      .trim()
      .min(10, "Please add a sentence about what you'd like to discuss.")
      .max(1000, "Please keep this under 1,000 characters."),
    slotStart: z.iso.datetime({ error: "Please choose a time." }),
  });

export type AppointmentInput = z.input<typeof appointmentSchema>;
export type AppointmentRequest = z.output<typeof appointmentSchema>;
