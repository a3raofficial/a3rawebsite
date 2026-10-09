import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader, Section, SectionHeading } from "@/components/ui/Section";
import { faqs, processStages } from "@/content/process";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "A3RA's five-stage process — discover, diagnose, build, deploy and evolve — designed to make every engagement predictable and low-risk.",
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="A predictable path from problem to working solution."
        intro="Five stages, agreed one at a time. You always know what we're doing, why, and what comes next."
      />

      <Section>
        <ol className="relative">
          {/* The progress line connecting the stages. */}
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-[1.15rem] w-px bg-gradient-to-b from-blue via-blue/40 to-gold/60 sm:left-[1.4rem]"
          />
          {processStages.map((stage) => (
            <li key={stage.number} className="relative pb-16 pl-14 last:pb-0 sm:pl-20">
              <span className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-full border border-line-strong bg-obsidian font-mono text-xs text-blue sm:size-12">
                {stage.number}
              </span>
              <Reveal className="grid gap-6 md:grid-cols-[1fr_1fr] md:gap-12">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{stage.title}</h2>
                  <p className="mt-4 text-lg leading-relaxed text-muted">{stage.description}</p>
                </div>
                <div className="rounded-2xl border border-line bg-surface p-6">
                  <h3 className="eyebrow">What to expect</h3>
                  <ul className="mt-4 space-y-3 text-muted">
                    {stage.expect.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-blue" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
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

      <ClosingCta />
    </>
  );
}
