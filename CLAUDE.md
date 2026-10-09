@AGENTS.md

# A3RA website — project conventions

Marketing site for A3RA, a strategy-led technology consultancy ("Building a Brighter Era.").
Goal: convert visitors into project enquiries and discovery calls.

## Stack
- Next.js 16 App Router (Turbopack, `cacheComponents` + `partialPrefetching` on), React 19, TypeScript.
- Tailwind CSS v4 — design tokens live in `src/app/globals.css` under `@theme`.
- `lucide-react` icons, `zod` validation. Keep dependencies minimal; ask before adding any.
- MongoDB Atlas (`mongodb` driver) for leads; Gmail SMTP via `nodemailer` for email; Vitest for unit tests.
- Discovery calls are booked on-site (`/contact/book`) into an `appointments` collection; Meet links are sent manually.
- 3D = luminous threads (`components/three/stage/threads.ts` + `ThreadScene.tsx`, three + @react-three/fiber, no drei):
  one set of threads blends tangle → bundles → A3RA wordmark → braid. Homepage intro autoplays on load
  (`components/home/Story.tsx`, GSAP), then scroll carries it; inner headers via `PageHeader threads=…`.
  Palette is deep navy (`--color-obsidian` is #0b1430). Thread quads need `side: DoubleSide` (they share one
  winding). Per-frame uniforms are module-level (React lint forbids mutating hook values). No bloom pass.
- Never repeat content across pages: one page owns each idea, others link. `ClosingCta` needs unique title/body.
- Planned: launch SEO. Domain a3ra.in pending.

## Layout
- `src/app/*` — routes: `/`, `/services`, `/projects`, `/about`, `/process`, `/contact`.
- `src/content/*` — all editable marketing copy (services, process + FAQ, founders, projects, site config).
  Change copy here, not in page files.
- `src/components/ui` — shared primitives (Button, Section/PageHeader, Reveal, cards, ClosingCta, OrbitVisual).
- `src/components/layout` — Navbar, Footer, Logo. `src/components/home` — homepage-only sections.
- `src/lib/validation.ts` — enquiry Zod schema, shared by the form and the server endpoint.
- `src/app/api/leads/route.ts` — enquiry endpoint (HTTP concerns only); `src/lib/leads.ts` — the flow, with injected deps for tests;
  `src/lib/appointments.ts` + `src/lib/slots.ts` — booking flow and slot grid (config in `src/content/booking.ts`);
  `src/lib/http.ts` — shared request parsing; `src/lib/mongodb.ts`, `src/lib/email.ts` — server-only integrations. No MVC layers; one app, no FE/BE split.

## Rules
- Never invent clients, testimonials, metrics, credentials, addresses or company history.
  Unknown values in `src/content/site.ts` stay `null` and the UI hides them.
- No fake functionality or fake success messages.
- Persist a lead before sending email; email failure must never lose a lead. Never log enquiry contents or PII.
- Tests that hit MongoDB use `a3ra_dev` and must delete what they create.
- Server Components by default; `"use client"` only for interaction (Navbar, Reveal, forms, 3D).
- One `h1` per page; semantic HTML; visible focus; respect `prefers-reduced-motion`.
- Palette: obsidian base, soft white text, electric blue (primary accent) and warm gold (secondary), matched to the logo.
  Use accents sparingly.
- With Cache Components, routes stay mounted (React Activity) after navigation — reset transient UI state
  (menus, popovers) on navigation.
- Secrets stay server-side; never prefix them with `NEXT_PUBLIC_`.
- Do not deploy, buy anything or create paid accounts without explicit approval. Do not git commit — the user commits.

## Commands
- `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test`
