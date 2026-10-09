import type { Metadata } from "next";
import { Container } from "@/components/ui/Section";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How A3RA collects, uses and stores the information you share through this website.",
  alternates: { canonical: "/privacy" },
};

/*
 * Describes only what the site actually does today. Update it whenever data
 * handling changes (e.g. analytics, new email provider), and have it reviewed
 * against applicable Indian data-protection requirements.
 */
const sections = [
  {
    title: "What we collect",
    body: [
      "When you submit the enquiry form, we collect the details you enter: your name, email address, optional company or website, the area you're interested in, your description of the problem, and optional budget and timeline ranges. We also record that you agreed to this notice and the time of your submission.",
      "When you request a discovery call, we collect your name, email address, optional company or website, what you'd like to discuss, and the time you chose.",
      "To prevent spam and abuse, we store a one-way, salted hash of your IP address. We cannot read your IP address from it.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "We use your details only to respond to your enquiry or call request, to schedule and hold the call, to follow up about the project you described, and to protect our forms from abuse. We do not sell your information or use it for unrelated marketing.",
    ],
  },
  {
    title: "Where it is stored",
    body: [
      "Enquiries and call requests are stored in a MongoDB Atlas cloud database. Emails are sent through Google's Gmail service, and calls take place on Google Meet. Access to this information is limited to the A3RA founders.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "We keep enquiry details for as long as needed to respond and to manage any resulting conversation or engagement. You can ask us to delete your details at any time.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can ask to see, correct or delete the information you've sent us by emailing us. Please don't include sensitive or confidential documents in the enquiry form — we'll agree a secure way to exchange them if we work together.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <Container className="max-w-3xl pt-36 pb-20 sm:pt-44 sm:pb-28">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Privacy notice</h1>
      <p className="mt-4 text-sm text-faint">Last updated: October 2026</p>
      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="mt-3 leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        {site.contactEmail && (
          <section>
            <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
            <p className="mt-3 leading-relaxed text-muted">
              For any privacy request, email{" "}
              <a href={`mailto:${site.contactEmail}`} className="text-ink underline underline-offset-4">
                {site.contactEmail}
              </a>
              .
            </p>
          </section>
        )}
      </div>
    </Container>
  );
}
