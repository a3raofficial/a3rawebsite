import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { navLinks, primaryCta, site } from "@/content/site";

/** Copyright year, computed at build time and cached with the page. */
async function currentYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await currentYear();

  return (
    <footer className="border-t border-line">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image
            src="/images/brand/a3ra-logo-web.png"
            alt="A3RA — Building a Brighter Era"
            width={951}
            height={826}
            className="h-auto w-36 mix-blend-screen"
          />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            We find the problem. We build the solution. We make it work.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-3 text-sm">
            {[{ label: "Home", href: "/" }, ...navLinks].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted transition-colors hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href={primaryCta.href} className="text-muted transition-colors hover:text-ink">
                Start a conversation
              </Link>
            </li>
            {site.contactEmail && (
              <li>
                <a href={`mailto:${site.contactEmail}`} className="text-muted transition-colors hover:text-ink">
                  {site.contactEmail}
                </a>
              </li>
            )}
          </ul>
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-line py-6 text-xs text-faint sm:flex-row sm:justify-between">
        <p>© {year} A3RA</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="transition-colors hover:text-ink">
            Privacy
          </Link>
          <p>{site.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
