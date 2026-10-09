import type { ComponentProps, ReactNode } from "react";
import { HeaderThreads, type ThreadPreset } from "@/components/three/stage/HeaderThreads";
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

/** Splits a heading into words that rise in one after another (CSS only). */
export function RisingWords({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
      <span className="word-rise inline-block" style={{ animationDelay: `${120 + i * 70}ms` }}>
        {word}
        {"\u00a0"}
      </span>
    </span>
  ));
}

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  /** Live threads state for this page. */
  threads?: ThreadPreset;
};

/** Top-of-page header used by every route except Home. */
export function PageHeader({ eyebrow, title, intro, threads }: PageHeaderProps) {
  return (
    <header className="relative flex min-h-[64svh] items-center overflow-hidden pt-32 pb-16 sm:min-h-[72svh] sm:pt-36 sm:pb-20">
      {threads && (
        <HeaderThreads
          preset={threads}
          className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_75%_30%,black_25%,transparent_70%)] lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[58%] lg:opacity-100 lg:[mask-image:linear-gradient(to_right,transparent,black_30%)]"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-blue/10 blur-3xl"
      />
      <Container className="relative">
        <div className="max-w-2xl">
          <p className="eyebrow fade-in">{eyebrow}</p>
          <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            <RisingWords text={title} />
          </h1>
          {intro && (
            <p className="fade-in mt-6 text-lg leading-relaxed text-muted text-pretty" style={{ animationDelay: "500ms" }}>
              {intro}
            </p>
          )}
        </div>
      </Container>
    </header>
  );
}
