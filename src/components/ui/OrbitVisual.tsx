import { cn } from "@/lib/cn";

/**
 * CSS-only "A3RA Orbit": three tilted rings converging, in the logo's
 * blue-to-gold gradient. Placeholder for the planned 3D hero and its
 * permanent fallback. Purely decorative.
 */
export function OrbitVisual({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative aspect-square", className)}>
      <div className="absolute inset-[18%] rounded-full bg-blue/20 blur-3xl" />
      <div className="absolute inset-[30%] rounded-full bg-gold/10 blur-2xl" />
      <div className="absolute inset-0 [transform:rotateX(68deg)_rotateZ(-18deg)] [transform-style:preserve-3d]">
        <div className="orbit-ring orbit-spin" />
      </div>
      <div className="absolute inset-[6%] [transform:rotateY(64deg)_rotateZ(24deg)]">
        <div className="orbit-ring orbit-spin-reverse opacity-80" />
      </div>
      <div className="absolute inset-[12%] [transform:rotateX(58deg)_rotateY(-42deg)]">
        <div className="orbit-ring orbit-spin opacity-60" />
      </div>
    </div>
  );
}
