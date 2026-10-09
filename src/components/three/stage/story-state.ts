/**
 * Shared, mutable state between the homepage (DOM, GSAP) and the 3D scene.
 * Written by the intro timeline and scroll, read every frame — deliberately
 * not React state, so animation never triggers re-renders.
 */

/** Blend weights for the four thread shapes: tangle, bundles, wordmark, braid. */
export type Weights = { tangle: number; bundles: number; word: number; braid: number };

export const storyState = {
  /** Section position below the hero: 0 = hero, 1 = disciplines, 2 = approach, 3 = closing. */
  progress: 0,
  /** Weights driven by the autoplay intro in the hero. */
  intro: { tangle: 1, bundles: 0, word: 0, braid: 0 } as Weights,
  /** Pointer in normalised device coords (-1..1). */
  pointer: { x: 0, y: 0 },
  /** True while the story is on screen; the scene stops rendering otherwise. */
  active: true,
};

const listeners = new Set<() => void>();

/** Marks the story as on/off screen (the canvas pauses when off). */
export function setStoryActive(active: boolean) {
  if (storyState.active === active) return;
  storyState.active = active;
  listeners.forEach((l) => l());
}

export function subscribeStoryActive(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
