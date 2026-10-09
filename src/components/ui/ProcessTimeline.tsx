"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ProcessStage } from "@/content/process";

/**
 * The five stages with a line that fills as you scroll, lighting each stage
 * as you reach it. Without JS (or with reduced motion) the line is simply full.
 */
export function ProcessTimeline({ stages }: { stages: ProcessStage[] }) {
  const root = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-line-fill]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 60%", scrub: 0.8 },
          },
        );
        gsap.utils.toArray<HTMLElement>("[data-stage]").forEach((stage) => {
          const dot = stage.querySelector("[data-dot]");
          const body = stage.querySelectorAll("[data-stage-body] > *");
          ScrollTrigger.create({
            trigger: stage,
            start: "top 60%",
            onToggle: (self) => dot?.toggleAttribute("data-reached", self.isActive || self.progress > 0),
          });
          gsap.from(body, {
            autoAlpha: 0,
            y: 40,
            stagger: 0.12,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: stage, start: "top 78%" },
          });
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <ol ref={root} className="relative">
      <span aria-hidden className="absolute top-2 bottom-2 left-[1.2rem] w-px bg-line-strong sm:left-[1.45rem]" />
      <span
        aria-hidden
        data-line-fill
        className="absolute top-2 bottom-2 left-[1.2rem] w-px origin-top bg-gradient-to-b from-blue via-blue-soft to-gold sm:left-[1.45rem]"
      />
      {stages.map((stage) => (
        <li key={stage.number} data-stage className="relative pb-20 pl-14 last:pb-0 sm:pl-20">
          <span
            data-dot
            className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-full border border-line-strong bg-obsidian font-mono text-xs text-faint transition-all duration-500 data-[reached]:border-blue data-[reached]:text-ink data-[reached]:shadow-[0_0_24px_rgb(76_141_255/0.45)] sm:size-12"
          >
            {stage.number}
          </span>
          <div data-stage-body className="grid gap-6 md:grid-cols-[1fr_1fr] md:gap-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{stage.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">{stage.description}</p>
            </div>
            <div className="spotlight rounded-2xl border border-line bg-surface p-6">
              <h3 className="eyebrow">What to expect</h3>
              <ul className="mt-4 space-y-3 text-muted">
                {stage.expect.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-blue" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
