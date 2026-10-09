import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Hero } from "@/components/home/Hero";
import { ProcessOverview } from "@/components/home/ProcessOverview";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { FounderCard } from "@/components/ui/FounderCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { founders } from "@/content/founders";
import { services } from "@/content/services";

const disciplines = [
  {
    title: "Strategy",
    body: "We start by understanding the business and the real problem, so the solution fits your goals and budget.",
  },
  {
    title: "Data & AI",
    body: "We use analysis and AI where they create measurable value — not because they're fashionable.",
  },
  {
    title: "Engineering",
    body: "The people who shape the solution also build, deploy and support it. Nothing gets lost in a handover.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionHeading
            eyebrow="The problem"
            title="More tools won't fix the wrong problem."
          />
          <Reveal className="space-y-6 text-lg leading-relaxed text-muted lg:pt-10">
            <p>
              Traditional consultants often advise, then leave implementation to you. Development agencies build what
              they&apos;re asked to build, without asking whether it solves the underlying problem.
            </p>
            <p>
              <span className="text-ink">A3RA does both.</span> We partner with startups and growing businesses to
              uncover bottlenecks, identify opportunities, and turn the right ideas into working technology.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section id="what-we-do" className="scroll-mt-20">
        <SectionHeading
          eyebrow="What we do"
          title="Three ways we help."
          intro="Whether you're deciding what to build, ready to build it, or improving what already exists."
        />
        <ul className="mt-16 grid gap-4 lg:grid-cols-3">
          {services.map((service, i) => (
            <li key={service.id}>
              <Reveal delay={i * 100} className="h-full">
                <ServiceCard service={service} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <ProcessOverview />

      <FeaturedProjects />

      <Section>
        <SectionHeading
          eyebrow="Why A3RA"
          title={
            <>
              One team. From the real problem to a <span className="text-aura">working solution.</span>
            </>
          }
        />
        <ul className="mt-16 grid gap-10 md:grid-cols-3">
          {disciplines.map((item, i) => (
            <li key={item.title}>
              <Reveal delay={i * 100} className="border-t border-line-strong pt-6">
                <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{item.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="The founders"
            title="Business, data and engineering in one room."
          />
          <Link href="/about" className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium">
            Meet the team
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {founders.map((founder, i) => (
            <li key={founder.id}>
              <Reveal delay={i * 100} className="h-full">
                <FounderCard founder={founder} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <ClosingCta />
    </>
  );
}
