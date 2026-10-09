import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { primaryCta } from "@/content/site";

type ClosingCtaProps = {
  title?: string;
  body?: string;
};

/** Final call to action shared by every marketing page. */
export function ClosingCta({
  title = "Have a problem worth solving?",
  body = "Tell us what you're trying to fix or build. We'll help you work out whether it's worth solving, and how.",
}: ClosingCtaProps) {
  return (
    <section className="border-t border-line py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center sm:px-16 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue/25 to-gold/20 blur-3xl"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted text-pretty">{body}</p>
            <ButtonLink href={primaryCta.href} size="lg" className="mt-10">
              Start a conversation
              <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
