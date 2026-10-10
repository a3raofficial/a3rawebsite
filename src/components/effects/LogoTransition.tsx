"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const DURATION = 2600;
/** Navigate once the screen is fully black, so the swap is never seen. */
const NAVIGATE_AT = 0.3;

/**
 * Page transitions: the screen fades to black, the glowing A3RA logo glides
 * slowly across it with a light streak behind, and the next page — swapped in
 * while everything is hidden — fades in as the logo leaves.
 * Skipped for reduced motion, new tabs, modified clicks, hashes and same-page links.
 */
export function LogoTransition() {
  const router = useRouter();
  const overlay = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const streak = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same page (or a #hash)
      const el = overlay.current;
      if (!el || !logo.current || !streak.current || !veil.current) return;
      e.preventDefault();
      if (busy.current) return;
      busy.current = true;

      el.style.display = "block";
      const timing = { duration: DURATION, easing: "linear", fill: "forwards" as const };
      // Glide in, drift slowly through the centre, glide out — one continuous motion.
      logo.current.animate(
        [
          { transform: "translate(-50%, -50%) translateX(-120vw) rotate(-10deg) scale(0.9)", opacity: 0, offset: 0, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
          { transform: "translate(-50%, -50%) translateX(-120vw) rotate(-10deg) scale(0.9)", opacity: 1, offset: 0.12, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
          { transform: "translate(-50%, -50%) translateX(-5vw) rotate(-1.5deg) scale(1)", opacity: 1, offset: 0.4, easing: "linear" },
          { transform: "translate(-50%, -50%) translateX(5vw) rotate(1.5deg) scale(1)", opacity: 1, offset: 0.66, easing: "cubic-bezier(0.64, 0, 0.78, 0)" },
          { transform: "translate(-50%, -50%) translateX(120vw) rotate(10deg) scale(0.9)", opacity: 1, offset: 0.9 },
          { transform: "translate(-50%, -50%) translateX(120vw) rotate(10deg) scale(0.9)", opacity: 0, offset: 1 },
        ],
        timing,
      );
      // The light trail follows a little behind the logo.
      streak.current.animate(
        [
          { transform: "translateY(-50%) translateX(-215vw)", opacity: 0, offset: 0.12, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
          { transform: "translateY(-50%) translateX(-102vw)", opacity: 1, offset: 0.4, easing: "linear" },
          { transform: "translateY(-50%) translateX(-92vw)", opacity: 1, offset: 0.66, easing: "cubic-bezier(0.64, 0, 0.78, 0)" },
          { transform: "translateY(-50%) translateX(25vw)", opacity: 0, offset: 0.9 },
        ],
        timing,
      );
      // Fade fully to black, hold while the logo passes, then fade the new page in.
      veil.current.animate(
        [
          { opacity: 0, offset: 0, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
          { opacity: 1, offset: 0.2 },
          { opacity: 1, offset: 0.8, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
          { opacity: 0, offset: 1 },
        ],
        timing,
      ).onfinish = () => {
        el.style.display = "none";
        busy.current = false;
      };
      // An energy pulse rings out as the logo passes the centre.
      ring.current?.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.2)", opacity: 0, offset: 0 },
          { transform: "translate(-50%, -50%) scale(0.2)", opacity: 0, offset: 0.46 },
          { transform: "translate(-50%, -50%) scale(0.35)", opacity: 1, offset: 0.5, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
          { transform: "translate(-50%, -50%) scale(2.6)", opacity: 0, offset: 0.78 },
          { transform: "translate(-50%, -50%) scale(2.6)", opacity: 0, offset: 1 },
        ],
        timing,
      );
      window.setTimeout(() => router.push(url.pathname + url.search + url.hash), DURATION * NAVIGATE_AT);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <div ref={overlay} aria-hidden className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" style={{ display: "none" }}>
      <div ref={veil} className="absolute inset-0 bg-obsidian opacity-0" />
      <div
        ref={streak}
        className="absolute top-1/2 left-0 h-40 w-[200vw] opacity-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgb(79 141 255 / 0) 30%, rgb(79 141 255 / 0.35) 62%, rgb(238 243 255 / 0.55) 80%, rgb(255 194 122 / 0.45) 92%, transparent 100%)",
          filter: "blur(24px)",
          maskImage: "linear-gradient(180deg, transparent, black 40%, black 60%, transparent)",
        }}
      />
      <div
        ref={ring}
        className="absolute top-1/2 left-1/2 size-[60vmin] rounded-full opacity-0"
        style={{
          border: "2px solid rgb(238 243 255 / 0.85)",
          boxShadow: "0 0 40px 6px rgb(79 141 255 / 0.55), inset 0 0 40px 6px rgb(255 194 122 / 0.35)",
        }}
      />
      <div ref={logo} className="absolute top-1/2 left-1/2 w-[72vw] max-w-[520px] sm:w-[38vw]">
        <Image src="/images/brand/a3ra-logo-glow.png" alt="" width={760} height={660} sizes="(min-width: 640px) 38vw, 72vw" className="h-auto w-full" />
      </div>
    </div>
  );
}
