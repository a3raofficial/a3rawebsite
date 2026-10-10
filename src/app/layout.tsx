import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Spotlight } from "@/components/effects/Spotlight";
import { ThreadCursor } from "@/components/effects/ThreadCursor";
import { LogoTransition } from "@/components/effects/LogoTransition";
import { founders } from "@/content/founders";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "A3RA | AI, Software & Business Optimization",
    template: "%s | A3RA",
  },
  description: site.description,
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: "A3RA | AI, Software & Business Optimization",
    description: site.description,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/icon.png`,
  slogan: site.tagline,
  description: site.description,
  ...(site.contactEmail && { email: site.contactEmail }),
  founder: founders.map((f) => ({
    "@type": "Person",
    name: f.name,
    ...(f.linkedinUrl && { sameAs: f.linkedinUrl }),
  })),
};

export const viewport: Viewport = {
  themeColor: "#090b10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-[60] rounded-lg bg-ink px-4 py-2 text-obsidian focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          // Only facts that are true today: name, site, logo, contact email, founders.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Spotlight />
        <ThreadCursor />
        <LogoTransition />
      </body>
    </html>
  );
}
