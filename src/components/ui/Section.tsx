import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)} {...props} />;
}

type SectionProps = ComponentProps<"section"> & { bordered?: boolean };

/** Page section with consistent vertical rhythm and optional top rule. */
export function Section({ className, bordered = true, children, ...props }: SectionProps) {
  return (
    <section className={cn("py-20 sm:py-28", bordered && "border-t border-line", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Use "h1" only for the page's main heading. */
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({ eyebrow, title, intro, as: Tag = "h2", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Tag
        className={cn(
          "font-semibold tracking-tight text-balance",
          Tag === "h1" ? "text-4xl sm:text-6xl" : "text-3xl sm:text-5xl",
        )}
      >
        {title}
      </Tag>
      {intro && <p className="mt-6 text-lg leading-relaxed text-muted text-pretty">{intro}</p>}
    </div>
  );
}

/** Top-of-page header used by every route except Home. */
export function PageHeader({ eyebrow, title, intro }: Omit<SectionHeadingProps, "as" | "className">) {
  return (
    <header className="relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-blue/10 blur-3xl"
      />
      <Container className="relative">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} intro={intro} />
      </Container>
    </header>
  );
}
