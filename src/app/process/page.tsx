import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { PageHeader, Section, SectionHeading } from "@/components/ui/Section";
import { faqs, processStages } from "@/content/process";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "A3RA's six-stage process — discover, define, design, build, launch and improve — with clear scope, defined milestones and a deliverable at every stage.",
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="A predictable path from problem to working solution."
        intro="Six stages, each with a defined deliverable. Scope and milestones are agreed up front, and you hear from us regularly along the way."
        threads="process"
      />

      <Section>
        <ProcessTimeline stages={processStages} />
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHeading eyebrow="FAQ" title="Common questions." />
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <Plus aria-hidden className="size-5 shrink-0 text-muted transition-transform group-open:rotate-45" />
                </summary>
                <p className="pb-6 leading-relaxed text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      <ClosingCta
        title="Stage one is a conversation."
        body="Pick a time that suits you and we'll start by understanding the challenge."
        cta={{ label: "Book a discovery call", href: "/contact/book" }}
      />
    </>
  );
}
