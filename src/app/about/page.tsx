import type { Metadata } from "next";
import Image from "next/image";
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

const principles = [
  { title: "Problem-first", body: "Understand the root cause before recommending a solution." },
  {
    title: "Strategy meets execution",
    body: "The people shaping the solution stay involved in building it.",
  },
  {
    title: "Practical innovation",
    body: "Use AI and technology where they create real value, not because they're fashionable.",
  },
  {
    title: "Cost-conscious engineering",
    body: "Choose the right solution for the client's needs, budget and scale.",
  },
  {
    title: "Long-term partnership",
    body: "Help clients maintain, measure and improve what gets built.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Three disciplines. One team."
        intro="A3RA sits between a management consultancy and a software agency: we help you understand the problem, then we build what solves it."
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Why A3RA" title="Advice and execution shouldn't live in separate rooms." />
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
              <p>
                Too often, businesses get a strategy from one firm and the software from another — and the problem
                falls into the gap between them. Recommendations go unbuilt, or systems get built without anyone
                asking whether they solve the right problem.
              </p>
              <p>
                We started A3RA to close that gap: one team that diagnoses the problem, designs the solution, builds
                it and stays to make it work.
              </p>
            </div>
          </div>
          <Reveal>
            <Image
              src="/images/brand/a3ra-logo-web.png"
              alt="A3RA logo — Building a Brighter Era"
              width={951}
              height={826}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="mx-auto h-auto w-full max-w-md mix-blend-screen"
            />
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Building a Brighter Era"
          title="Powerful solutions, made accessible."
          intro="Our mission is to help businesses solve meaningful problems through clear strategy, intelligent technology and end-to-end execution — making powerful solutions more accessible, practical and cost-efficient."
        />
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">
          We want every ambitious business to have access to the strategic thinking and technical capability it needs
          to thrive in an increasingly intelligent world.
        </p>
        <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {principles.map((item) => (
            <li key={item.title} className="bg-obsidian p-6">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="founders">
        <SectionHeading
          eyebrow="The founders"
          title="How the three of us work together."
          intro="Akshat makes sure we understand the business and what the client needs. Aadit turns that into analysis — where the data points, what it costs, and where AI genuinely helps. Ashmit designs and builds the system that delivers it. Every engagement draws on all three."
        />
        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {founders.map((founder, i) => (
            <li key={founder.id}>
              <Reveal delay={i * 100} className="h-full">
                <FounderCard founder={founder} variant="full" />
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <ClosingCta
        title="Meet the team."
        body="The first conversation is with the founders directly. Tell us what you're working on."
      />
    </>
  );
}
