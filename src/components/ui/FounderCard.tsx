import Image from "next/image";
import { ArrowUpRight, Phone } from "lucide-react";
import { telHref, type Founder } from "@/content/founders";
import { cn } from "@/lib/cn";

type FounderCardProps = {
  founder: Founder;
  /** "compact" for the homepage preview, "full" for the About page. */
  variant?: "compact" | "full";
};

export function FounderCard({ founder, variant = "compact" }: FounderCardProps) {
  return (
    <article className="spotlight group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-line-strong">
      {/* Portraits are on white; multiply onto a cool grey so they sit in the dark palette. */}
      <div className="relative aspect-[4/4.4] overflow-hidden bg-[#c9cfdb]">
        <Image
          src={founder.photo}
          alt={`Portrait of ${founder.name}`}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover object-top mix-blend-multiply transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold tracking-tight">{founder.name}</h3>
        <p className="mt-1 text-sm text-blue-soft">{founder.role}</p>
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-faint" aria-label="Focus areas">
          {founder.focus.map((item, i) => (
            <li key={item} className={cn(i > 0 && "before:mr-3 before:content-['·']")}>
              {item}
            </li>
          ))}
        </ul>
        {variant === "full" && <p className="mt-5 leading-relaxed text-muted">{founder.bio}</p>}
        {variant === "full" && (founder.phone || founder.linkedinUrl) && (
          <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-6 text-sm">
            {founder.phone && (
              <a href={telHref(founder.phone)} className="inline-flex items-center gap-2 text-muted hover:text-ink">
                <Phone aria-hidden className="size-4 text-blue" />
                {founder.phone}
              </a>
            )}
            {founder.linkedinUrl && (
              <a
                href={founder.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-muted hover:text-ink"
              >
                LinkedIn
                <ArrowUpRight aria-hidden className="size-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
