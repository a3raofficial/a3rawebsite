import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Mail, Phone } from "lucide-react";
import { ProjectEnquiryForm } from "@/components/forms/ProjectEnquiryForm";
import { buttonClasses } from "@/components/ui/Button";
import { Container, RisingWords } from "@/components/ui/Section";
import { founders, telHref } from "@/content/founders";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Discuss Your Project",
  description:
    "Tell A3RA what you're trying to solve. Send a short enquiry or book a discovery call with the founders.",
  alternates: { canonical: "/contact" },
};

const nextSteps = [
  "We read every enquiry personally.",
  `We reply ${site.responseTime}, usually to suggest a short introductory call.`,
  "On the call we focus on understanding the problem — not selling a solution.",
];

export default function ContactPage() {
  return (
    <div className="pt-32 pb-20 sm:pt-40 sm:pb-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            <RisingWords text="Tell us what you're trying to solve." />
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            You don&apos;t need a specification or a clear solution in mind. A few sentences about the problem is
            enough to start.
          </p>

          <div className="mt-10 space-y-4">
            <div className="spotlight rounded-2xl border border-line bg-surface p-6">
              <div className="flex items-center gap-3">
                <Calendar aria-hidden className="size-5 text-blue" />
                <h2 className="font-semibold">Prefer to talk first?</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Pick a time for a short Google Meet call with the founders.
              </p>
              <Link href={site.bookingUrl} className={buttonClasses("secondary", "md", "mt-5")}>
                Book a discovery call
              </Link>
            </div>

            {site.contactEmail && (
              <a
                href={`mailto:${site.contactEmail}`}
                className="flex items-center gap-3 rounded-2xl border border-line p-6 transition-colors hover:border-line-strong"
              >
                <Mail aria-hidden className="size-5 text-gold" />
                <span>{site.contactEmail}</span>
              </a>
            )}

            <div className="spotlight rounded-2xl border border-line p-6">
              <div className="flex items-center gap-3">
                <Phone aria-hidden className="size-5 text-blue" />
                <h2 className="font-semibold">Call a founder</h2>
              </div>
              <ul className="mt-4 divide-y divide-line text-sm">
                {founders
                  .filter((f) => f.phone)
                  .map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                      <span>{f.name}</span>
                      <a href={telHref(f.phone!)} className="shrink-0 text-muted hover:text-ink">
                        {f.phone}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-3xl border border-line-strong bg-surface p-6 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">Project enquiry</h2>
          <p className="mt-2 mb-8 text-sm text-muted">Takes about two minutes.</p>
          <ProjectEnquiryForm />
        </div>
      </Container>

      <Container className="mt-20 border-t border-line pt-12">
        <h2 className="eyebrow">What happens next</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {nextSteps.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="font-mono text-sm text-blue">{String(i + 1).padStart(2, "0")}</span>
              <p className="leading-relaxed text-muted">{step}</p>
            </li>
          ))}
        </ol>
      </Container>
    </div>
  );
}
