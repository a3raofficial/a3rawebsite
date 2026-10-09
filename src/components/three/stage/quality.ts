/**
 * Picks a render quality tier for the current device. Phones and low-power
 * devices get the same scene at lower cost, rather than no scene at all.
 */
export type Quality = {
  tier: "high" | "medium" | "low";
  dpr: [number, number];
  /** Resolution of the glass refraction buffer, relative to the canvas. */
  transmissionScale: number;
  motes: number;
};

export function detectQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const small = window.matchMedia("(max-width: 767px)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const weak = cores <= 4 || memory <= 4;

  if (small && weak) return { tier: "low", dpr: [1, 1], transmissionScale: 0.35, motes: 220 };
  if (small || weak) return { tier: "medium", dpr: [1, 1.5], transmissionScale: 0.5, motes: 450 };
  return { tier: "high", dpr: [1, 2], transmissionScale: 1, motes: 900 };
}
