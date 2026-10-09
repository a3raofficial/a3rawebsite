"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { navLinks, primaryCta } from "@/content/site";
import { cn } from "@/lib/cn";

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 16,
    () => false,
  );

  // The menu is "open for" a specific path, so any route change closes it.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const close = () => setOpenFor(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenFor(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-line bg-obsidian/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-6 sm:h-20">
        <Logo onNavigate={close} />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-sm transition-colors hover:text-ink",
                      active ? "text-ink" : "text-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href={primaryCta.href} onNavigate={close} className={cn("hidden sm:inline-flex", open && "sm:hidden md:inline-flex")}>
            {primaryCta.label}
            <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </ButtonLink>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-line-strong text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpenFor(open ? null : pathname)}
          >
            {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </Container>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-obsidian md:hidden"
        >
          <Container className="flex h-full flex-col py-8">
            <ul className="flex flex-col">
              {[{ label: "Home", href: "/" }, ...navLinks].map((link) => (
                <li key={link.href} className="border-b border-line">
                  <Link
                    href={link.href}
                    onNavigate={close}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="flex items-center justify-between py-5 text-2xl font-medium tracking-tight"
                  >
                    {link.label}
                    <ArrowUpRight aria-hidden className="size-5 text-faint" />
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink href={primaryCta.href} onNavigate={close} size="lg" className="mt-auto w-full">
              {primaryCta.label}
              <ArrowUpRight aria-hidden className="size-4" />
            </ButtonLink>
          </Container>
        </nav>
      )}
    </header>
  );
}
