# Project Context — Aira Photography & Agnitantra Events

**Purpose of this file:** a single, current snapshot of what this project is, where it lives, how it
is built, and what is genuinely outstanding. Written 2026-08-15 by reading the repo, the docs, git
history, and the live site. Where an older doc contradicts this file, **this file is newer** — the
contradictions are called out explicitly in [§9](#9-stale-docs--known-contradictions).

---

## 1. What it is

A wedding photography + event management portfolio for James's client (**Amal Sebastian Kalarickal**),
based in Changanassery, Kerala. Two sub-brands live as separate pages inside one Next.js app:

- **Aira Photography** — visual storytelling, `/photography`
- **Agnitantra Events & Caterers** — full-service event management, `/events`

Content (photos, reels, reviews, catering menu) is owner-editable through a custom admin console at
`/manage`. There is **no third-party CMS**.

---

## 2. Where it lives

| | |
|---|---|
| **Working repo** | `C:\dev\aira-site` |
| **Old path (do not use)** | `C:\Users\alkes\OneDrive\Websites\Agnitantra Events\aira-site` |
| **GitHub** | `github.com/amalbycia/aira-site` (`origin`, branch `master`) |
| **Live domain** | https://agnitantraevents.com — **connected and serving, verified 2026-08-15** |
| **Vercel alias** | https://aira-site-rose.vercel.app (still resolves) |

The project **moved out of OneDrive on 2026-06-30** to escape a space-in-path + OneDrive
file-locking combination that caused random build errors. The OneDrive copy is a dead fallback —
its last commit is `258dcf2` (2026-06-30, pre-migration). **Work only in `C:\dev\aira-site`.**

Deploy is git-based and automatic: `git push origin master` → GitHub → Vercel production deploy.
No `vercel --prod` needed. To verify: `npx vercel ls aira-site` (top row should be ● Ready; some
older prod entries show UNKNOWN, which is harmless).

---

## 3. Stack

| Package | Version | Role |
|---|---|---|
| next | 16.2.9 | Framework (App Router, Turbopack) |
| react / react-dom | 19.2.4 | UI runtime |
| @clerk/nextjs | ^7.5.12 | Admin auth (Google sign-in) |
| @neondatabase/serverless | ^1.1.0 | Neon Postgres client |
| gsap + @gsap/react | ^3.15.0 / ^2.1.2 | Animation |
| lenis | ^1.3.23 | Smooth scroll |
| hls.js | ^1.6.11 | Custom Bunny HLS reel player |
| sharp | ^0.35.2 | Server-side image optimization (initial import) |
| tailwindcss | ^4 | Utility CSS |
| playwright | ^1.61.0 | devDep — present, no committed test suite |

Node v24. Note: Node 24 broke Payload's CLI — irrelevant now that Payload is gone, but a landmine
if anyone reintroduces a CLI-heavy tool.

---

## 4. Content infrastructure

**Neon Postgres** (`DATABASE_URI`) is the content store.
Tables: `pages`, `gallery_photos`, `reels`, `reviews`, `site_settings`, `menu_categories`,
`menu_dishes`. Schema reference in `lib/schema.sql`; client in `lib/db.ts` (tagged-template sql).

**Bunny Storage** — zone `agnitantra-images` (id 1621240) → `agnitantra-images.b-cdn.net`. Gallery
and cover images. Uploads are compressed to WebP **in the browser** before hitting the API.

**Bunny Stream** — library `aira-reels`, ID **691820**, region India →
`https://vz-d8b3817b-78d.b-cdn.net`. All reel video. Videos must never be inline-hosted.
Upload flow (verified): `POST /library/691820/videos` → guid, then `PUT .../videos/{guid}` with a
**raw binary body** and `content-type: application/octet-stream`. A multipart PUT returns HTTP 400
"Failed to read the request form". Transcode status: 0 created → 1 uploaded → 2 processing →
3 transcoding → 4 finished; playback URLs 403 until encoding completes.

### Data layer contract (important)

- Public pages read **only** via `lib/cms/getPage.ts` and `lib/cms/getContent.ts`
  (`getPage` / `getReviews` / `getSiteSettings` / `getMenu` / `footerPropsFromSettings`).
- Admin mutations go through `app/api/admin/*`, each guarded by `requireAdmin()`.
- Admin queries live in `lib/cms/admin.ts` — **never import that into a public page.**
- All public reads **fail soft** (return `[]` / `{}`), so a Neon blip degrades rather than crashes.

---

## 5. Admin console (`/manage`)

Auth is **Clerk with Google sign-in**. There is no allowlist — access control is simply which users
exist in the Clerk dashboard. `proxy.ts` protects **only** `/manage(.*)` and `/api/admin(.*)`:
admin APIs hard-401, the console page redirects to `/sign-in`. The public site stays open — do not
flip this to a default-protect model.

The console is organised **by page, not by content type**. A top-level switch picks Photography or
Events, then:

- **Photography** → Photos · Reels & Videos · Reviews
- **Events** → Photos · Reels & Videos · Events Menu · Reviews

`gallery_photos`, `reels` and `reviews` all carry a strict per-page `page` value
(`photography` | `events`). The old 3-way `"both"` scope is **retired**; `ContentScope` in
`lib/cms/admin.ts` is now an alias of `PageBrand`. Admin list APIs require a `?page=` query param
and reject anything else. A page with no reviews falls back to `PLACEHOLDER_REVIEWS` in
`TestimonialMarquee.tsx`. The events testimonial section leads with a rating hero (4.9 numeral +
gold stars + "148+ couples & families on Google"), rendered only when `googleRating` is passed.

The catering menu is DB-driven (`menu_categories` / `menu_dishes`), edited in the Events Menu tab.
`getMenu()` fails soft to `[]`, and `CateringMenu.tsx` then uses its hardcoded `FALLBACK_MENU`.

Deliberately **not** editable (hardcoded by design): socials, contact details, location text,
About copy.

### Auth history — do not rewire to the old stack

The original login had a real hole: a shared `ADMIN_PASSWORD` fallback created a session for
*whatever email was typed*. Rather than patch it, auth was handed to Clerk. The entire custom stack
(`LoginForm`, login/logout routes, `lib/auth/session.ts`, `rateLimit.ts`, `password.ts`, the Users
tab, the `admin_users` table) was **deleted**. `app/manage/login/` is now an empty leftover
directory. `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are still present in `.env.local` but are
**dead variables**.

> **Non-negotiable gotcha:** `ClerkProvider` wraps every route, so missing Clerk keys 500 the
> **entire site**, not just `/manage`.

---

## 6. Build history

1. **Sanity** — original CMS. Abandoned after repeated Studio breakage (a corrupted dep tree left
   `@sanity/ui` missing after a `sanity 6.0.0 → 6.2.0` bump).
2. **Payload CMS** — chosen as the replacement, then abandoned before completion (Node-24 CLI
   breakage + overkill for a two-job admin).
3. **Custom Neon + Bunny stack** — the actual answer, shipped in `9c48d10` (2026-06-30). 40 gallery
   photos, 15 reviews, 5 reels, settings and 2 pages were migrated across.
4. **Clerk auth, HLS reel player, lightbox fixes** — early July.
5. **Per-page admin split + per-page reviews + rating hero** — 2026-07-05.
6. **SEO/GEO layer + domain switch** — late July (see below).

### The most recent work (post-dates SITE-JOURNEY.md)

- `72a8e06` · 2026-07-20 — Footer: real WhatsApp/phone number, softened location line.
- `1f4b82e` · 2026-07-27 — **SEO/GEO layer.** Added `lib/structuredData.ts` (organization, website,
  breadcrumb, imageGallery, FAQ JSON-LD), `components/JsonLd.tsx`, `app/opengraph-image.tsx`
  (generated OG image), `public/llms.txt`, expanded `app/robots.ts`. Enlarged body copy site-wide
  for readability. Switched the canonical domain to **agnitantraevents.com**.
- `449fca3` · 2026-07-28 — Copy pass: "&" → "and" site-wide; reframed the `/about` intro block.
  (One deliberate exception: `BUSINESS.legalName` keeps its "&" to match the Google Business
  Profile exactly — NAP consistency. Do not "fix" it.)

Working tree is **clean** and in sync with `origin/master` as of 2026-08-15.

---

## 7. Key files

```
lib/
  site.ts            SITE_URL + BUSINESS — single source of truth for NAP, rating,
                     socials, areas served. Feeds metadata, JSON-LD and the footer.
  structuredData.ts  JSON-LD builders (organization / website / breadcrumb / gallery / FAQ)
  db.ts              Neon client
  schema.sql         Table definitions (reference — tables already exist)
  bunny.ts           Stream embed/HLS/thumbnail + Storage upload/delete helpers
  gsap.ts            GSAP + ScrollTrigger setup, matchMedia helper
  auth/guard.ts      requireAdmin() — checks Clerk auth()
  cms/               getPage.ts · getContent.ts (public) · admin.ts (admin only)

app/
  manage/            Admin console — Dashboard.tsx + tabs/, admin.css, compressImage.ts
  api/admin/         photos · reels · reviews · menu (all requireAdmin-guarded)
  api/upload-reel/   Server proxy streaming video → Bunny Stream
  opengraph-image.tsx      Generated 1200x630 social share image
  sign-in/[[...sign-in]]/  Clerk sign-in route

proxy.ts             Clerk middleware — gates ONLY /manage + /api/admin
scripts/             migrate-menu.mjs · migrate-scope.mjs · seed-photography-reviews.mjs (idempotent)
```

---

## 8. Non-negotiables

**Do not restyle** — the client has signed these off:
- `app/photography/page.tsx`
- `components/media/ColumnDriftGallery.tsx` (gallery layout is final — feed it data only)
- the events page media layout
- the footer

**Lenis must be driven by GSAP's ticker.** In `components/LenisProvider.tsx`:
`new Lenis({ autoRaf: false })`, `lenis.on('scroll', ScrollTrigger.update)`,
`gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`.
With two separate RAF loops, ScrollTrigger reads a 1–2 frame stale scroll position and every
scrubbed/parallax tween jitters — most visibly the footer. Never revert to `autoRaf: true`.
`/manage` deliberately has **no** Lenis (native scroll).

**Never invent APIs or paths.** Verify against installed packages in `node_modules` before
referencing any package API. This codebase is handed to a client and reviewed by other developers.

**Mobile/desktop isolation.** If a component differs meaningfully by viewport, split it into
`components/desktop/X.tsx` and `components/mobile/X.tsx` — editing one must never touch the other.

---

## 9. Stale docs & known contradictions

Verified against the live site on 2026-08-15:

| Claim in older docs | Actual status |
|---|---|
| "No custom domain — runs on aira-site-rose.vercel.app" (`HANDOVER-CHECKLIST.md`, `SITE-JOURNEY.md`) | **Wrong.** `agnitantraevents.com` returns 200 and serves `rel="canonical" href="https://agnitantraevents.com"`. |
| "No OG share image" (`HANDOVER-CHECKLIST.md`) | **Done** — `app/opengraph-image.tsx` shipped in `1f4b82e`. |
| "Placeholder contact `+91 00000 00000`" | **Done** — real number `+91 80897 03793` since `72a8e06`. |
| "Reviews can be scoped to both" (`HANDOVER-CHECKLIST.md`) | **Wrong** — the `"both"` scope was retired 2026-07-05. |
| "Users tab — up to 4 admin accounts" | **Wrong** — Users tab and `admin_users` deleted with the Clerk migration. |
| `TODO.md` | **Fully stale** — still documents Sanity setup, `/studio`, and `lib/imageUrl.ts`, none of which exist. |
| `SITE-JOURNEY.md` | Accurate up to 2026-07-05; **missing** the three most recent commits. |
| `HANDOVER-PAYLOAD.md` | Historical only — Payload was abandoned. |

---

## 10. Genuinely outstanding

**Launch-blocking**
- 🔴 **Production still serves Clerk `pk_test` keys.** Confirmed by fetching the live domain on
  2026-08-15 — the returned HTML contains `pk_test_…`, so the Clerk dev banner shows and dev-tier
  limits apply. Swap to `pk_live` / `sk_live` in Vercel env now that a real domain exists.
- 🟡 `NEXT_PUBLIC_SITE_URL` is **not set** in `.env.local`. It currently works only because
  `lib/site.ts` hardcodes `https://agnitantraevents.com` as the fallback. Setting it explicitly in
  Vercel is the intended design.
- 🟡 Clerk dashboard: set sign-up to Restricted, add the real admin users, remove test accounts.

**Content**
- 32 of 72 photography photos not yet uploaded.

**Recommended, not done**
- Analytics (Vercel Analytics or GA4) — nothing installed.
- Contact/enquiry form — "Enquire" currently just links to the Events page.
- Google Search Console verification + sitemap submission (now possible — the domain exists).
- Lighthouse pass on the live domain (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1).
- Full keyboard + screen-reader audit, if the client wants formal WCAG-AA sign-off.

**Cruft (low priority)**
- `next.config.ts:51` still allowlists the dead `cdn.sanity.io` image host.
- Sanity-era comments and type names linger in several source files.
- `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` are dead env vars.
- `app/manage/login/` is an empty leftover directory.
- The unused `admin_users` table is still in Neon.
- `graphql` is still a dependency in `package.json` — a Sanity-era leftover with no current use.

---

## 11. Working with James

Address him by name. He handles **all UI design himself** (Google Stitch, Claude web) and pastes
designs mid-project — do not build UI components, page content, or final styling unprompted.

When he pastes a design for a section that already has an implementation, **ask explicitly**
whether it replaces the existing component or is an alternative version. Never silently overwrite
working components.

He values production-grade code, organised documentation, and clear architectural reasoning — the
codebase is handed to the client and reviewed by other developers.
