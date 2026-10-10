"use client";

import { useEffect, useRef } from "react";

const POINTS = 18;
const SEGMENT = 9;

/**
 * A short luminous thread that trails the cursor, simulated as a little rope
 * (verlet integration). Desktop pointers only; off for reduced motion. The
 * loop sleeps as soon as the thread has settled.
 */
export function ThreadCursor() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const pts = Array.from({ length: POINTS }, () => ({ x: -100, y: -100, px: -100, py: -100 }));
    const pointer = { x: -100, y: -100, inside: false };
    let raf = 0;
    let running = false;
    let still = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const step = () => {
      // Head follows the pointer; the rest swings behind it with a little gravity.
      pts[0].x = pointer.x;
      pts[0].y = pointer.y;
      let motion = 0;
      for (let i = 1; i < POINTS; i++) {
        const p = pts[i];
        const vx = (p.x - p.px) * 0.9;
        const vy = (p.y - p.py) * 0.9;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + 0.35;
        motion += Math.abs(vx) + Math.abs(vy);
      }
      for (let k = 0; k < 4; k++) {
        for (let i = 1; i < POINTS; i++) {
          const a = pts[i - 1];
          const b = pts[i];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const diff = (d - SEGMENT) / d;
          if (i === 1) {
            b.x -= dx * diff;
            b.y -= dy * diff;
          } else {
            a.x += dx * diff * 0.5;
            a.y += dy * diff * 0.5;
            b.x -= dx * diff * 0.5;
            b.y -= dy * diff * 0.5;
          }
        }
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (pointer.inside) {
        ctx.globalCompositeOperation = "lighter";
        // Electric crackle: each frame the filament jitters a little, more so while moving.
        const crackle = Math.min(4, 0.6 + motion * 0.08);
        const jittered = pts.map((p, i) =>
          i === 0 ? p : { x: p.x + (Math.random() - 0.5) * crackle, y: p.y + (Math.random() - 0.5) * crackle },
        );
        for (const pass of [
          { width: 6, alpha: 0.12 },
          { width: 1.4, alpha: 0.9 },
        ]) {
          for (let i = 1; i < POINTS; i++) {
            const a = jittered[i - 1];
            const b = jittered[i];
            const t = i / POINTS;
            // White-hot at the cursor, through blue, to gold at the tail.
            const r = Math.round(79 + (255 - 79) * t);
            const g = Math.round(141 + (194 - 141) * t);
            const bl = Math.round(255 + (122 - 255) * t);
            ctx.strokeStyle = `rgba(${r},${g},${bl},${(1 - t) * pass.alpha})`;
            ctx.lineWidth = pass.width * (1 - t) + 0.4;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        ctx.globalCompositeOperation = "source-over";
      }

      still = motion < 0.2 ? still + 1 : 0;
      if (still > 30) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(step);
    };

    const wake = () => {
      if (running) return;
      running = true;
      still = 0;
      raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!pointer.inside) {
        for (const p of pts) Object.assign(p, { x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY });
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      wake();
    };
    const onLeave = () => {
      pointer.inside = false;
      wake();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[90] h-full w-full" />;
}
