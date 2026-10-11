import { z } from "zod";

/**
 * Enquiry form schema. Shared by the browser form and, in the backend
 * phase, the server endpoint — the server must re-validate every request.
 */
/** "What would you like to improve?" — labels are stored as-is with the lead. */
export const serviceInterests = [
  "Automate a repetitive business process",
  "Improve reporting or business intelligence",
  "Explore AI or machine learning",
  "Build a website, application, or internal tool",
  "Connect existing systems or improve a workflow",
  "Improve an existing product",
  "Not sure yet — need help defining the problem",
] as const;

export const timelines = [
  "As soon as possible",
  "Within one month",
  "Within three months",
  "Later this year",
  "Just exploring options",
] as const;

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
  serviceInterest: z.enum(serviceInterests, { error: "Please choose what you'd like to improve." }),
  // Optional: visitors may not be able to describe the problem yet.
  problemDescription: z
    .string()
    .trim()
    .max(3000, "Please keep this under 3,000 characters.")
    .optional()
    .transform((v) => (v ? v : undefined)),
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
