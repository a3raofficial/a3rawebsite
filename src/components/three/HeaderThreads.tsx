"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ThreadFrame } from "@/components/three/ThreadScene";
import {
  SceneBoundary,
  useMediaQuery,
  usePointerTracking,
  useStageCapabilities,
} from "@/components/three/stage-utils";
import { cn } from "@/lib/cn";

const ThreadScene = dynamic(() => import("@/components/three/ThreadScene"), { ssr: false });

const none = { tangle: 0, bundles: 0, word: 0, braid: 0 };
const centred = { x: 0, y: 0, scale: 0.55, rx: 0, ry: -0.15 };

/** One state of the threads per page, each echoing what the page is about. */
export const threadPresets = {
  // Three combed bundles — the three service pillars.
  services: { weights: { ...none, bundles: 1 }, layout: { ...centred, x: 0.6, scale: 0.38 } },
  // One braided rope moving forward — stage after stage.
  process: { weights: { ...none, braid: 1 }, layout: { ...centred, scale: 0.5, rx: 0.15, ry: -0.35 } },
  // The tangle — work still being untangled.
  projects: { weights: { ...none, tangle: 1 }, layout: { ...centred, scale: 0.85 } },
  // The threads woven into A3RA — the team behind the name.
  about: { weights: { ...none, word: 1 }, layout: { ...centred, scale: 0.62 } },
} satisfies Record<string, ThreadFrame>;

export type ThreadPreset = keyof typeof threadPresets;

/**
 * Live threads in a page header. Loads when the browser is idle, renders only
 * while on screen, and simply stays empty without WebGL.
 */
export function HeaderThreads({ preset, className }: { preset: ThreadPreset; className?: string }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { webgl, quality } = useStageCapabilities();
  const box = useRef<HTMLDivElement>(null);
  const [idle, setIdle] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  usePointerTracking();

  const use3D = webgl && !failed && quality !== null;

  useEffect(() => {
    if (!use3D || idle) return;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setIdle(true), 600);
    return () => clearTimeout(id);
  }, [use3D, idle]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} aria-hidden className={cn("pointer-events-none", className)}>
      {use3D && idle && quality && (
        <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-[1400ms]", ready && "opacity-100")}>
          <SceneBoundary onError={() => setFailed(true)}>
            <ThreadScene
              quality={quality}
              reducedMotion={reducedMotion}
              running={visible}
              mode="fixed"
              fixed={threadPresets[preset]}
              onReady={() => setReady(true)}
              onError={() => setFailed(true)}
            />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
