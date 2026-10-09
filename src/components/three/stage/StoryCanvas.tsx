"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LogoFallback } from "@/components/three/stage/LogoFallback";
import {
  SceneBoundary,
  useMediaQuery,
  usePointerTracking,
  useStageCapabilities,
} from "@/components/three/stage/stage-utils";
import { storyState, subscribeStoryActive } from "@/components/three/stage/story-state";
import { cn } from "@/lib/cn";

// Three.js is downloaded only when the scene is actually shown.
const ThreadScene = dynamic(() => import("@/components/three/stage/ThreadScene"), { ssr: false });

/**
 * Full-viewport stage fixed behind the homepage. The still logo paints first;
 * the thread scene loads when the browser is idle and fades in over it.
 */
export function StoryCanvas() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { webgl, quality } = useStageCapabilities();
  const active = useSyncExternalStore(subscribeStoryActive, () => storyState.active, () => true);
  const [idle, setIdle] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  usePointerTracking();

  const use3D = webgl && !failed && quality !== null;

  useEffect(() => {
    if (!use3D || idle) return;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setIdle(true), 800);
    return () => clearTimeout(id);
  }, [use3D, idle]);

  const showScene = use3D && idle;

  return (
    <div aria-hidden className="stage-backdrop pointer-events-none fixed inset-0 z-0">
      {!use3D && <LogoFallback />}
      {showScene && quality && (
        <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-1000", ready && "opacity-100")}>
          <SceneBoundary onError={() => setFailed(true)}>
            <ThreadScene
              quality={quality}
              reducedMotion={reducedMotion}
              running={active}
              onReady={() => setReady(true)}
              onError={() => setFailed(true)}
            />
          </SceneBoundary>
        </div>
      )}
      {/* Soft shade behind the text column (desktop) keeps copy crisp over the threads. */}
      <div className="absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-obsidian/70 via-obsidian/30 to-transparent sm:block" />
    </div>
  );
}
