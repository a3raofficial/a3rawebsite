"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight, RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { StoryCanvas } from "@/components/three/StoryCanvas";
import { setStoryActive, storyState } from "@/components/three/story-state";
import { approachSection, closing, disciplines, disciplinesSection, hero, introSteps } from "@/content/home";
import { booking } from "@/content/booking";
import { site } from "@/content/site";
import { EnquiryDialog } from "@/components/forms/EnquiryDialog";
import { cn } from "@/lib/cn";

const TANGLE = { tangle: 1, bundles: 0, word: 0, braid: 0 };

/** Discipline accents match the thread bundles: gold, white, blue. */
const accentText = { gold: "text-gold", ink: "text-ink", blue: "text-blue" } as const;
const accentBorder = { gold: "border-gold/50", ink: "border-ink/50", blue: "border-blue/60" } as const;

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
    root.current?.removeAttribute("data-intro-done");
    intro.current = gsap
      .timeline({ delay: 0.5 })
      .to(storyState.intro, { tangle: 0, bundles: 1, duration: 2, ease: "power2.inOut" }, 1)
      .call(() => setStep(1), [], 1)
      .to(storyState.intro, { bundles: 0, word: 1, duration: 2.4, ease: "power3.inOut" }, 4)
      .call(() => setStep(2), [], 4)
      // The moment A3RA is woven: an energy discharge from the wordmark.
      .call(() => (storyState.surge = performance.now()), [], 5.9)
      .call(() => root.current?.setAttribute("data-intro-done", ""), [], 6.6);
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
      <div ref={root} className="group/story relative z-10">
        {/* Hero — the intro plays here on load */}
        <section data-hero-section className="relative flex min-h-svh items-end pb-16 landscape:items-center landscape:pb-0">
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
              <p className="mt-5 hidden text-xs text-faint opacity-0 transition-opacity duration-1000 group-data-[intro-done]/story:opacity-100 lg:block">
                Psst — there&apos;s a loose thread on the A. Pull it.
              </p>
            </div>
          </Container>
        </section>

        {/* 01 — What we bring: the threads unravel into three bundles */}
        <section data-beat className="relative h-[140svh]">
          <div className="sticky top-0 flex h-svh items-end pb-14 landscape:items-center landscape:pb-0">
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent landscape:hidden" />
            <Container className="relative">
              <div className="grid gap-x-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div>
                <p data-beat-line className="eyebrow text-blue-soft">
                  {disciplinesSection.eyebrow}
                </p>
                <h2 data-beat-line className="mt-4 text-3xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl">
                  {disciplinesSection.title}
                </h2>
                <p data-beat-line className="mt-5 hidden max-w-xl leading-relaxed text-muted sm:block">
                  {disciplinesSection.body}
                </p>
                </div>
                <ul className="mt-6 space-y-1 sm:mt-8 lg:mt-2">
                  {disciplines.map((d, i) => (
                    <li key={d.name} data-beat-line>
                      <Link
                        href={d.href}
                        className={cn(
                          "group -mx-3 block rounded-xl border-l-2 px-3 py-2.5 transition-colors duration-300 hover:bg-white/[0.035] focus-visible:bg-white/[0.035] sm:py-3",
                          accentBorder[d.accent],
                        )}
                        onPointerEnter={() => (storyState.focus = i)}
                        onPointerLeave={() => (storyState.focus = -1)}
                        onFocus={() => (storyState.focus = i)}
                        onBlur={() => (storyState.focus = -1)}
                      >
                        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                          <span className={cn("font-mono text-xs", accentText[d.accent])}>0{i + 1}</span>
                          <span className={cn("text-xl font-medium tracking-tight sm:text-2xl", accentText[d.accent])}>
                            {d.name}
                          </span>
                          <span className="text-ink/90 italic">{d.tagline}</span>
                          <ArrowRight
                            aria-hidden
                            className="size-4 self-center text-faint opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                          />
                        </span>
                        <span className="mt-1 hidden max-w-xl text-sm leading-relaxed text-muted sm:block">
                          {d.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="lg:col-span-2 lg:mt-8 lg:flex lg:items-baseline lg:gap-8">
                  <p data-beat-line className="mt-6 max-w-xl font-medium text-ink sm:mt-8 lg:mt-0">
                    {disciplinesSection.closingLine}
                  </p>
                  <Link
                    data-beat-line
                    href={disciplinesSection.cta.href}
                    className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-soft hover:text-ink lg:mt-0"
                  >
                    {disciplinesSection.cta.label}
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Container>
          </div>
        </section>

        {/* 02 — How we work: the bundles braid into one rope */}
        <section data-beat className="relative h-[130svh]">
          <div className="sticky top-0 flex h-svh items-end pb-16 landscape:items-center landscape:pb-0">
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent landscape:hidden" />
            <Container className="relative">
              <div className="max-w-xl">
                <p data-beat-line className="eyebrow text-blue-soft">
                  {approachSection.eyebrow}
                </p>
                <h2 data-beat-line className="mt-4 text-3xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl">
                  {approachSection.title}
                </h2>
                {approachSection.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} data-beat-line className="mt-5 leading-relaxed text-muted sm:text-lg">
                    {paragraph}
                  </p>
                ))}
                <ul data-beat-line aria-label="What every engagement includes" className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink">
                  {approachSection.reassurance.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span aria-hidden className="size-1.5 rounded-full bg-blue" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  data-beat-line
                  href={approachSection.cta.href}
                  className="group mt-8 inline-flex items-center gap-2 font-medium text-blue-soft hover:text-ink"
                >
                  {approachSection.cta.label}
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Container>
          </div>
        </section>

        {/* 03 — Contact: the rope weaves back into A3RA */}
        <section data-beat data-beat-last className="relative h-[130svh]">
          <div className="sticky top-0 flex h-svh items-end pb-12 landscape:items-center landscape:pb-0">
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent landscape:hidden" />
            <Container className="relative">
              <div className="max-w-xl">
                <h2 data-beat-line className="text-3xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
                  {closing.title}
                </h2>
                {closing.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} data-beat-line className="mt-5 leading-relaxed text-muted sm:text-lg">
                    {paragraph}
                  </p>
                ))}
                <div data-beat-line className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <EnquiryDialog label={closing.primaryCta} source="home-dialog" />
                  <ButtonLink href={site.bookingUrl} size="lg" variant="secondary">
                    Book a {booking.durationMinutes}-minute call
                  </ButtonLink>
                </div>
                <p data-beat-line className="mt-5 text-sm text-faint italic">
                  {closing.note}
                </p>
                {site.contactEmail && (
                  <p data-beat-line className="mt-2 text-sm text-faint">
                    Prefer email?{" "}
                    <a href={`mailto:${site.contactEmail}`} className="text-muted underline underline-offset-4 hover:text-ink">
                      {site.contactEmail}
                    </a>
                  </p>
                )}
              </div>
            </Container>
          </div>
        </section>
      </div>
    </>
  );
}
