"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { OrbitVisual } from "@/components/ui/OrbitVisual";
import { cn } from "@/lib/cn";

// Three.js is only downloaded when the 3D scene is actually used.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

/** Matches a media query; false on the server so SSR always renders the fallback. */
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

let webglSupport: boolean | undefined;
function supportsWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
const noopSubscribe = () => () => {};

/** If the scene throws while rendering, fall back instead of breaking the page. */
class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Hero visual: the CSS orbit renders immediately (and is the permanent
 * fallback for small screens, reduced motion and no WebGL). On capable
 * desktops the 3D scene loads once the browser is idle and fades in on top.
 */
export function HeroVisual({ className }: { className?: string }) {
  const largeScreen = useMediaQuery("(min-width: 768px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const webgl = useSyncExternalStore(noopSubscribe, supportsWebGL, () => false);
  const [idle, setIdle] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const use3D = largeScreen && !reducedMotion && webgl && !failed;

  // Defer the 3D download until the main interface has loaded.
  useEffect(() => {
    if (!use3D || idle) return;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setIdle(true), 1200);
    return () => clearTimeout(id);
  }, [use3D, idle]);

  const showScene = use3D && idle;

  return (
    <div aria-hidden className={cn("pointer-events-none relative aspect-square", className)}>
      {showScene && ready && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgb(76_141_255/0.16),transparent_55%),radial-gradient(circle_at_62%_58%,rgb(230_178_114/0.10),transparent_45%)]" />
      )}
      <div className={cn("absolute inset-0 transition-opacity duration-1000", showScene && ready && "opacity-0")}>
        <OrbitVisual />
      </div>
      {showScene && (
        <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-1000", ready && "opacity-100")}>
          <SceneBoundary onError={() => setFailed(true)}>
            <HeroScene onReady={() => setReady(true)} onError={() => setFailed(true)} />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
