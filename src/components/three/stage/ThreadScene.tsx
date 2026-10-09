"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Quality } from "@/components/three/stage/quality";
import { storyState, type Weights } from "@/components/three/stage/story-state";
import { createThreadGeometry } from "@/components/three/stage/threads";

/*
 * Hundreds of fine luminous threads. The same threads blend between four
 * shapes — a tangle (the problem), three combed bundles (strategy, data & AI,
 * engineering), the A3RA wordmark (where A3RA comes in), and one braided rope
 * (the work moving forward). Light pulses travel along them like fibre optics.
 * Threads are screen-space ribbons a couple of pixels wide, additively blended.
 */

// Module-level uniforms: one thread scene renders at a time, values change every frame.
const U = {
  uW: { value: new THREE.Vector4(1, 0, 0, 0) },
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(1, 1) },
  uWidth: { value: 2.2 },
  uGlow: { value: 1 },
};

const vertexShader = /* glsl */ `
  attribute vec3 aP0, aP1, aP2, aP3;
  attribute vec3 aT0, aT1, aT2, aT3;
  attribute float aSide;
  attribute vec2 aThread;
  attribute vec3 aBundleColour, aWordColour, aSteelColour;
  uniform vec4 uW;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uWidth;
  varying vec3 vColour;
  varying float vSide;
  varying float vT;
  varying float vSeed;

  void main() {
    float t = aThread.x;
    float seed = aThread.y;
    vec3 p = aP0 * uW.x + aP1 * uW.y + aP2 * uW.z + aP3 * uW.w;
    vec3 tangent = normalize(aT0 * uW.x + aT1 * uW.y + aT2 * uW.z + aT3 * uW.w + vec3(1e-5));

    // Living motion: loose threads sway more, the wordmark only shimmers.
    float amp = dot(uW, vec4(0.09, 0.07, 0.012, 0.035));
    p += amp * vec3(
      sin(uTime * 0.7 + t * 9.0 + seed * 40.0),
      cos(uTime * 0.6 + t * 7.0 + seed * 31.0),
      sin(uTime * 0.5 + t * 5.0 + seed * 17.0)
    );

    vColour = aSteelColour * uW.x + aBundleColour * uW.y + aWordColour * uW.z + aBundleColour * uW.w;
    vSide = aSide;
    vT = t;
    vSeed = seed;

    // Extrude a few pixels across the screen-space direction of the thread.
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vec4 ahead = projectionMatrix * modelViewMatrix * vec4(p + tangent * 0.02, 1.0);
    vec2 dir = (ahead.xy / ahead.w - clip.xy / clip.w) * uResolution;
    dir = length(dir) > 1e-4 ? normalize(dir) : vec2(1.0, 0.0);
    vec2 normal = vec2(-dir.y, dir.x);
    clip.xy += normal * aSide * uWidth / uResolution * clip.w;
    gl_Position = clip;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec4 uW;
  uniform float uTime;
  uniform float uGlow;
  varying vec3 vColour;
  varying float vSide;
  varying float vT;
  varying float vSeed;

  void main() {
    float across = exp(-vSide * vSide * 3.0);
    // Loose threads fade at their ends; the wordmark keeps crisp stroke ends.
    float ends = smoothstep(0.0, 0.08, vT) * (1.0 - smoothstep(0.92, 1.0, vT));
    ends = mix(ends, 1.0, uW.z);
    // A light pulse running along each thread.
    float f = fract(vT * 0.8 - uTime * 0.16 - vSeed * 5.0);
    float pulse = smoothstep(0.86, 1.0, f) * (1.0 - smoothstep(0.995, 1.0, f));
    float base = mix(0.34, 0.6, uW.z);
    float intensity = (base + pulse * 1.6) * across * ends * uGlow;
    gl_FragColor = vec4(vColour * intensity, intensity);
  }
`;

// ---------- Layout ----------
export type Layout = {
  x: number;
  y: number;
  scale: number;
  rx: number;
  ry: number;
};
export type ThreadFrame = { weights: Weights; layout: Layout };

// Homepage: hero, disciplines, approach, closing. Desktop text sits left, so threads sit right / below.
const DESKTOP: Layout[] = [
  { x: 2.45, y: 0.15, scale: 0.6, rx: 0, ry: -0.18 },
  { x: 2.2, y: -2.05, scale: 0.6, rx: 0.05, ry: -0.2 },
  { x: 2.0, y: -1.5, scale: 0.66, rx: 0.15, ry: -0.35 },
  { x: 2.45, y: 0.15, scale: 0.6, rx: 0, ry: -0.18 },
];
// Portrait: threads above the text.
const PORTRAIT: Layout[] = [
  { x: 0, y: 1.9, scale: 0.42, rx: 0, ry: 0 },
  { x: 0, y: 2.0, scale: 0.36, rx: 0, ry: -0.2 },
  { x: 0, y: 2.0, scale: 0.38, rx: 0.15, ry: -0.35 },
  { x: 0, y: 1.9, scale: 0.42, rx: 0, ry: 0 },
];
const SECTION_WEIGHTS: Weights[] = [
  { tangle: 0, bundles: 0, word: 1, braid: 0 }, // hero after the intro (overridden by the intro itself)
  { tangle: 0, bundles: 1, word: 0, braid: 0 },
  { tangle: 0, bundles: 0, word: 0, braid: 1 },
  { tangle: 0, bundles: 0, word: 1, braid: 0 },
];

const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function mixWeights(a: Weights, b: Weights, t: number): Weights {
  return {
    tangle: lerp(a.tangle, b.tangle, t),
    bundles: lerp(a.bundles, b.bundles, t),
    word: lerp(a.word, b.word, t),
    braid: lerp(a.braid, b.braid, t),
  };
}
function mixLayout(a: Layout, b: Layout, t: number): Layout {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), scale: lerp(a.scale, b.scale, t), rx: lerp(a.rx, b.rx, t), ry: lerp(a.ry, b.ry, t) };
}

function storyFrame(progress: number, portrait: boolean): ThreadFrame {
  const layouts = portrait ? PORTRAIT : DESKTOP;
  const p = Math.min(3, Math.max(0, progress));
  const i = Math.min(2, Math.floor(p));
  const t = smooth(p - i);
  const from = i === 0 ? storyState.intro : SECTION_WEIGHTS[i];
  return { weights: mixWeights(from, SECTION_WEIGHTS[i + 1], t), layout: mixLayout(layouts[i], layouts[i + 1], t) };
}

// ---------- Scene ----------
function Threads({
  count,
  mode,
  fixed,
  reducedMotion,
}: {
  count: number;
  mode: "story" | "fixed";
  fixed?: ThreadFrame;
  reducedMotion: boolean;
}) {
  const geometry = useMemo(() => createThreadGeometry(count), [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: U,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        // Screen-space quads all share one winding, so draw both faces.
        side: THREE.DoubleSide,
        // Pure additive light: colour and alpha both accumulate (premultiplied canvas).
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
      }),
    [],
  );
  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material]);

  const group = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const m = useRef({ progress: 0, w: new THREE.Vector4(1, 0, 0, 0), px: 0, py: 0, time: 0, first: true });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = m.current;
    const portrait = size.width < size.height;
    const ease = (rate: number) => (s.first ? 1 : 1 - Math.exp(-dt * rate));

    s.progress += (storyState.progress - s.progress) * ease(2);
    const frame =
      mode === "story"
        ? reducedMotion
          ? { weights: SECTION_WEIGHTS[3], layout: (portrait ? PORTRAIT : DESKTOP)[0] }
          : storyFrame(s.progress, portrait)
        : (fixed as ThreadFrame);

    // Weights glide too, so jumps (e.g. scrolling mid-intro) still read as motion.
    const w = frame.weights;
    s.w.x += (w.tangle - s.w.x) * ease(3);
    s.w.y += (w.bundles - s.w.y) * ease(3);
    s.w.z += (w.word - s.w.z) * ease(3);
    s.w.w += (w.braid - s.w.w) * ease(3);
    U.uW.value.copy(s.w);

    s.px += (storyState.pointer.x - s.px) * ease(2.5);
    s.py += (storyState.pointer.y - s.py) * ease(2.5);
    if (!reducedMotion) s.time += dt;
    U.uTime.value = s.time;
    U.uResolution.value.set(state.size.width, state.size.height);
    U.uWidth.value = portrait ? 1.6 : 2.2;

    const l = frame.layout;
    if (group.current) {
      const g = group.current;
      g.position.x += (l.x - g.position.x) * ease(2.2);
      g.position.y += (l.y - g.position.y) * ease(2.2);
      const sc = g.scale.x + (l.scale - g.scale.x) * ease(2.2);
      g.scale.setScalar(sc);
      g.rotation.x += (l.rx - g.rotation.x) * ease(2.2);
      g.rotation.y += (l.ry - g.rotation.y) * ease(2.2);
    }
    if (tilt.current) {
      tilt.current.rotation.x = -s.py * 0.12 + Math.sin(s.time * 0.3) * 0.04;
      tilt.current.rotation.y = s.px * 0.18 + Math.cos(s.time * 0.25) * 0.05;
    }
    s.first = false;
  });

  return (
    <group ref={group}>
      <group ref={tilt}>
        <mesh geometry={geometry} material={material} frustumCulled={false} />
      </group>
    </group>
  );
}

type ThreadSceneProps = {
  quality: Quality;
  reducedMotion: boolean;
  running: boolean;
  mode?: "story" | "fixed";
  fixed?: ThreadFrame;
  onReady?: () => void;
  onError?: () => void;
};

export default function ThreadScene({
  quality,
  reducedMotion,
  running,
  mode = "story",
  fixed,
  onReady,
  onError,
}: ThreadSceneProps) {
  const count = quality.tier === "high" ? 320 : quality.tier === "medium" ? 200 : 120;
  return (
    <Canvas
      frameloop={running ? "always" : "never"}
      dpr={quality.dpr}
      camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", () => onError?.(), { once: true });
        requestAnimationFrame(() => onReady?.());
      }}
    >
      <Threads count={count} mode={mode} fixed={fixed} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
