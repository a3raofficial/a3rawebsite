import type { Metadata } from "next";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader, Section, SectionHeading } from "@/components/ui/Section";
import { caseStudyStructure, projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "How A3RA documents its work: the business challenge, how we approached it, what we built, and what changed — with client details shared only when approved.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Case studies"
        title="Real work, described honestly."
        intro="We only publish projects that are real and approved for public display, and we're clear about whether something is client work, in progress, or independent."
        threads="projects"
      />

      {projects.length === 0 && (
        <Section>
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-line-strong px-6 py-16 text-center sm:px-16">
            <p className="eyebrow">Coming soon</p>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Our first case studies will be published here.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted text-pretty">
              In the meantime, we&apos;re happy to talk through relevant experience and how we&apos;d approach your
              problem.
            </p>
          </div>
        </Section>
      )}

      <Section>
        <SectionHeading eyebrow="How we document our work" title="Real problems. Clear decisions. Measurable outcomes." />
        <div className="mt-6 max-w-3xl space-y-3 text-lg leading-relaxed text-muted">
          <p>Every case study explains the challenge, how we approached it, what we built, and what changed as a result.</p>
          <p>Explore the thinking behind the solution—not just the final deliverable.</p>
        </div>

        {/* A framework, not a portfolio: one numbered sequence in a single frame. */}
        <ol
          aria-label="The six parts of every case study"
          className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3"
        >
          {caseStudyStructure.map((step, i) => (
            <li key={step.title} className="bg-obsidian">
              <Reveal delay={(i % 3) * 90} className="spotlight h-full p-7 transition-colors hover:bg-white/[0.02] sm:p-8">
                <span className="font-mono text-xs text-blue">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      <ClosingCta
        title="Have a similar challenge?"
        body="Tell us about it, even if it's still an early idea."
        cta={{ label: "Let's discuss your project", href: "/contact" }}
      />
    </>
  );
}
