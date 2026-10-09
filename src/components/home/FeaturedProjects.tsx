import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { projectCategories } from "@/content/projects";

/**
 * Selected work. No projects are published yet, so this presents the
 * kinds of work we take on and links to the Projects page.
 */
export function FeaturedProjects() {
  return (
    <Section id="work">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Selected work"
          title="Case studies are on their way."
          intro="We only publish work that is real and approved by the client. Our first case studies will appear here once they're ready to share."
        />
        <Link href="/projects" className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium">
          About our work
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <ul className="mt-16 grid gap-4 md:grid-cols-3">
        {projectCategories.map((category) => (
          <li key={category.title} className="rounded-2xl border border-dashed border-line-strong p-7">
            <p className="eyebrow text-faint">Coming soon</p>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">{category.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{category.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
