import type { Metadata } from "next";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { FounderCard } from "@/components/ui/FounderCard";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader, Section, SectionHeading } from "@/components/ui/Section";
import { founders } from "@/content/founders";

export const metadata: Metadata = {
  title: "Meet the Founders",
  description:
    "A3RA brings together business strategy, data and AI, and software engineering in one founding team.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="The people behind A3RA."
        intro="Business strategy, data and AI, and software engineering — three founders who decided to work as one."
        threads="about"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionHeading eyebrow="Why A3RA" title="Advice and execution shouldn't live in separate rooms." />
          <Reveal className="space-y-5 text-lg leading-relaxed text-muted lg:pt-12">
            <p>
              Too often, businesses get a strategy from one firm and the software from another — and the problem
              falls into the gap between them. Recommendations go unbuilt, or systems get built without anyone asking
              whether they solve the right problem.
            </p>
            <p>
              We started A3RA to close that gap: one team that diagnoses the problem, designs the solution, builds it
              and stays to make it work.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionHeading eyebrow="Building a Brighter Era" title="Powerful solutions, made accessible." />
          <Reveal className="space-y-5 text-lg leading-relaxed text-muted lg:pt-12">
            <p>
              Our mission is to help businesses solve meaningful problems through clear strategy, intelligent
              technology and end-to-end execution — making powerful solutions more accessible, practical and
              cost-efficient.
            </p>
            <p>
              We want every ambitious business to have access to the strategic thinking and technical capability it
              needs to thrive in an increasingly intelligent world.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section id="founders">
        <SectionHeading eyebrow="The founders" title="Three people, one room." />
        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {founders.map((founder, i) => (
            <li key={founder.id}>
              <Reveal delay={i * 120} className="h-full">
                <FounderCard founder={founder} variant="full" />
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <ClosingCta
        title="Talk to us directly."
        body="Every first conversation is with the founders — no account managers in between."
      />
    </>
  );
}
