# Aira Photography & Agnitantra Events — Build Journey

A chronological record of how this site was built, reconstructed from per-session summaries.
It exists so any future session (or human) can understand *why* the codebase looks the way it
does — the dead ends, the pivots, and the decisions that still constrain the code today.

> **Read this for history and rationale. For the current state of the code, read
> [CLAUDE.md](./CLAUDE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), and [ADMIN-CONSOLE.md](./ADMIN-CONSOLE.md).**

---

## The one thing to understand first: this project has two lives

Almost every early session summary flags a "repo mismatch." That is not a bug in the notes —
it *is* the story. The project lived in two places, in two eras:

| Era | Location | Stack | Roughly |
|---|---|---|---|
| **Era 1 — Sanity** | `…\OneDrive\Websites\Agnitantra Events\aira-site` | Next.js + **Sanity CMS** + Bunny + GSAP | Site scaffold → design → content wiring |
| **Era 2 — Custom console** *(current)* | `C:\dev\aira-site` | Next.js + **Neon + Bunny + Clerk**, no CMS, admin at `/manage` | Migration → hardening → polish |

The move from Era 1 to Era 2 happened because **Sanity Studio's image-array field broke and
couldn't be cleanly repaired** (details below). At that point the project relocated off OneDrive
(sync-locking was corrupting builds), dropped Sanity entirely, and grew its own admin console.

So when an old session says "I'm working in the OneDrive/Sanity repo and it doesn't match the
Neon grounding" — it was simply an earlier chapter that couldn't see the ending. Read top to
bottom and it's one continuous line.

---

## Era 1 — The Sanity build

### 1. Scaffold, Sanity setup, and first content seed
**~2026-06-18 onward · shipped (foundation)**

The starting point: a fresh **Next.js 16.2.9** app (App Router, TypeScript strict, Tailwind v4)
with **GSAP 3.15 + @gsap/react**, **Lenis**, and **Sanity 6 + next-sanity 13** as the CMS.

- Decided the shape of the whole product: **two sub-brands, one app** — *Aira Photography*
  (`/photography`) and *Agnitantra Events & Catering* (`/events`) as separate routes sharing
  nav and footer, not separate deployments.
- Authored Sanity schemas (`page`, `reel`, `siteSettings`, `review`) with **client-friendly,
  plain-English field labels** — a principle that survived the CMS swap and lives on in the
  admin console today.
- Established the enduring architecture helpers: `lib/gsap.ts` (`createMatchMedia()` for strict
  desktop/mobile animation isolation), `lib/bunny.ts` (Bunny Stream/Storage helpers), and a
  data layer with **stable function signatures** (`getPage`, etc.) — a foresight that later
  made the Sanity→Neon migration an import-path swap rather than a rewrite.
- Chose **Bunny for video** over YouTube from the start (privacy + CDN control).
- Seeded content programmatically (`scripts/seed.mjs`) rather than by hand in Studio.
- Corrected the brand naming early: the events side is **Agnitantra Events & Catering**.

> **Decision that still matters:** keeping the data-layer signatures CMS-agnostic. It's the
> single reason Era 2 was cheap.

### 2. Homepage identity — preloader morph, Nohemi, footer, About
**shipped (`c9c2484`)**

The homepage got its signature feel:

- **`HeroPreloader.tsx`** — a merged preloader+hero (inspired by Osmo's "crisp loading
  animation"): a center image expands to fill the viewport and *becomes* the hero background,
  then the title rises in via GSAP **SplitText** word-mask. Reworked from a fade/scrim hand-off
  (rejected as janky) into a structural reveal. `prefers-reduced-motion` guarded.
- **Nohemi** wired as a local variable font (9 weights).
- Footer rebuilt to a hand-sketched card layout; fixed a footer-flash-on-reload bug.
- Fixed the "Menu" nav button not hiding at the footer (ScrollTrigger retargeting + refresh).
- About section rebuilt toward an image-cluster layout with per-tile scroll parallax.
- Hero image optimized with **sharp** (16MB → ~200KB); originals kept in gitignored
  `_source-assets/`.

> **Working practice adopted here:** commit code but **leave `.md` files uncommitted**, so the
> working tree could be `git reset --hard` back to a known-good code state without losing notes.

### 3. Hero typography + site-wide page transition
**shipped (`f7db525`)**

- Ran an automated **mockup pipeline** — injected candidate fonts/backgrounds at runtime and
  screenshotted via Playwright, so dozens of options could be compared without touching source
  or committing throwaway edits.
- Outcome: **Sometimes Times** became the hero headline (title-case, near-white, faint glow).
  *(Licensing note: verify commercial clearance before launch.)*
- Implemented the **Codrops "vertical SVG path" page transition** site-wide (`PageTransition.tsx`),
  reduced-motion guarded, with guards to skip Studio/hash/external/modified-click navigations.

### 4. Real photos, working footer nav, first Vercel deploy
**2026-06-20 → 22 · shipped (`72d8547`, `f288c55`)**

- Swapped placeholder tiles for optimized real photos in the hero carousel and About boxes.
- **Rebuilt the footer from `position: fixed` to normal in-flow** — the fixed-behind-`main`
  pattern was intercepting clicks and making footer nav dead. This removed a whole class of bug.
- Ported Osmo's "Draw Random Underline" hover onto footer nav (GSAP DrawSVGPlugin), tinted
  brand-gold.
- **First production deploy**: repo set public, Vercel project created, Sanity env vars set,
  `vercel.json` pinning the Next preset, live at **aira-site-rose.vercel.app**.

> **Gotcha that bit us:** piping env values with a dotenv banner corrupted
> `NEXT_PUBLIC_SANITY_PROJECT_ID` and broke the build. Env values must be piped clean.

### 5. Photography gallery (Codrops column-drift) + Studio polish
**in-progress**

- Built **`ColumnDriftGallery.tsx`** — a from-scratch reimplementation of Codrops
  "OnScrollColumnsRows" (column drift + inner-image parallax, scrubbed). Rebuilt rather than
  copied verbatim, to respect the licensed original. Mobile keeps 4 columns by explicit choice.
- Wired the gallery to Sanity via fixed singleton IDs (`photographyPage`/`eventsPage`) so the
  client can't break the routing key by editing a field.
- Built a **client-friendly Studio** (named singletons, singleton lock, Vision dev-only).
- Optimized and uploaded **40 of 72** wedding photos to the gallery (idempotent `sharp` →
  WebP → Sanity asset script). *(Remaining 32 tracked in `PHOTOGRAPHY-UPLOAD-LOG.md`.)*
- Preloader now plays **once per browser session** (`sessionStorage` key).

### 6. Live content wiring — then the break
**2026-06-24 → 27 · pivot point**

This is where Era 1 ends. First, the good work landed:

- Built the **Bunny Stream reel pipeline** ("Option C"): `/api/upload-reel` proxy + a custom
  Studio upload field pushing raw video straight to Bunny. Uploaded 5 client reels.
  *(Reels via Bunny, not the CMS, because static CDNs can't do adaptive-bitrate video.)*
- Wired all pages to **live CMS data** — gallery, reels, reviews, contact/social.
- Seeded **15 real Google reviews**; added the "4.9★ · 148+ Google reviews" band to the
  testimonial marquee.
- Built the **/about** page from the client's raw brief.

Then **Sanity Studio's Photo Gallery (image-array) field stopped rendering.** Bumping
`sanity` 6.0.0 → 6.2.0 corrupted the dependency tree (`@sanity/ui` missing), and a full
`node_modules`/lockfile wipe + reinstall **did not cleanly resolve it**. With the client's
content-editing experience blocked, the call was made: **abandon Sanity.** All content was
exported to `migration-export/` and a Payload migration brief was written.

---

## The migration — Era 1 → Era 2

### 7. Sanity → custom Neon + Bunny admin console
**2026-06-30 · shipped (`258dcf2` checkpoint, `9c48d10`, `7f415f3`)**

The decisive session.

- **Payload evaluated and dropped.** It installed and was Next-16 compatible, but its CLI broke
  on **Node 24** (a `tsx` loader quirk). Rather than fight a heavyweight CMS for a simple
  photos/reels/reviews console, the choice was a **thin custom admin**.
- **Relocated the repo** from the OneDrive path to **`C:\dev\aira-site`** (git history preserved)
  to escape space-in-path + OneDrive sync-locking that was causing random build errors.
- **New stack:** Neon Postgres (text/records) + Bunny Storage (images) + Bunny Stream (video,
  unchanged). Created Bunny Storage zone `agnitantra-images` + pull zone.
- **The data-layer foresight paid off:** new `lib/db.ts` + `lib/cms/*` helpers matched the old
  Sanity signatures exactly, so only import paths changed in the 4 page files. Display
  components were untouched. All reads **fail soft** on DB error.
- **Removed Sanity completely** — deleted `sanity/`, `app/studio/`, uninstalled all packages,
  repointed `/studio` → `/manage` everywhere.
- **Seeded Neon** from the export (2 pages, 15 reviews, settings, 5 reels), re-imported and
  re-uploaded the 40 photos to Bunny Storage, verified live.
- **Built `/manage`** — shared-password login (signed HMAC cookie), Dashboard with
  Photos/Reels/Reviews/Settings tabs, **browser-side image compression** before upload
  (to stay under Vercel's 4.5MB body limit).

> **Decisions that still shape the code:** one media vendor (Bunny for everything, Neon stores
> only URLs); browser-side compression as a hard requirement; the fail-soft read contract.
>
> **Debt created here:** `/api/upload-reel` was left **unauthenticated**, and there was no
> login rate-limiting or server-side upload validation yet.

---

## Era 2 — Hardening and polish

### 8. Security hardening + multi-user accounts
**shipped (`28291c8`, `62a3f89`)**

- Closed the migration's security debt: authenticated the upload proxy, added login
  rate-limiting, upload size/mime validation, and security headers.
- Replaced the single shared password with **multi-user email+password accounts**
  (`admin_users` table, scrypt hashing), with the shared `ADMIN_PASSWORD` as a bootstrap
  fallback. *(This whole custom-auth layer was later retired in favor of Clerk — see #11.)*
- Mobile-optimized the admin console.

### 9. About-as-bento, scroll jitter fix, admin scoping, lightbox
**shipped (`69fa5a1`, `ab7069e`, `f67dfbc`, `9736200` … `ba79b2c`)**

- Redesigned About services as a **full-bleed bento marquee**.
- **Synced Lenis to the GSAP ticker** (`autoRaf: false`) to kill footer/parallax jitter — a
  root-cause fix for smoothness across the site.
- Hardcoded socials/contact/location (client-stable), scoped admin to Photos/Reels/Reviews.
- Built the **click-to-open photo lightbox** (draggable infinite slider) for Photography, then
  polished it repeatedly: opaque scrim, brighter slides, clean bordered nav buttons, serif
  counter, background scroll-lock (via a `window.__lenis` handle), hide the site nav while open.
- One emphasis/uncropped-photo experiment was tried and **reverted** as buggy.

### 10. Events catering menu (DB-driven) + SEO + first CLI deploy
**2026-07-01 · shipped (`753c0f2`)**

- Made the events catering menu **database-driven** (`menu_categories` / `menu_dishes` tables,
  editable via a new **MenuTab** in `/manage`).
- Added SEO essentials; fixed footer map flush.
- First **Vercel CLI production deploy**: linked the project, pushed the 6 required prod env
  vars (`DATABASE_URI`, `ADMIN_*`, `BUNNY_STORAGE_*`, CDN URL).

### 11. Clerk auth migration, lightbox/hero fixes, HLS reel player
**2026-07-02 → 04 · shipped (`ca3d790`, `b48cabb`, `8ca4ac5`, `10d686e`)**

The most recent shipped work.

- **Fixed the deploy pipeline for good:** repointed `origin` from the OneDrive folder to
  **`github.com/amalbycia/aira-site`**, so `push master` → GitHub → **auto-deploys to Vercel**.
- **Migrated `/manage` auth to Clerk (Google sign-in).** This closed a real hole — the old
  custom fallback logged in with *any* email + the shared password. `proxy.ts` now protects
  **only** `/manage` + `/api/admin/*` (public site stays open); `requireAdmin()` checks Clerk's
  `auth()`. The old auth stack (`session.ts`, `password.ts`, `rateLimit.ts`, `admin_users`) was
  deleted.
- **Fixed the lightbox properly:** active-slide highlight and counter are now derived from
  **geometry** (string-equality checks had given false test passes); reduced gallery drift so
  mid-scroll taps land on the right tile.
- Fixed the mobile hero white band (static `object-fit: cover` layer behind the carousel).
- Made `listMenu()` fail-soft so a transient Neon blip no longer crashes `/manage`.
- Footer now shows the **real Google Business location** (Changanassery, Kerala).
- Built a **custom Bunny HLS reel player** (`ReelCard.tsx`, hls.js 1.6.11, dynamically imported)
  — click-to-play **with sound**, native-HLS + MP4 fallback, one reel at a time. Live on both
  Events (4 reels) and Photography (5 reels).

> **Non-negotiable gotcha:** Clerk keys **must** be in Vercel env or the *entire* site 500s
> (ClerkProvider wraps all routes). Prod currently runs Clerk **dev keys** (visible dev banner) —
> swap to `pk_live`/`sk_live` once a real domain exists.

---

## Where things stand & open threads

**Planned, not yet built** (see [PLAN-ADMIN-REVAMP.md](./PLAN-ADMIN-REVAMP.md)):
- Split the admin into **Photography / Events** sections; make reels strictly per-page (drop the
  "both" scope). Migrate 4 "both" reels + 15 "both" reviews → events.
- Add a big **reviews rating hero** (4.9★ / 148+ Google reviews) above the events testimonial
  marquee.

**Client actions pending:**
- Clerk dashboard: set sign-up to Restricted, add real users, remove test accounts.
- Swap Clerk dev keys → live keys in Vercel once a domain exists.

**Content backlog:**
- 32 of 72 photography photos not yet uploaded.
- A faint watermark on an early hero background was never removed *(background has since changed).*

**Code cruft (low priority):**
- Several source files still carry **Sanity-era comments/type-names** and `next.config.ts` still
  allowlists the now-dead `cdn.sanity.io` image host. Harmless, but a scrub would remove
  confusion for future readers.

**Deliberately left alone** (per client): events page media layout, the footer,
`app/photography/page.tsx`, and `components/media/ColumnDriftGallery.tsx` (the gallery layout
is final — feed it data, don't restyle it).
