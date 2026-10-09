import type { Metadata } from "next";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { PageHeader, Section, SectionHeading } from "@/components/ui/Section";
import { caseStudyStructure, projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Selected Projects & Case Studies",
  description:
    "How A3RA documents its work: real projects, approved by clients, with the problem, approach and outcome described honestly.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Work"
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
        <SectionHeading
          eyebrow="How we document work"
          title="Every case study answers the same questions."
          intro="So you can see not just what was built, but why — and what actually changed."
        />
        <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {caseStudyStructure.map((step, i) => (
            <li key={step.title} className="spotlight bg-obsidian p-7">
              <span className="font-mono text-xs text-blue">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <ClosingCta title="Working on something similar?" body="Tell us about it, even if it's still an early idea." />
    </>
  );
}
