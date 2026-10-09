import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/content/services";

/** Homepage pillar card linking to its section on the Services page. */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services#${service.id}`}
      className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-7 transition-colors hover:border-blue/40 hover:bg-surface-2"
    >
      <span className="font-mono text-xs text-faint">{service.number}</span>
      <h3 className="mt-8 text-2xl font-semibold tracking-tight">{service.title}</h3>
      <p className="mt-2 text-sm text-gold-soft/80">{service.forWho}</p>
      <p className="mt-5 leading-relaxed text-muted">{service.summary}</p>
      <ul className="mt-6 space-y-2 border-t border-line pt-6 text-sm text-muted">
        {service.deliverables.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-blue" />
            {item}
          </li>
        ))}
      </ul>
      <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-ink">
        Explore this service
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
