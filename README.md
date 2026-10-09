# A3RA website

Website for A3RA, a strategy-led technology consultancy. One Next.js 16 app (pages + API) with TypeScript,
Tailwind CSS v4 and MongoDB Atlas for enquiries.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

## Editing content

All copy lives in `src/content/`:

| File | Contents |
| --- | --- |
| `site.ts` | Contact email, booking page path, response time, nav links |
| `booking.ts` | Discovery-call length, days, hours, notice period, how far ahead |
| `services.ts` | The three service pillars |
| `process.ts` | The five process stages and FAQ |
| `founders.ts` | Founder names, roles, bios, photos, phone numbers, LinkedIn |
| `projects.ts` | Portfolio entries (empty until real work is approved) |

Images live in `public/images/`.

## Threads (3D) and site motion

Hundreds of fine luminous threads — the A3RA "thread" story. The same threads blend between four shapes:
**tangle** (the problem), **three bundles** (strategy gold, data & AI pearl, engineering blue), the
**A3RA wordmark** woven from fibres (blue 3, like the logo), and one **braided rope** (the work moving forward).
Light pulses run along them like fibre optics.

- Geometry: `src/components/three/stage/threads.ts` (letter strokes, yarn tangle, bundles, braid).
  Renderer: `ThreadScene.tsx` (three.js + React Three Fiber; screen-space thread ribbons, additive light).
- Homepage (`components/home/Story.tsx`): on load the intro **autoplays** (~6 s: tangle → untangled → woven
  into A3RA) with a step indicator and Replay. Scrolling then carries the threads on: bundles (what we bring),
  braid (how it moves), back to A3RA (closing). Layouts per section: `DESKTOP` / `PORTRAIT` in `ThreadScene.tsx`.
- Inner pages: `PageHeader threads="services" | "process" | "projects" | "about"` (bundles, braid, tangle,
  wordmark) — presets in `HeaderThreads.tsx`.
- Other motion: rising-word titles, page fade, cursor spotlight on cards, scroll-filled Process timeline.
- Fallbacks: lighter quality on phones; reduced motion → the finished wordmark, static; no WebGL → logo image
  on the homepage, nothing in headers. Three.js loads when the browser is idle.

## Content rule

Each idea lives on one page. Other pages link to it rather than repeat it — including closing calls to action,
which take a page-specific `title`/`body` (no defaults).

## Enquiries (lead capture)

`POST /api/leads` (`src/app/api/leads/route.ts`, logic in `src/lib/leads.ts`):

1. Rejects non-JSON or bodies over 16 KB.
2. Validates with the shared Zod schema (`src/lib/validation.ts`); unknown fields are rejected.
3. Honeypot field `website` — filled-in submissions are accepted silently and discarded.
4. Rate limit: 5 enquiries per IP per hour (IP stored only as a salted SHA-256 hash).
5. Saves the lead to MongoDB **before** any email is sent.
6. After the response, emails the team (Reply-To = the prospect) and sends the prospect a confirmation,
   then records the result in `notifications.team` / `notifications.client`.

### `leads` collection

| Field | Notes |
| --- | --- |
| `_id` | ObjectId |
| `createdAt` | Submission time |
| `name`, `email`, `company?` | Contact details (email lower-cased) |
| `serviceInterest`, `problemDescription` | Enquiry |
| `budgetRange?`, `timeline?` | Optional ranges |
| `status` | `new` → `contacted` → `qualified` → `closed` (edit in Atlas) |
| `privacyConsent` | Always `true` (required to submit) |
| `source` | e.g. `contact-page` |
| `ipHash` | Salted hash, rate limiting only |
| `notifications` | `{ team, client, lastError?, updatedAt }`, each `pending`/`sent`/`failed`/`skipped` |

Indexes (created automatically on first request): `createdAt`, `status + createdAt`, `ipHash + createdAt`.

### Managing leads

Use MongoDB Atlas → Browse Collections → `leads`. Useful filters:

- New leads: `{ status: "new" }`
- Emails that didn't go out: `{ "notifications.team": { $in: ["failed", "skipped"] } }` — follow these up manually.

## Discovery calls (appointments)

Visitors pick an open 30-minute slot at `/contact/book` (Mon–Sat, 10:00–19:00 IST, at least 12 hours ahead,
up to 14 days out — change these in `src/content/booking.ts`).

- `GET /api/appointments/slots` — open slot times only (never who booked them).
- `POST /api/appointments` — same protections as enquiries (size limit, strict Zod schema, honeypot,
  3 requests per IP per hour), plus the slot must be on the grid and in the future.
- A unique partial index (`unique_active_slot`) allows only one `requested`/`confirmed` booking per slot,
  so double-booking returns 409 even under a race.
- After saving, the team gets an email (Reply-To = client) and the client gets "request received".

### `appointments` collection

| Field | Notes |
| --- | --- |
| `slotStart`, `slotEnd` | UTC Dates; emails show IST |
| `name`, `email`, `company?`, `topic` | From the form |
| `status` | `requested` → `confirmed` / `cancelled` → `completed` |
| `timeZone`, `source`, `privacyConsent`, `ipHash`, `notifications` | As for leads |

### Confirming a call (manual)

1. Open the notification email (or Atlas filter `{ status: "requested" }`).
2. Create a Google Calendar event at that time with **Add Google Meet video conferencing**, and add the client's
   email as a guest — Google sends them the invite with the Meet link. (Or reply to the notification email with the link.)
3. In Atlas, set the appointment's `status` to `"confirmed"`.
4. Can't make it? Reply with alternatives and set `status` to `"cancelled"` — this frees the slot on the site.

### MongoDB setup

1. Atlas → Database Access: create a user with **readWrite on `a3ra` and `a3ra_dev` only** (not atlasAdmin).
2. Atlas → Network Access: `0.0.0.0/0` is needed for serverless hosting (no fixed IPs); rely on a strong password.
3. Put the connection string in `MONGODB_URI`. Use `MONGODB_DB=a3ra_dev` locally and `a3ra` in production.

### Gmail setup

1. Turn on 2-Step Verification for a3ra.official@gmail.com.
2. Create an App Password and set `GMAIL_APP_PASSWORD`.
3. Without it, leads are still saved and marked `skipped`.

When the a3ra.in domain is live, swap the transport in `src/lib/email.ts` for a domain-verified provider
(SPF/DKIM/DMARC) and update `GMAIL_USER`/`NEXT_PUBLIC_SITE_URL`.

## Checks

```bash
npm run lint
npm run typecheck
npm test          # unit tests (Vitest)
npm run build
```

See `CLAUDE.md` for project conventions.
