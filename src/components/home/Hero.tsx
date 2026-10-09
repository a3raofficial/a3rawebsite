import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { HeroVisual } from "@/components/home/HeroVisual";
import { Container } from "@/components/ui/Section";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:min-h-[100svh] lg:pb-28">
      {/* Fixed-size visual box: the 3D scene swaps in without any layout shift. */}
      <div className="absolute top-1/2 right-[-30%] w-[46rem] max-w-none -translate-y-1/2 opacity-70 sm:right-[-15%] lg:right-[-6%] lg:w-[46rem] lg:opacity-100">
        <HeroVisual />
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-transparent" />

      <Container className="relative">
        <p className="eyebrow">Strategy × Technology × Execution</p>
        <h1 className="mt-6 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-7xl lg:text-8xl">
          Big problems deserve <span className="text-aura">better solutions.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted text-pretty sm:text-xl">
          We help ambitious businesses turn complex problems into intelligent, working solutions — from first
          principles to deployment.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/contact" size="lg">
            Start a conversation
            <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </ButtonLink>
          <ButtonLink href="#what-we-do" size="lg" variant="secondary">
            Explore what we do
            <ArrowDown aria-hidden className="size-4 transition-transform group-hover:translate-y-0.5" />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
