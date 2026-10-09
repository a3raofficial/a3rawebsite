import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { processStages } from "@/content/process";

export function ProcessOverview() {
  return (
    <Section id="approach">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Our approach"
          title="Problem first. Then the right solution."
          intro="Every engagement follows the same five stages, so you always know where things stand and what comes next."
        />
        <Link href="/process" className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium">
          How we work
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
        {processStages.map((stage, i) => (
          <li key={stage.number} className="bg-obsidian">
            <Reveal delay={i * 80} className="flex h-full flex-col p-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-blue">{stage.number}</span>
                <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-blue/50 to-gold/30" />
              </div>
              <h3 className="mt-8 text-xl font-semibold tracking-tight">{stage.short}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{stage.description}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
