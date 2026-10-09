import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { primaryCta } from "@/content/site";

type ClosingCtaProps = {
  /** Required and page-specific, so no two pages end with the same words. */
  title: string;
  body: string;
  cta?: { label: string; href: string };
};

/** Final call to action at the end of each inner page. */
export function ClosingCta({ title, body, cta = { label: "Start a conversation", href: primaryCta.href } }: ClosingCtaProps) {
  return (
    <section className="border-t border-line py-20 sm:py-28">
      <Container>
        <div className="spotlight relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center sm:px-16 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue/25 to-gold/20 blur-3xl"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted text-pretty">{body}</p>
            <ButtonLink href={cta.href} size="lg" className="mt-10">
              {cta.label}
              <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
