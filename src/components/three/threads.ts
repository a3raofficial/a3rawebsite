import * as THREE from "three";

/*
 * Geometry for the thread scene. Every thread is a polyline of POINTS points.
 * Each thread has one position (and tangent) per "state"; the shader blends
 * between states, so the same threads can be a tangle, three combed bundles,
 * the A3RA wordmark, or one braided rope.
 */

export const POINTS = 96;

/** Deterministic PRNG so the layout is identical on every render. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type V2 = [number, number];

// ---------- A3RA letter strokes (logo style: A without a crossbar) ----------
function arc(cx: number, cy: number, r: number, from: number, to: number, steps = 24): V2[] {
  const points: V2[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps;
    points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return points;
}

const deg = Math.PI / 180;
/** Letter index per stroke: 0 = A, 1 = 3, 2 = R, 3 = A. */
const STROKES: Array<{ letter: number; points: V2[] }> = [
  { letter: 0, points: [[-3.2, -0.8], [-2.55, 0.8], [-1.9, -0.8]] },
  // The logo's 3: a flat top bar, a diagonal into the middle, then one big
  // bowl that sweeps round the bottom and back up on the left (the "U3" join).
  {
    letter: 1,
    points: [
      [-1.41, 0.78],
      [-0.45, 0.78],
      [-0.99, 0.12],
      ...arc(-0.97, -0.325, 0.474, 92 * deg, -180 * deg, 40).slice(1),
      [-1.48, 0.27],
    ],
  },
  { letter: 2, points: [[0.2, -0.8], [0.2, 0.8], ...arc(0.72, 0.4, 0.4, 90 * deg, -90 * deg), [0.2, 0.0]] },
  { letter: 2, points: [[0.6, 0.0], [1.15, -0.8]] },
  { letter: 3, points: [[1.4, -0.8], [2.05, 0.8], [2.7, -0.8]] },
];
const WORD_OFFSET_X = 0.25; // centres the word on x = 0

/** Number of threads that hang loose from the last A — the thread you can pull. */
const TAIL_THREADS = 3;
/** Where the loose thread starts (the last A's right foot) and ends, in scene units. */
const TAIL_START: V2 = [2.7 + WORD_OFFSET_X, -0.8];
export const TAIL_END = new THREE.Vector3(3.55, -2.0, 0);

function polylineLength(points: V2[]) {
  let length = 0;
  for (let i = 1; i < points.length; i++) length += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  return length;
}

/** Point at fraction t (0..1) along a polyline, by arc length. */
function pointAt(points: V2[], total: number, t: number): V2 {
  let target = t * total;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const segment = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (target <= segment || i === points.length - 1) {
      const f = segment === 0 ? 0 : Math.min(1, target / segment);
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    target -= segment;
  }
  return points[points.length - 1];
}

// ---------- Colours ----------
const COLOURS = {
  gold: new THREE.Color("#ffc27a"),
  pearl: new THREE.Color("#eef3ff"),
  blue: new THREE.Color("#4f8dff"),
  steel: new THREE.Color("#9fb3dc"),
};
/** Bundle colours: strategy (gold), data & AI (pearl), engineering (blue). */
const BUNDLE = [COLOURS.gold, COLOURS.pearl, COLOURS.blue];
/** Letter colours, after the logo: silver letters, blue 3, a touch of gold. */
const LETTER = [COLOURS.pearl, COLOURS.blue, COLOURS.pearl, new THREE.Color("#ffe1b5")];

export type ThreadGeometry = THREE.BufferGeometry;

/** Builds the full ribbon-quad geometry for `count` threads. */
export function createThreadGeometry(count: number): ThreadGeometry {
  const random = seeded(42);
  const strokeLengths = STROKES.map((s) => polylineLength(s.points));
  const totalStroke = strokeLengths.reduce((a, b) => a + b, 0);

  // Assign threads to strokes in proportion to stroke length.
  const strokeOf: number[] = [];
  STROKES.forEach((_, i) => {
    const n = Math.round((strokeLengths[i] / totalStroke) * count);
    for (let k = 0; k < n; k++) strokeOf.push(i);
  });
  while (strokeOf.length < count) strokeOf.push(0);

  const vertsPerThread = POINTS * 2;
  const total = count * vertsPerThread;
  const attr = (size: number) => new Float32Array(total * size);
  const P = [attr(3), attr(3), attr(3), attr(3)];
  const T = [attr(3), attr(3), attr(3), attr(3)];
  /** Packed per-vertex data: side (-1/1), bundle index, unravel order, tail flag. */
  const meta = attr(4);
  const thread = attr(2);
  const bundleColour = attr(3);
  const wordColour = attr(3);
  const steelColour = attr(3);
  const indices: number[] = [];
  let tailsAssigned = 0;

  const states: THREE.Vector3[][] = [[], [], [], []];
  for (let i = 0; i < count; i++) {
    const seed = random();
    const bundle = i % 3;
    for (const s of states) s.length = 0;

    const bc = BUNDLE[bundle];
    // State 0 — tangle: each thread wraps around a sphere (spherical Lissajous) — a ball of yarn.
    const f = [0.8 + random() * 2.6, 0.8 + random() * 2.6, 0.8 + random() * 2.6];
    const ph = [random() * 6.28, random() * 6.28, random() * 6.28];
    const radius = 1.25 + random() * 0.35;
    // State 1 — three combed bundles, flowing left to right.
    const by = (1 - bundle) * 0.95 + (random() - 0.5) * 0.36;
    const bz = (random() - 0.5) * 0.5;
    const wave = random() * 6.28;
    // State 2 — the wordmark: follow a letter stroke with a small lateral offset.
    const strokeIndex = strokeOf[i];
    const stroke = STROKES[strokeIndex];
    // A few threads of the last A run on past its foot and hang loose.
    const isTail = strokeIndex === STROKES.length - 1 && tailsAssigned < TAIL_THREADS;
    if (isTail) tailsAssigned++;
    const lateral = (random() - 0.5) * 0.3;
    const weave = random() * 6.28;
    const wz = (random() - 0.5) * 0.2;
    // State 3 — one braided rope.
    const angle = (bundle / 3) * Math.PI * 2 + (random() - 0.5) * 0.9;
    const ropeR = 0.18 + random() * 0.14;

    for (let j = 0; j < POINTS; j++) {
      const t = j / (POINTS - 1);
      const a = t * Math.PI * 2;
      const yarn = new THREE.Vector3(
        Math.sin(f[0] * a + ph[0]),
        Math.sin(f[1] * a + ph[1]),
        Math.sin(f[2] * a + ph[2]),
      ).normalize();
      states[0].push(yarn.multiplyScalar(radius * (0.92 + 0.08 * Math.sin(a * 3 + ph[0]))));
      const x = (t - 0.5) * 11;
      states[1].push(new THREE.Vector3(x, by + Math.sin(x * 0.45 + wave * 0.15 + bundle) * 0.28, bz));
      if (isTail && t > 0.7) {
        const u = (t - 0.7) / 0.3;
        states[2].push(
          new THREE.Vector3(
            TAIL_START[0] + (TAIL_END.x - TAIL_START[0]) * u + Math.sin(u * 3) * 0.12,
            TAIL_START[1] + (TAIL_END.y - TAIL_START[1]) * u * u,
            wz,
          ),
        );
      } else {
        const p = pointAt(stroke.points, strokeLengths[strokeIndex], isTail ? t / 0.7 : t);
        states[2].push(new THREE.Vector3(p[0] + WORD_OFFSET_X, p[1], wz));
      }
      const twist = angle + x * 1.35;
      states[3].push(new THREE.Vector3(x, Math.sin(x * 0.4) * 0.35 + Math.cos(twist) * ropeR, Math.sin(twist) * ropeR));
    }

    // Offset the word threads sideways (perpendicular to the stroke) to give the letters body.
    for (let j = 0; j < POINTS; j++) {
      const prev = states[2][Math.max(0, j - 1)];
      const next = states[2][Math.min(POINTS - 1, j + 1)];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      // Each fibre drifts across the stroke as it runs along it, so the letters look woven.
      const t = j / (POINTS - 1);
      const offset = lateral * (0.65 + 0.35 * Math.sin(t * Math.PI * 5 + weave));
      states[2][j].x += (-dy / len) * offset;
      states[2][j].y += (dx / len) * offset;
    }

    const lc = LETTER[stroke.letter];
    // Unravel order: the rightmost letters come undone first (they're nearest the loose end).
    const centreX = states[2].reduce((sum, v) => sum + v.x, 0) / POINTS;
    const unravelOrder = Math.min(1, Math.max(0, (3.0 - centreX) / 6.2));
    const sc = COLOURS.steel.clone().lerp(COLOURS.pearl, random() * 0.4).lerp(bc, 0.6);
    for (let j = 0; j < POINTS; j++) {
      const t = j / (POINTS - 1);
      for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
        const v = i * vertsPerThread + j * 2 + sideIndex;
        for (let s = 0; s < 4; s++) {
          const pts = states[s];
          const cur = pts[j];
          const tan = new THREE.Vector3().subVectors(pts[Math.min(POINTS - 1, j + 1)], pts[Math.max(0, j - 1)]).normalize();
          P[s].set([cur.x, cur.y, cur.z], v * 3);
          T[s].set([tan.x, tan.y, tan.z], v * 3);
        }
        meta.set([sideIndex === 0 ? -1 : 1, bundle, unravelOrder, isTail ? 1 : 0], v * 4);
        thread.set([t, seed], v * 2);
        bundleColour.set([bc.r, bc.g, bc.b], v * 3);
        wordColour.set([lc.r, lc.g, lc.b], v * 3);
        steelColour.set([sc.r, sc.g, sc.b], v * 3);
      }
    }
    for (let j = 0; j < POINTS - 1; j++) {
      const a = i * vertsPerThread + j * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const g = new THREE.BufferGeometry();
  // `position` is required by three; the shader uses the per-state attributes.
  g.setAttribute("position", new THREE.BufferAttribute(P[2], 3));
  P.forEach((arr, s) => g.setAttribute(`aP${s}`, new THREE.BufferAttribute(arr, 3)));
  T.forEach((arr, s) => g.setAttribute(`aT${s}`, new THREE.BufferAttribute(arr, 3)));
  g.setAttribute("aMeta", new THREE.BufferAttribute(meta, 4));
  g.setAttribute("aThread", new THREE.BufferAttribute(thread, 2));
  g.setAttribute("aBundleColour", new THREE.BufferAttribute(bundleColour, 3));
  g.setAttribute("aWordColour", new THREE.BufferAttribute(wordColour, 3));
  g.setAttribute("aSteelColour", new THREE.BufferAttribute(steelColour, 3));
  g.setIndex(indices);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
  return g;
}

/**
 * Sparks shed by the energy threads: points sampled from random spots on the
 * threads (in every shape), each with its own drift direction and lifetime.
 */
export function createSparkGeometry(threads: ThreadGeometry, count: number) {
  const random = seeded(7);
  const P = [0, 1, 2, 3].map((s) => threads.getAttribute(`aP${s}`).array as Float32Array);
  const bundleColour = threads.getAttribute("aBundleColour").array as Float32Array;
  const wordColour = threads.getAttribute("aWordColour").array as Float32Array;
  const vertices = threads.getAttribute("aP0").count;

  const S = [0, 1, 2, 3].map(() => new Float32Array(count * 3));
  const dir = new Float32Array(count * 3);
  const seed = new Float32Array(count * 2);
  const colB = new Float32Array(count * 3);
  const colW = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = Math.floor(random() * vertices);
    for (let s = 0; s < 4; s++) S[s].set(P[s].subarray(v * 3, v * 3 + 3), i * 3);
    const d = new THREE.Vector3(random() - 0.5, random() - 0.3, (random() - 0.5) * 0.6).normalize();
    dir.set([d.x, d.y, d.z], i * 3);
    seed.set([random(), 0.25 + random() * 0.6], i * 2);
    colB.set(bundleColour.subarray(v * 3, v * 3 + 3), i * 3);
    colW.set(wordColour.subarray(v * 3, v * 3 + 3), i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(S[2], 3));
  S.forEach((arr, s) => g.setAttribute(`aS${s}`, new THREE.BufferAttribute(arr, 3)));
  g.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
  g.setAttribute("aColB", new THREE.BufferAttribute(colB, 3));
  g.setAttribute("aColW", new THREE.BufferAttribute(colW, 3));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 14);
  return g;
}
