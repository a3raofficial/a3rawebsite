import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { Reveal } from "@/components/ui/Reveal";
import { Container, PageHeader } from "@/components/ui/Section";
import { services, type Service } from "@/content/services";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Strategy, Data & AI and Software Engineering",
  description:
    "A3RA brings business strategy, data and AI, and software engineering together — from deciding what to build to analytics, automation and reliable custom software.",
  alternates: { canonical: "/services" },
};

const accentText: Record<Service["accent"], string> = { gold: "text-gold", ink: "text-ink", blue: "text-blue" };
const accentDot: Record<Service["accent"], string> = { gold: "bg-gold", ink: "bg-ink", blue: "bg-blue" };

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Three ways we can help."
        intro="Deciding what to build, building it, or improving what already exists. Most clients start in one discipline and move into another as the work progresses."
        threads="services"
      />

      <nav aria-label="Disciplines" className="border-y border-line">
        <Container className="flex gap-6 overflow-x-auto py-4 text-sm">
          {services.map((service) => (
            <a key={service.id} href={`#${service.id}`} className="shrink-0 text-muted transition-colors hover:text-ink">
              <span className={cn("mr-2 font-mono text-xs", accentText[service.accent])}>{service.number}</span>
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
              <p className={cn("font-mono text-sm", accentText[service.accent])}>{service.number}</p>
              <h2 id={`${service.id}-title`} className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {service.title}
              </h2>
              <p className={cn("mt-3 text-lg", accentText[service.accent])}>{service.tagline}</p>
              <p className="mt-6 leading-relaxed text-muted">{service.problem}</p>
              <ButtonLink href="/contact" variant={index === 0 ? "primary" : "secondary"} className="mt-8">
                Discuss your challenge
                <ArrowUpRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Reveal className="spotlight rounded-2xl border border-line bg-surface p-7">
                <h3 className="eyebrow">Where it helps</h3>
                <ul className="mt-4 space-y-3 text-muted">
                  {service.useCases.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden className={cn("mt-2.5 size-1 shrink-0 rounded-full", accentDot[service.accent])} />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={100} className="spotlight rounded-2xl border border-line bg-surface p-7">
                <h3 className="eyebrow">What this can include</h3>
                <ul className="mt-4 space-y-3 text-muted">
                  {service.offerings.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden className={cn("mt-2.5 size-1 shrink-0 rounded-full", accentDot[service.accent])} />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </Container>
        </section>
      ))}

      <Container>
        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-faint">
          Every engagement is scoped to the problem in front of us — not every item above applies to every project, and
          we&apos;ll say so plainly if something isn&apos;t the right fit.
        </p>
      </Container>

      <ClosingCta
        title="Not sure which one fits?"
        body="That's normal. Tell us about the problem and we'll help you work out where to start."
      />
    </>
  );
}
