import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** A3RA wordmark (cropped from the full logo) linking home. */
export function Logo({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <Link href="/" onNavigate={onNavigate} className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/images/brand/a3ra-wordmark.png"
        alt="A3RA home"
        width={669}
        height={162}
        priority
        className="h-6 w-auto sm:h-7"
      />
    </Link>
  );
}
