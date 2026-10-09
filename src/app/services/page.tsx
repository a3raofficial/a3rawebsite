import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { Reveal } from "@/components/ui/Reveal";
import { Container, PageHeader } from "@/components/ui/Section";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "AI Strategy, Custom Software & Process Optimization",
  description:
    "A3RA helps businesses decide what to build, build it, and improve the systems they already have — across strategy, AI, software engineering and process optimization.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Find the problem. Build the solution. Make it work."
        intro="Our work is organised into three pillars. Most clients start in one and move into another as the work progresses — the same team stays with you throughout."
      />

      <nav aria-label="Service pillars" className="border-y border-line">
        <Container className="flex gap-6 overflow-x-auto py-4 text-sm">
          {services.map((service) => (
            <a key={service.id} href={`#${service.id}`} className="shrink-0 text-muted transition-colors hover:text-ink">
              <span className="mr-2 font-mono text-xs text-faint">{service.number}</span>
              {service.title}
            </a>
          ))}
        </Container>
      </nav>

      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          aria-labelledby={`${service.id}-title`}
          className="scroll-mt-20 border-b border-line py-20 sm:py-28"
        >
          <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="font-mono text-sm text-blue">{service.number}</p>
              <h2 id={`${service.id}-title`} className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {service.title}
              </h2>
              <p className="mt-3 text-gold-soft/80">{service.forWho}</p>
              <p className="mt-6 text-lg leading-relaxed text-muted">{service.summary}</p>
              <ButtonLink href="/contact" variant={index === 0 ? "primary" : "secondary"} className="mt-8">
                Discuss your challenge
                <ArrowUpRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>

            <div className="space-y-4">
              <Reveal className="rounded-2xl border border-line bg-surface p-7">
                <h3 className="eyebrow">The problem</h3>
                <p className="mt-4 text-lg leading-relaxed">{service.problem}</p>
              </Reveal>
              <div className="grid gap-4 sm:grid-cols-2">
                <Reveal className="rounded-2xl border border-line bg-surface p-7">
                  <h3 className="eyebrow">Typical use cases</h3>
                  <ul className="mt-4 space-y-3 text-muted">
                    {service.useCases.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={100} className="rounded-2xl border border-line bg-surface p-7">
                  <h3 className="eyebrow">What we deliver</h3>
                  <ul className="mt-4 space-y-3 text-muted">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-blue" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
              <Reveal className="rounded-2xl border border-line p-7">
                <h3 className="eyebrow">How it begins</h3>
                <p className="mt-4 leading-relaxed text-muted">{service.start}</p>
              </Reveal>
            </div>
          </Container>
        </section>
      ))}

      <ClosingCta
        title="Not sure which one fits?"
        body="That's normal. Tell us about the problem and we'll help you work out where to start."
      />
    </>
  );
}
