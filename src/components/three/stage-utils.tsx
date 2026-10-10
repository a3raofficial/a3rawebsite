"use client";

import { Component, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { detectQuality, type Quality } from "@/components/three/quality";
import { storyState } from "@/components/three/story-state";

/** Matches a media query; false on the server so SSR renders the fallback. */
export function useMediaQuery(query: string) {
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
      webglSupport = !!document.createElement("canvas").getContext("webgl2");
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

let quality: Quality | undefined;
const getQuality = () => (quality ??= detectQuality());
const noopSubscribe = () => () => {};

/** WebGL support and render quality for this device (null on the server). */
export function useStageCapabilities() {
  const webgl = useSyncExternalStore(noopSubscribe, supportsWebGL, () => false);
  const q = useSyncExternalStore(noopSubscribe, getQuality, () => null);
  return { webgl, quality: q };
}

/** If a scene throws while rendering, fall back instead of breaking the page. */
export class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
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
 * Tracks the pointer into the shared stage state: position (normalised -1..1),
 * clicks (light shockwave) and grabbing the loose thread.
 */
export function usePointerTracking() {
  useEffect(() => {
    const toNdc = (e: PointerEvent) => {
      storyState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      storyState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onDown = (e: PointerEvent) => {
      toNdc(e);
      if (storyState.grab.hover && e.pointerType === "mouse") {
        storyState.grab.dragging = true;
        document.documentElement.dataset.cursor = "grabbing";
        e.preventDefault(); // no text selection while pulling
        return;
      }
      storyState.shock = { x: storyState.pointer.x, y: storyState.pointer.y, at: performance.now() };
    };
    const onUp = () => {
      if (!storyState.grab.dragging) return;
      storyState.grab.dragging = false;
      document.documentElement.dataset.cursor = storyState.grab.hover ? "grab" : "";
    };
    window.addEventListener("pointermove", toNdc, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", toNdc);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);
}
