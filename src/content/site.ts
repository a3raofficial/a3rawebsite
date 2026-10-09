/**
 * Site-wide configuration and contact details.
 * Values set to null are not yet decided; the UI hides or labels them
 * instead of showing placeholder data.
 */
export const site = {
  name: "A3RA",
  tagline: "Building a Brighter Era.",
  description:
    "A3RA is a strategy-led technology consultancy helping startups and growing businesses solve complex problems through software, AI, data and business process optimization.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Business inbox. Switch to an @a3ra.in address once the domain is set up. */
  contactEmail: "a3ra.official@gmail.com" as string | null,
  /** Discovery-call booking page (requests stored in MongoDB). */
  bookingUrl: "/contact/book",
  /** Expected reply time shown on the contact page. */
  responseTime: "within two working days",
} as const;

export const primaryCta = { label: "Let's Talk", href: "/contact" } as const;

export const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/projects" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
] as const;
