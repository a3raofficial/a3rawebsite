"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/*
 * "The A3RA Orbit": three twisted ribbons — strategy, data & AI, engineering —
 * woven into one form, in the logo's blue-to-gold palette. Procedural geometry,
 * no external assets. The canvas never receives pointer events; pointer
 * position is read from the window so it can't block clicks.
 */

const BLUE = new THREE.Color("#2f6bff");
const ICE = new THREE.Color("#7fb0ff");
const PEARL = new THREE.Color("#f2e6d4");
const GOLD = new THREE.Color("#e2a453");
const DEEP_GOLD = new THREE.Color("#b8732c");
const STOPS = [BLUE, ICE, PEARL, GOLD, DEEP_GOLD, BLUE];

function gradient(t: number, out: THREE.Color) {
  const scaled = (((t % 1) + 1) % 1) * (STOPS.length - 1);
  const i = Math.floor(scaled);
  return out.copy(STOPS[i]).lerp(STOPS[i + 1], scaled - i);
}

type RibbonOptions = {
  radiusX: number;
  radiusY: number;
  wobble: number;
  width: number;
  /** Full twists around the loop (integer keeps the seam continuous). */
  twists: number;
  phase: number;
  segments?: number;
  widthSegments?: number;
};

function createRibbon({
  radiusX,
  radiusY,
  wobble,
  width,
  twists,
  phase,
  segments = 280,
  widthSegments = 14,
}: RibbonOptions) {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const point = new THREE.Vector3();
  const next = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const radial = new THREE.Vector3();
  const lift = new THREE.Vector3();
  const across = new THREE.Vector3();
  const bulge = new THREE.Vector3();
  const color = new THREE.Color();
  const Z = new THREE.Vector3(0, 0, 1);

  const pathAt = (u: number, target: THREE.Vector3) =>
    target.set(radiusX * Math.cos(u), radiusY * Math.sin(u), wobble * Math.sin(2 * u + phase));

  for (let i = 0; i <= segments; i++) {
    const u = (i / segments) * Math.PI * 2;
    pathAt(u, point);
    pathAt(u + 0.001, next);
    tangent.subVectors(next, point).normalize();
    radial.crossVectors(tangent, Z).normalize();
    lift.crossVectors(radial, tangent).normalize();

    const angle = twists * u + phase;
    across.copy(radial).multiplyScalar(Math.cos(angle)).addScaledVector(lift, Math.sin(angle));
    bulge.crossVectors(tangent, across).normalize();

    // Width swells and narrows around the loop, like the band in the logo.
    const w = width * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(2 * u + phase * 1.7)));
    gradient(i / segments + phase / (Math.PI * 2), color);

    for (let j = 0; j <= widthSegments; j++) {
      const v = (j / widthSegments) * 2 - 1;
      // Lens-shaped cross-section catches highlights like thick glass.
      const thickness = (1 - v * v) * w * 0.12;
      positions.push(
        point.x + across.x * w * v + bulge.x * thickness,
        point.y + across.y * w * v + bulge.y * thickness,
        point.z + across.z * w * v + bulge.z * thickness,
      );
      colors.push(color.r, color.g, color.b);
    }
  }

  const row = widthSegments + 1;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < widthSegments; j++) {
      const a = i * row + j;
      const b = a + row;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const RIBBONS: Array<RibbonOptions & { rotation: [number, number, number] }> = [
  { radiusX: 1.9, radiusY: 1.25, wobble: 0.35, width: 0.36, twists: 1, phase: 0, rotation: [0.25, 0.1, 0] },
  { radiusX: 1.75, radiusY: 1.35, wobble: 0.4, width: 0.28, twists: 1, phase: (Math.PI * 2) / 3, rotation: [-0.5, 0.55, 0.6] },
  { radiusX: 1.8, radiusY: 1.2, wobble: 0.3, width: 0.24, twists: 2, phase: (Math.PI * 4) / 3, rotation: [0.6, -0.5, -0.7] },
];

/** Image-based lighting from three's built-in studio room — no HDR download. */
function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const texture = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    room.dispose();
    return texture;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return <primitive object={env} attach="environment" />;
}

function Orbit({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const geometries = useMemo(() => RIBBONS.map((r) => createRibbon(r)), []);

  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const { x, y } = pointer.current;
    if (spin.current) {
      // Slow idle drift.
      spin.current.rotation.z += dt * 0.06;
      spin.current.rotation.y += dt * 0.025;
    }
    if (group.current) {
      // Pointer tilt, damped and limited to ~14°.
      const ease = 1 - Math.exp(-dt * 2.5);
      group.current.rotation.x += (-y * 0.25 - group.current.rotation.x) * ease;
      group.current.rotation.y += (x * 0.25 - group.current.rotation.y) * ease;
    }
    if (keyLight.current) {
      keyLight.current.position.x += (x * 4 - keyLight.current.position.x) * (1 - Math.exp(-dt * 2));
      keyLight.current.position.y += (y * 3 - keyLight.current.position.y) * (1 - Math.exp(-dt * 2));
    }
  });

  return (
    <>
      <ambientLight intensity={0.05} />
      <directionalLight position={[-4, 2, 3]} intensity={2.2} color="#4c8dff" />
      <directionalLight position={[4, -1, 2]} intensity={1.8} color="#e6b272" />
      <pointLight ref={keyLight} position={[0, 0, 3.5]} intensity={6} distance={10} color="#ffffff" />
      <group ref={group}>
        <group ref={spin}>
          {geometries.map((geometry, i) => (
            <mesh key={i} geometry={geometry} rotation={RIBBONS[i].rotation}>
              <meshPhysicalMaterial
                vertexColors
                side={THREE.DoubleSide}
                metalness={0.9}
                roughness={0.12}
                clearcoat={1}
                clearcoatRoughness={0.05}
                iridescence={0.5}
                iridescenceIOR={1.4}
                envMapIntensity={0.85}
              />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
}

type HeroSceneProps = {
  /** Called once the first frame is ready, so the fallback can fade out. */
  onReady?: () => void;
  /** Called if WebGL fails or the context is lost. */
  onError?: () => void;
};

export default function HeroScene({ onReady, onError }: HeroSceneProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);

  // Pointer from the window (normalised -1..1), so the canvas needs no pointer events.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Stop rendering while scrolled out of view or the tab is hidden.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    let inView = true;
    const update = () => setVisible(inView && document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 8.4], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.domElement.addEventListener("webglcontextlost", () => onError?.(), { once: true });
          requestAnimationFrame(() => onReady?.());
        }}
      >
        <StudioEnvironment />
        <Orbit pointer={pointer} />
      </Canvas>
    </div>
  );
}
