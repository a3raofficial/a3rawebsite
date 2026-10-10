"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Quality } from "@/components/three/quality";
import { storyState, type Weights } from "@/components/three/story-state";
import { TAIL_END, createSparkGeometry, createThreadGeometry } from "@/components/three/threads";

/*
 * Hundreds of fine luminous threads. The same threads blend between four
 * shapes — a tangle (the problem), three combed bundles (strategy, data & AI,
 * engineering), the A3RA wordmark (where A3RA comes in), and one braided rope
 * (the work moving forward). Light pulses travel along them like fibre optics.
 *
 * They're also hands-on: the cursor pushes threads aside (with a springy
 * wobble), a click sends a ring of light through them, hovering a discipline
 * lights its bundle, and the loose thread hanging from the last A can be
 * pulled to unravel the wordmark — release it and it weaves itself back.
 */

// Module-level uniforms: one thread scene renders at a time, values change every frame.
const U = {
  uW: { value: new THREE.Vector4(1, 0, 0, 0) },
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(1, 1) },
  uWidth: { value: 2.2 },
  uGlow: { value: 1 },
  uPointer: { value: new THREE.Vector3(99, 99, 0) },
  uPush: { value: 0 },
  uShockPos: { value: new THREE.Vector3() },
  uShockAge: { value: 99 },
  uFocus: { value: -1 },
  uFocusAmt: { value: 0 },
  uUnravel: { value: 0 },
  uDrag: { value: 0 },
  uDragPos: { value: new THREE.Vector3() },
  uSurgeAge: { value: 99 },
  uPixelRatio: { value: 1 },
};

const vertexShader = /* glsl */ `
  attribute vec3 aP0, aP1, aP2, aP3;
  attribute vec3 aT0, aT1, aT2, aT3;
  attribute vec4 aMeta; // side, bundle, unravel order, tail flag
  attribute vec2 aThread;
  attribute vec3 aBundleColour, aWordColour, aSteelColour;
  uniform vec4 uW;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uWidth;
  uniform vec3 uPointer;
  uniform float uPush;
  uniform vec3 uShockPos;
  uniform float uShockAge;
  uniform float uFocus;
  uniform float uFocusAmt;
  uniform float uUnravel;
  uniform float uDrag;
  uniform vec3 uDragPos;
  uniform float uWidthMul;
  uniform float uSurgeAge;
  varying vec3 vColour;
  varying float vSide;
  varying float vT;
  varying float vSeed;
  varying float vBoost;
  varying float vBurst;

  void main() {
    float side = aMeta.x;
    float bundle = aMeta.y;
    float order = aMeta.z;
    float isTail = aMeta.w;
    float t = aThread.x;
    float seed = aThread.y;

    vec4 w = uW;
    // Pulling the loose thread unravels the wordmark, rightmost letters first.
    float unravel = smoothstep(order * 0.75, order * 0.75 + 0.25, uUnravel) * w.z * (1.0 - isTail);
    w.z -= unravel;
    w.y += unravel;

    vec3 p = aP0 * w.x + aP1 * w.y + aP2 * w.z + aP3 * w.w;
    vec3 tangent = normalize(aT0 * w.x + aT1 * w.y + aT2 * w.z + aT3 * w.w + vec3(1e-5));

    // Living motion: loose threads sway more, the wordmark only shimmers.
    float amp = dot(w, vec4(0.09, 0.07, 0.012, 0.035));
    p += amp * vec3(
      sin(uTime * 0.7 + t * 9.0 + seed * 40.0),
      cos(uTime * 0.6 + t * 7.0 + seed * 31.0),
      sin(uTime * 0.5 + t * 5.0 + seed * 17.0)
    );

    // The loose thread follows the cursor while it's being pulled.
    float tug = smoothstep(0.7, 1.0, t) * uDrag * isTail;
    p = mix(p, uDragPos + vec3(sin(seed * 20.0), cos(seed * 20.0), 0.0) * 0.06, tug);

    // The cursor combs threads aside.
    vec2 away = p.xy - uPointer.xy;
    float reach = exp(-dot(away, away) * 1.6);
    p.xy += normalize(away + vec2(1e-4)) * reach * uPush * 0.55;
    p.z += reach * uPush * 0.4;

    // A click sends a ring of light (and a little lift) outward through the threads.
    float ring = exp(-pow(length(p.xy - uShockPos.xy) - uShockAge * 5.0, 2.0) * 1.2) * exp(-uShockAge * 1.1);
    p.z += ring * 0.35;

    // Electric crackle: in short random bursts a thread jitters like an arc.
    float tick = floor(uTime * 7.0 + seed * 31.0);
    float burst = step(0.9, fract(sin(tick * 12.9898 + seed * 78.233) * 43758.5453));
    float jag = fract(sin(floor(t * 60.0) * 91.7 + tick * 17.3) * 43758.5453) - 0.5;
    p += burst * jag * vec3(0.0, 0.09, 0.05) * (1.0 - 0.75 * w.z);

    // Power surge: a discharge rolling outward from the wordmark's centre, plus a flash.
    float surgeRing = exp(-pow(length(p.xy) - uSurgeAge * 6.0, 2.0) * 0.9) * exp(-uSurgeAge * 1.3);
    float flash = exp(-uSurgeAge * 2.5);
    p.z += surgeRing * 0.3;
    p.xy += normalize(p.xy - uShockPos.xy + vec2(1e-4)) * ring * 0.1;

    // Hovering a discipline brightens its bundle and dims the others.
    float strands = clamp(w.y + w.w, 0.0, 1.0);
    float focus = abs(bundle - uFocus) < 0.5 ? 1.9 : 0.28;
    vBoost = mix(1.0, focus, uFocusAmt * strands) + ring * 2.8 + tug * 1.5 + reach * uPush * 0.8 + surgeRing * 2.2 + flash * 0.5;
    vBurst = burst;

    vColour = aSteelColour * w.x + aBundleColour * w.y + aWordColour * w.z + aBundleColour * w.w;
    vSide = side;
    vT = t;
    vSeed = seed;

    // Extrude a few pixels across the screen-space direction of the thread.
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vec4 ahead = projectionMatrix * modelViewMatrix * vec4(p + tangent * 0.02, 1.0);
    vec2 dir = (ahead.xy / ahead.w - clip.xy / clip.w) * uResolution;
    dir = length(dir) > 1e-4 ? normalize(dir) : vec2(1.0, 0.0);
    vec2 normal = vec2(-dir.y, dir.x);
    clip.xy += normal * side * uWidth * uWidthMul / uResolution * clip.w;
    gl_Position = clip;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec4 uW;
  uniform float uTime;
  uniform float uGlow;
  uniform float uHalo;
  varying vec3 vColour;
  varying float vSide;
  varying float vT;
  varying float vSeed;
  varying float vBoost;
  varying float vBurst;

  void main() {
    // Two passes share this shader: a thin white-hot core and a wide coloured glow.
    float core = exp(-vSide * vSide * 6.0);
    float glow = exp(-vSide * vSide * 1.6) * 0.22;
    float across = mix(core, glow, uHalo);
    // Loose threads fade at their ends; the wordmark keeps crisp stroke ends.
    float ends = smoothstep(0.0, 0.08, vT) * (1.0 - smoothstep(0.92, 1.0, vT));
    ends = mix(ends, 1.0, uW.z);
    // Energy pulses racing both ways along each thread.
    float f1 = fract(vT * 0.9 - uTime * 0.38 - vSeed * 5.0);
    float p1 = smoothstep(0.9, 1.0, f1) * (1.0 - smoothstep(0.995, 1.0, f1));
    float f2 = fract(vT * 1.6 + uTime * 0.21 + vSeed * 9.0);
    float p2 = smoothstep(0.94, 1.0, f2) * (1.0 - smoothstep(0.997, 1.0, f2));
    float flicker = 0.9 + 0.1 * sin(uTime * 23.0 + vSeed * 90.0);
    float base = mix(0.34, 0.6, uW.z);
    float intensity = (base + p1 * 1.8 + p2 * 0.9 + vBurst * 0.8) * flicker * across * ends * uGlow * vBoost;
    vec3 colour = mix(vColour, vec3(1.0), (1.0 - uHalo) * 0.55 * core);
    gl_FragColor = vec4(colour * intensity, intensity);
  }
`;

const sparkVertex = /* glsl */ `
  attribute vec3 aS0, aS1, aS2, aS3, aDir, aColB, aColW;
  attribute vec2 aSeed;
  uniform vec4 uW;
  uniform float uTime;
  uniform float uSurgeAge;
  uniform float uPixelRatio;
  varying vec3 vC;
  varying float vA;
  void main() {
    vec3 base = aS0 * uW.x + aS1 * uW.y + aS2 * uW.z + aS3 * uW.w;
    // Sparks shed faster during a surge.
    float speed = aSeed.y * (1.0 + 2.0 * exp(-uSurgeAge * 1.5));
    float life = fract(uTime * speed * 0.5 + aSeed.x);
    vec3 p = base + aDir * life * (0.6 + 1.2 * aSeed.y) + vec3(0.0, life * life * 0.3, 0.0);
    vC = mix(aColB, aColW, uW.z) * 1.4;
    vA = sin(life * 3.14159) * (1.0 - life);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + 3.0 * (1.0 - life)) * uPixelRatio * (9.0 / -mv.z);
  }
`;
const sparkFragment = /* glsl */ `
  varying vec3 vC;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.18, 0.0, d);
    vec3 colour = mix(vC, vec3(1.0), core) * a * vA;
    gl_FragColor = vec4(colour, a * vA);
  }
`;
const auraVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const auraFragment = /* glsl */ `
  uniform vec4 uW;
  uniform float uTime;
  uniform float uSurgeAge;
  varying vec2 vUv;
  void main() {
    vec2 q = vUv * 2.0 - 1.0;
    float d = length(q * vec2(1.0, 1.7));
    float fall = exp(-d * d * 3.2);
    vec3 colour = mix(vec3(0.18, 0.4, 1.0), vec3(1.0, 0.68, 0.32), smoothstep(0.2, 0.8, vUv.x));
    float energy = (0.05 + 0.08 * uW.z + 0.55 * exp(-uSurgeAge * 1.8)) * (0.92 + 0.08 * sin(uTime * 1.4));
    float i = fall * energy;
    gl_FragColor = vec4(colour * i, i);
  }
`;

/** Pure additive light: colour and alpha both accumulate (premultiplied canvas). */
const additive = {
  transparent: true,
  depthWrite: false,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.OneFactor,
  blendDstAlpha: THREE.OneFactor,
} as const;

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
  { x: 2.7, y: -2.1, scale: 0.6, rx: 0.05, ry: -0.2 },
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
  const sparks = useMemo(() => createSparkGeometry(geometry, Math.round(count * 2.2)), [geometry, count]);
  // Same threads drawn twice: a wide coloured glow, then a thin white-hot core.
  const [glowMaterial, coreMaterial] = useMemo(
    () =>
      [6, 1].map(
        (widthMul) =>
          new THREE.ShaderMaterial({
            uniforms: { ...U, uWidthMul: { value: widthMul }, uHalo: { value: widthMul > 1 ? 1 : 0 } },
            vertexShader,
            fragmentShader,
            // Screen-space quads all share one winding, so draw both faces.
            side: THREE.DoubleSide,
            ...additive,
          }),
      ),
    [],
  );
  const sparkMaterial = useMemo(
    () => new THREE.ShaderMaterial({ uniforms: U, vertexShader: sparkVertex, fragmentShader: sparkFragment, ...additive }),
    [],
  );
  const auraMaterial = useMemo(
    () => new THREE.ShaderMaterial({ uniforms: U, vertexShader: auraVertex, fragmentShader: auraFragment, ...additive }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      sparks.dispose();
      glowMaterial.dispose();
      coreMaterial.dispose();
      sparkMaterial.dispose();
      auraMaterial.dispose();
    },
    [geometry, sparks, glowMaterial, coreMaterial, sparkMaterial, auraMaterial],
  );
  // Leaving the page mid-pull must not leave a grab cursor behind.
  useEffect(
    () => () => {
      storyState.grab.hover = false;
      storyState.grab.dragging = false;
      delete document.documentElement.dataset.cursor;
    },
    [],
  );

  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const m = useRef({
    progress: 0,
    w: new THREE.Vector4(1, 0, 0, 0),
    px: 0,
    py: 0,
    time: 0,
    first: true,
    push: 0,
    pushVel: 0,
    lastLocal: new THREE.Vector3(99, 99, 0),
    unravel: 0,
    unravelVel: 0,
  });
  const helpers = useMemo(
    () => ({
      ray: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      hit: new THREE.Vector3(),
      ndc: new THREE.Vector2(),
      tailScreen: new THREE.Vector3(),
    }),
    [],
  );

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
    U.uWidth.value = portrait ? 1.5 : 1.9;
    U.uPixelRatio.value = state.viewport.dpr;
    U.uSurgeAge.value = storyState.surge >= 0 && !reducedMotion ? (performance.now() - storyState.surge) / 1000 : 99;

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

    const mm = mesh.current;
    if (mm) {
      mm.rotation.x = -s.py * 0.1 + Math.sin(s.time * 0.3) * 0.035;
      mm.rotation.y = s.px * 0.14 + Math.cos(s.time * 0.25) * 0.045;
      mm.updateWorldMatrix(true, false);

      // Cursor → point in the threads' own space.
      helpers.ndc.set(storyState.pointer.x, storyState.pointer.y);
      helpers.ray.setFromCamera(helpers.ndc, state.camera);
      if (helpers.ray.ray.intersectPlane(helpers.plane, helpers.hit)) {
        const local = mm.worldToLocal(helpers.hit.clone());
        // Comb strength follows cursor speed through a springy (under-damped) response.
        const speed = local.distanceTo(s.lastLocal) / Math.max(dt, 1e-3);
        s.lastLocal.copy(local);
        const target = reducedMotion ? 0 : Math.min(1, speed * 0.05);
        s.pushVel += ((target - s.push) * 60 - s.pushVel * 7) * dt;
        s.push = Math.max(0, s.push + s.pushVel * dt);
        U.uPointer.value.copy(local);
        U.uPush.value = s.push;
        U.uDragPos.value.copy(local);

        // The loose thread: grab when the cursor is near its end and the wordmark is showing.
        helpers.tailScreen.copy(TAIL_END).applyMatrix4(mm.matrixWorld).project(state.camera);
        const dx = ((helpers.tailScreen.x - storyState.pointer.x) * state.size.width) / 2;
        const dy = ((helpers.tailScreen.y - storyState.pointer.y) * state.size.height) / 2;
        const near = Math.hypot(dx, dy) < 46 && s.w.z > 0.85 && !reducedMotion && !portrait;
        if (near !== storyState.grab.hover && !storyState.grab.dragging) {
          storyState.grab.hover = near;
          document.documentElement.dataset.cursor = near ? "grab" : "";
        }
        const pulled = storyState.grab.dragging ? Math.min(1, local.distanceTo(TAIL_END) / 4.5) : 0;
        // Spring back with a little overshoot when released.
        s.unravelVel += ((pulled - s.unravel) * 40 - s.unravelVel * (storyState.grab.dragging ? 12 : 6)) * dt;
        s.unravel = Math.min(1.2, Math.max(0, s.unravel + s.unravelVel * dt));
        U.uUnravel.value = s.unravel;
        U.uDrag.value += ((storyState.grab.dragging ? 1 : 0) - U.uDrag.value) * ease(8);

        // Click shockwave origin.
        if (storyState.shock.at >= 0) {
          const age = (performance.now() - storyState.shock.at) / 1000;
          if (age < 0.05) {
            helpers.ndc.set(storyState.shock.x, storyState.shock.y);
            helpers.ray.setFromCamera(helpers.ndc, state.camera);
            if (helpers.ray.ray.intersectPlane(helpers.plane, helpers.hit)) U.uShockPos.value.copy(mm.worldToLocal(helpers.hit));
          }
          U.uShockAge.value = reducedMotion ? 99 : age;
        }
      }
    }

    // Hover focus on a discipline.
    if (storyState.focus >= 0) U.uFocus.value = storyState.focus;
    U.uFocusAmt.value += ((storyState.focus >= 0 ? 1 : 0) - U.uFocusAmt.value) * ease(5);
    s.first = false;
  });

  return (
    <group ref={group}>
      <group ref={mesh}>
        <mesh position={[0, 0, -0.6]} material={auraMaterial} renderOrder={0}>
          <planeGeometry args={[13, 6.5]} />
        </mesh>
        <mesh geometry={geometry} material={glowMaterial} frustumCulled={false} renderOrder={1} />
        <mesh geometry={geometry} material={coreMaterial} frustumCulled={false} renderOrder={2} />
        <points geometry={sparks} material={sparkMaterial} frustumCulled={false} renderOrder={3} />
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
