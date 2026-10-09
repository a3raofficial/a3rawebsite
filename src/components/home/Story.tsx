"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight, RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { StoryCanvas } from "@/components/three/stage/StoryCanvas";
import { setStoryActive, storyState } from "@/components/three/stage/story-state";
import { approachSection, closing, disciplines, disciplinesSection, hero, introSteps } from "@/content/home";

const TANGLE = { tangle: 1, bundles: 0, word: 0, braid: 0 };

/**
 * The homepage. On load the threads tell the whole story by themselves
 * (tangle → untangled → woven into A3RA); scrolling then carries the same
 * threads through the rest of the page. Native scrolling, real HTML text.
 */
export function Story() {
  const root = useRef<HTMLDivElement>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);

  const setStep = useCallback((step: number) => {
    root.current?.querySelectorAll<HTMLElement>("[data-step-item]").forEach((el, i) => {
      el.toggleAttribute("data-active", i <= step);
    });
  }, []);

  const playIntro = useCallback(() => {
    intro.current?.kill();
    Object.assign(storyState.intro, TANGLE);
    setStep(0);
    intro.current = gsap
      .timeline({ delay: 0.5 })
      .to(storyState.intro, { tangle: 0, bundles: 1, duration: 2, ease: "power2.inOut" }, 1)
      .call(() => setStep(1), [], 1)
      .to(storyState.intro, { bundles: 0, word: 1, duration: 2.4, ease: "power3.inOut" }, 4)
      .call(() => setStep(2), [], 4);
  }, [setStep]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      Object.assign(storyState.intro, { tangle: 0, bundles: 0, word: 1, braid: 0 });
      setStep(2);
    } else {
      playIntro();
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          storyState.progress = self.progress * 3;
        },
      });
      // Keep rendering until the story has fully scrolled away, not just reached its end.
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => setStoryActive(self.isActive),
      });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-hero]", {
          autoAlpha: 0,
          y: -60,
          ease: "none",
          scrollTrigger: { trigger: "[data-hero-section]", start: "top top", end: "bottom 35%", scrub: true },
        });
        gsap.utils.toArray<HTMLElement>("[data-beat]").forEach((section) => {
          const lines = section.querySelectorAll("[data-beat-line]");
          const last = section.hasAttribute("data-beat-last");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.8 },
          });
          tl.fromTo(
            lines,
            { autoAlpha: 0, y: 50 },
            { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.3, ease: "power2.out" },
          );
          if (last) tl.to({}, { duration: 0.7 });
          else tl.to(lines, { autoAlpha: 0, y: -50, stagger: 0.03, duration: 0.3, ease: "power2.in" }, 0.7);
        });
      });
    }, el);

    return () => {
      ctx.revert();
      intro.current?.kill();
      setStoryActive(false);
    };
  }, [playIntro, setStep]);

  return (
    <>
      <StoryCanvas />
      <div ref={root} className="relative z-10">
        {/* Hero — the intro plays here on load */}
        <section data-hero-section className="relative flex min-h-svh items-end pb-16 sm:items-center sm:pb-0">
          <Container>
            <div data-hero className="max-w-2xl">
              <p className="eyebrow">{hero.eyebrow}</p>
              <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-7xl">
                {hero.title}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted text-pretty">{hero.body}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/contact" size="lg">
                  Start a conversation
                  <ArrowUpRight aria-hidden className="size-4" />
                </ButtonLink>
              </div>

              {/* Follow-along for the intro animation */}
              <div className="mt-12 flex items-center gap-5">
                <ol aria-label="What the threads show" className="flex flex-1 gap-3 sm:max-w-md">
                  {introSteps.map((step) => (
                    <li key={step} data-step-item className="group flex-1">
                      <span className="block h-px overflow-hidden bg-line-strong">
                        <span className="block h-full origin-left scale-x-0 bg-gradient-to-r from-blue to-gold transition-transform duration-[1600ms] ease-out group-data-[active]:scale-x-100" />
                      </span>
                      <span className="mt-2 block font-mono text-[0.68rem] tracking-[0.14em] text-faint uppercase transition-colors duration-700 group-data-[active]:text-ink">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={playIntro}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-xs text-muted transition-colors hover:border-blue/60 hover:text-ink"
                >
                  <RotateCcw aria-hidden className="size-3.5" />
                  Replay
                </button>
              </div>
            </div>
          </Container>
        </section>

        {/* 01 — the threads unravel into three bundles */}
        <section data-beat className="relative h-[120svh]">
          <div className="sticky top-0 flex h-svh items-end pb-20 sm:items-center sm:pb-0">
            <Container>
              <div className="max-w-xl">
                <p data-beat-line className="eyebrow text-blue-soft">
                  {disciplinesSection.eyebrow}
                </p>
                <h2 data-beat-line className="mt-5 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
                  {disciplinesSection.title}
                </h2>
                <ul className="mt-10 space-y-5">
                  {disciplines.map((d, i) => (
                    <li key={d.name} data-beat-line>
                      <Link href={d.href} className="group flex items-baseline gap-4">
                        <span className={`font-mono text-xs ${d.colour}`}>0{i + 1}</span>
                        <span className={`text-2xl font-medium tracking-tight sm:text-3xl ${d.colour}`}>{d.name}</span>
                        <span className="text-muted transition-colors group-hover:text-ink">{d.line}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Container>
          </div>
        </section>

        {/* 02 — the bundles braid into one rope */}
        <section data-beat className="relative h-[120svh]">
          <div className="sticky top-0 flex h-svh items-end pb-20 sm:items-center sm:pb-0">
            <Container>
              <div className="max-w-xl">
                <p data-beat-line className="eyebrow text-blue-soft">
                  {approachSection.eyebrow}
                </p>
                <h2 data-beat-line className="mt-5 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
                  {approachSection.title}
                </h2>
                <p data-beat-line className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                  {approachSection.body}
                </p>
                <Link data-beat-line href="/process" className="group mt-8 inline-flex items-center gap-2 font-medium">
                  How we work
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Container>
          </div>
        </section>

        {/* 03 — the rope weaves back into A3RA */}
        <section data-beat data-beat-last className="relative h-[120svh]">
          <div className="sticky top-0 flex h-svh items-end pb-20 sm:items-center sm:pb-0">
            <Container>
              <div className="max-w-xl">
                <h2 data-beat-line className="text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-7xl">
                  {closing.title}
                </h2>
                <p data-beat-line className="mt-6 text-lg text-muted">
                  {closing.body}
                </p>
                <div data-beat-line className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/contact" size="lg">
                    Let&apos;s talk
                    <ArrowUpRight aria-hidden className="size-4" />
                  </ButtonLink>
                  <ButtonLink href="/contact/book" size="lg" variant="secondary">
                    Book a call
                  </ButtonLink>
                </div>
              </div>
            </Container>
          </div>
        </section>
      </div>
    </>
  );
}
