import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Still image of the logo ring. Shown while the 3D scene loads, and
 * permanently when WebGL is unavailable or the scene fails.
 */
export function LogoFallback({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center sm:justify-end sm:pr-[6%]", className)}>
      <Image
        src="/images/brand/a3ra-logo-web.png"
        alt=""
        width={951}
        height={826}
        priority
        sizes="(min-width: 640px) 45vw, 90vw"
        className="w-[90vw] max-w-[640px] opacity-80 mix-blend-screen sm:w-[45vw]"
      />
    </div>
  );
}
