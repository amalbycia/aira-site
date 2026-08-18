# SITE MASTER — Aira Photography & Agnitantra Events

**One document, everything.** Business facts, client requirements, every piece of user-facing
copy, the full tech stack, infrastructure, credentials map, data contracts, and current state.

Compiled 2026-08-18 by reading the live repo at `C:\dev\aira-site` (branch `master`,
HEAD `3021a33`), the client brief, git history, and the deployed site.

> Where this file disagrees with an older doc in the repo, **this file is newer**.
> See [§13 Stale docs](#13-stale-docs--contradictions).

---

## Table of contents

1. [The business](#1-the-business)
2. [Client requirements](#2-client-requirements)
3. [Site map & page structure](#3-site-map--page-structure)
4. [Every piece of copy on the site](#4-every-piece-of-copy-on-the-site)
5. [Tech stack](#5-tech-stack)
6. [Infrastructure & services](#6-infrastructure--services)
7. [Database schema](#7-database-schema)
8. [Data layer contract](#8-data-layer-contract)
9. [Admin console (`/manage`)](#9-admin-console-manage)
10. [Design system (v3 "Maroon Cinema")](#10-design-system-v3-maroon-cinema)
11. [File map](#11-file-map)
12. [SEO / GEO layer](#12-seo--geo-layer)
13. [Stale docs & contradictions](#13-stale-docs--contradictions)
14. [Version history](#14-version-history)
15. [Non-negotiables](#15-non-negotiables)
16. [Outstanding work](#16-outstanding-work)

---

## 1. The business

Two sub-brands, one company, one Next.js app:

| Sub-brand | Page | What it is |
|---|---|---|
| **Aira Photography** | `/photography` | Wedding + portrait photography and cinematography |
| **Agnitantra Events & Caterers** | `/events` | Full-service event management and catering |

### Company background (client-provided, verbatim)

> Founded in 2018 by Amal Sebastian Kalarickal, Aira Photography & Agnitantra Events &
> Caters has established itself as a premier, all-inclusive event management solution.
> The company seamlessly integrates creative artistry with logistical expertise to bring
> diverse celebrations to life. At its core, the firm delivers exceptional visual
> storytelling through high-quality photography, videography, and comprehensive event
> shoot coverage. Beyond capturing memories, they transform venues with striking stage
> decorations and organize flawless stage programs, ensuring that every event has a
> captivating and professional presence.
>
> Driven by a commitment to full-service excellence, the company handles every intricate
> detail of event organization to provide a stress-free experience for its clients. Their
> extensive portfolio features top-tier catering services that elevate the culinary
> experience, alongside premium car rentals for elegant arrivals. To ensure seamless
> execution and high entertainment value, they provide state-of-the-art light and sound
> systems, professional makeup artistry, and talented dancers. By managing everything
> from technical production to live entertainment, Amal Sebastian Kalarickal's venture
> stands as a trusted partner for creating sophisticated, memorable, and meticulously
> coordinated events.

### Business facts — NAP & identity

Source of truth: **`lib/site.ts`** → the `BUSINESS` object. Metadata, JSON-LD and the footer
all read from it.

| Field | Value |
|---|---|
| Legal name | `Agnitantra Events & Caterers` — **keeps the `&`** to match the Google Business Profile exactly (NAP consistency). Do not "fix" it. |
| Brand name | Aira Photography and Agnitantra Events |
| Founder | Amal Sebastian Kalarickal |
| Founded | 2018 (site says "nine years", "9+ years") |
| Phone | `+91 80897 03793` (`+918089703793`) |
| WhatsApp | `918089703793` |
| Email | `hello@agnitantra.com` |
| Street | Kurishummood, Chethipuzha Kadavu |
| Locality | Changanassery |
| Region | Kerala |
| Postcode | 686104 |
| Country | IN |
| Coordinates | 9.459812, 76.548263 |
| Google rating | 4.9 from 148 reviews |
| Google Business | https://www.google.com/maps?cid=10454241291312957415 |
| Live domain | **https://agnitantraevents.com** |
| Vercel alias | https://aira-site-rose.vercel.app (still resolves) |

**Areas served:** Changanassery · Kottayam · Kerala · Kochi · Thiruvananthapuram · Thrissur
(destination events on request).

**Socials (`sameAs`):**
- Instagram (photography) — https://www.instagram.com/aira__photography_
- Instagram (events) — https://www.instagram.com/agnitantra_events_and_caterers
- Facebook — https://www.facebook.com/AgnitantraEvents/
- YouTube — https://www.youtube.com/channel/UCJBvYbfXgCFZeEbQ6DOOpmg
- Linktree — https://linktr.ee/AIRAPHOTOGRAPHYTM

### Full service scope (client's own list)

Wedding photography · Videography & films · Event shoot coverage · Stage decoration ·
Stage programs · Catering · Light and sound · Makeup artistry · Car rentals ·
Dancers and entertainment.

---

## 2. Client requirements

### Raw requirements (verbatim, from `CLIENTRAWDETAILS.md`)

- Gallery to be added (photos)
- Google reviews shown live on site
- Videos, photos, and reels on both pages
- Aira Photography and Aira Events & Catering are two separate pages
- Simple, non-complicated nav — single scroll covers about + footer
- Admin console for client to manage content
- Hero section: two buttons with arrows, leading to Photography page and Events page respectively
- Location: written text only, **no map embed**
- Business has 9+ years of experience — feature this

### How each was satisfied

| Requirement | Status | Implementation |
|---|---|---|
| Photo gallery | Done | `GalleryWithLightbox` + `FilmstripGallery`, DB-fed from `gallery_photos` |
| Google reviews live | Partial | Reviews stored in Neon and admin-editable, plus a Google rating hero (4.9 / 148) linking to the GBP. **Not** a live Google API pull. |
| Videos/photos/reels both pages | Done | Per-page `reels` + `gallery_photos` (Bunny Stream / Bunny Storage) |
| Two separate pages | Done | `/photography` and `/events` |
| Simple nav | Done | 4 links: Home · Photography · Events · About. Nothing else. |
| Admin console | Done | Custom `/manage` (Sanity was abandoned — see §14) |
| Hero: two arrow buttons | Done | **Diptych hero** — the two brands ARE the hero, each panel a full-height link with an arrow CTA |
| Location text only, no map | Done | `LocationBlock` — written address + a "View on Google Maps" *link* (no embed) |
| 9+ years featured | Done | Home stat strip `9+ Years of experience`; "Nine years of weddings" heading; About copy; metadata |

### Deliberately out of scope (client never asked)

Map embeds · separate About page¹ · separate Contact page · blog · booking/enquiry form.

¹ *An `/about` page does now exist — added during redesign. The client's "single scroll covers
about" requirement is still met on the home page; `/about` is an extra.*

### Not editable by design (hardcoded)

Socials · contact details · location text · About copy. There is no Settings tab, on purpose.

---

## 3. Site map & page structure

**Nav (everywhere):** Home · Photography · Events · About, plus a WhatsApp CTA.

| Route | File | Sections |
|---|---|---|
| `/` | `app/page.tsx` | Preloader → Diptych Hero → Intro (+ stats) → Word marquee → Testimonials → Footer |
| `/photography` | `app/photography/page.tsx` | PageHero → Gallery (lightbox) → Reels strip → Testimonials → Location → Footer |
| `/events` | `app/events/page.tsx` | PageHero → StatStrip → ServicesList → Gallery → Reels → Catering Menu → Testimonials → Location → Footer |
| `/about` | `app/about/page.tsx` | PageHero → AboutStory (founder story + full scope) → Footer |
| `/manage` | `app/manage/page.tsx` | Admin console (Clerk-gated, `noindex`) |
| `/sign-in` | `app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in |
| `/robots.txt`, `/sitemap.xml`, `/opengraph-image` | generated | SEO |

All three public content pages use `export const revalidate = 60` (ISR) so admin edits appear
within a minute without a redeploy.

---

## 4. Every piece of copy on the site

### 4.1 Global metadata

- **Title (default):** `Aira Photography and Agnitantra Events — Weddings and Celebrations in Kerala`
- **Title template:** `%s · Aira Photography and Agnitantra Events`
- **Description:** *Wedding photography and full-service event management across Kerala — nine years of decor, catering, stage, sound and photography, handled as one team.*
- **Keywords:** wedding photography Kerala · event management Kerala · catering Kerala · wedding planner · Agnitantra Events · Aira Photography
- **Geo hints:** `geo.region=IN-KL` · `geo.placename=Changanassery, Kerala` · `geo.position=9.459812;76.548263`

### 4.2 Home — Hero (diptych)

Topline: `Weddings & celebrations` · `Kerala · Since 2018`

| | Panel 01 | Panel 02 |
|---|---|---|
| Links to | `/photography` | `/events` |
| Kicker | Wedding photography & films | Decor · catering · production |
| Name | **AIRA** | **AGNITANTRA** |
| Serif line | Photography | Events & Catering |
| CTA (with arrow) | Our Photography | Events & Catering |
| Image | `/images/about-2.webp` | `/images/hero-tile-1.webp` |

Screen-reader H1: *Aira Photography and Agnitantra Events — weddings and celebrations in Kerala*

### 4.3 Home — Intro

- Eyebrow: **About us**
- Heading: **Nine years of weddings, *told properly.***
- Lede: *Founded in 2018, Aira Photography and Agnitantra Events and Caterers brings creative artistry and full-service event management together — photography, videography, decor, catering, and coordination, handled as one team so every family gets our full attention.*
- Stats: `9+ Years of experience` · `4.9 Rated on Google` · `148+ Families served`
- CTA: **Our story** → `/about`

### 4.4 Home — Word marquee

`Weddings · Photography · Cinematography · Stage Decor · Catering · Light & Sound · Makeup · Entertainment`
(separated by ✦, alternating solid/outline type, 42s loop)

### 4.5 Photography page

- **Metadata title:** Wedding Photography in Kerala — Aira Photography
- **Metadata description:** *Aira Photography — timeless wedding and portrait photography and cinematography across Kerala. Nine years capturing weddings in Changanassery, Kottayam, Kochi and beyond.*
- **Keywords:** wedding photography Kerala · best wedding photographer Kerala · wedding photographer Changanassery · wedding photographer Kottayam · candid wedding photography Kerala · wedding cinematography Kerala
- **Hero eyebrow:** Captured in light
- **Hero title:** Aira Photography
- **Hero subtitle:** *Weddings, portraits and the moments between — told in stills and film, with nine years behind the lens.*
- **Gallery:** eyebrow `The gallery` / heading `Stories, frame by frame`
- **Reels:** eyebrow `In motion` / heading `Films and reels`
- **Location:** eyebrow `Find us` / heading `Where we shoot`
  - *Based in Kerala — available across India and beyond.*
  - *Destination weddings welcome; we travel for the right story.*
- Footer Instagram → `aira__photography_`

### 4.6 Events page

- **Metadata title:** Event Management and Catering in Kerala — Agnitantra Events
- **Metadata description:** *Agnitantra Events and Caterers — the best event management in Kerala. Decor, stage, catering, light and sound, makeup, cars and entertainment handled as one team. Nine years of weddings and celebrations across Kerala.*
- **Keywords:** event management Kerala · best event management in Kerala · wedding planner Kerala · catering services Kerala · event management Changanassery · wedding decor Kerala
- **Hero eyebrow:** Every celebration, in full *(admin-overridable)*
- **Hero title:** Agnitantra Events and Caterers *(admin-overridable)*
- **Hero subtitle:** *Decor, stage, catering, sound, makeup and more — one team handling every detail so your family can simply enjoy the day.* *(admin-overridable)*
- **Gallery heading:** Celebrations we've made *(admin-overridable)* / eyebrow `Moments`
- **Menu heading:** A menu worth staying for. *(admin-overridable)* / eyebrow `At the table`
- **Location:** eyebrow `Find us` / heading `Where we work`
  - *Based in Kerala — serving weddings and events across the state and beyond.*
  - *Tell us your venue; we bring the whole production to you.*
- Footer Instagram → `agnitantra_events_and_caterers`

#### Services list (`ServicesList.tsx`) — eyebrow `What we do`, heading `Everything, under one roof.`

| # | Service | Blurb |
|---|---|---|
| 01 | Stage Decoration | Striking stage and venue transformations that set the tone for the day. |
| 02 | Stage Programs | Flawlessly run stage programs and event flow, start to finish. |
| 03 | Catering | Top-tier catering — from traditional sadya to live counters. |
| 04 | Light and Sound | State-of-the-art light and sound systems for any scale of celebration. |
| 05 | Makeup Artistry | Professional bridal and party makeup, on schedule and on point. |
| 06 | Car Rentals | Premium cars for elegant arrivals and departures. |
| 07 | Dancers | Talented dancers and live entertainment to lift the room. |
| 08 | Wedding Photography | Full event shoot coverage by Aira Photography — stills and film. |

#### Catering menu — `FALLBACK_MENU` (shown only when the DB menu is empty)

**Vegetarian:** Kerala Sadya (banana-leaf feast) · Avial & Olan · Paneer Butter Masala ·
Vegetable Stew with Appam · Ghee Rice & Kadala Curry · Palada Pradhaman

**Non-Vegetarian:** Malabar Chicken Biryani · Karimeen Pollichathu · Beef Ularthiyathu ·
Nadan Chicken Roast · Fish Moilee · Mutton Stew with Idiyappam

**Live Counters:** Dosa & Appam station · Kerala Porotta counter · Chaat & street-food bar ·
Grill & barbecue station · Fresh juice & tender coconut

**Desserts:** Assorted Payasam bar · Unniyappam & Ela Ada · Tender-coconut pudding ·
Live ice-cream counter · Festive baked sweets

*(The live menu in Neon was seeded from this exact list, so the site looked identical after the
migration.)*

#### Events FAQ (feeds FAQ JSON-LD rich results)

1. **What areas in Kerala does Agnitantra Events serve?** — *Agnitantra Events and Caterers is based in Changanassery and serves weddings and events across Kerala — including Kottayam, Kochi, Thiruvananthapuram and Thrissur — and travels for destination events.*
2. **What services does Agnitantra Events provide?** — *We handle every part of a celebration as one team: wedding photography and cinematography (Aira Photography), stage decoration, catering, light and sound, stage programs, makeup artistry, car rentals and entertainment.*
3. **How long has Agnitantra Events been operating?** — *Founded in 2018 by Amal Sebastian Kalarickal, the team has nine years of experience delivering weddings and events across Kerala.*
4. **Does Agnitantra provide both photography and event management?** — *Yes. Aira Photography and Agnitantra Events and Caterers are one team, so photography, videography and full event management are coordinated together under one roof.*

### 4.7 About page

- **Metadata title:** About Us — Aira Photography and Agnitantra Events, Kerala
- **Hero eyebrow:** Our story / **title:** One team, every detail
- **Hero subtitle:** *Founded in 2018 by Amal Sebastian Kalarickal — bringing creative artistry and full-service event management together under one roof.*
- **Story eyebrow:** The story / **heading:** One team, *every detail.*
- **Body (3 paragraphs — the client's brief, lightly re-punctuated):**
  1. *Founded in 2018 by Amal Sebastian Kalarickal, Aira Photography and Agnitantra Events and Caterers has established itself as a premier, all-inclusive event management solution. The company seamlessly integrates creative artistry with logistical expertise to bring diverse celebrations to life.*
  2. *At its core, the firm delivers exceptional visual storytelling through high-quality photography, videography, and comprehensive event shoot coverage. Beyond capturing memories, they transform venues with striking stage decorations and organise flawless stage programs, ensuring that every event has a captivating and professional presence.*
  3. *Driven by a commitment to full-service excellence, the company handles every intricate detail of event organisation to provide a stress-free experience for its clients — top-tier catering, premium car rentals, state-of-the-art light and sound systems, professional makeup artistry, and talented dancers. By managing everything from technical production to live entertainment, the team stands as a trusted partner for creating sophisticated, memorable and meticulously coordinated events.*
- **Scope section:** eyebrow `The full scope` / heading `What we handle`, listing:
  Wedding Photography · Videography & Films · Event Shoot Coverage · Stage Decoration ·
  Stage Programs · Catering · Light and Sound · Makeup Artistry · Car Rentals ·
  Dancers and Entertainment

### 4.8 Footer (every page)

- Eyebrow: **Get in touch**
- Heading: **Tell us about *your day.***
- Body: *Share your date and what you have in mind — we'll come back to you quickly, and we travel across Kerala and beyond.*
- Buttons: **WhatsApp us** (prefilled message: *"Hi Agnitantra, I'd like to enquire about your services."*) · **+91 80897 03793**
- Columns:
  - **Visit** — Kurishummood, Chethipuzha Kadavu, Changanassery, Kerala 686104 → Google Maps · *Call us anytime*
  - **Contact** — +91 80897 03793 · hello@agnitantra.com
  - **Explore** — Home · Photography · Events · About
  - **Follow** — Instagram (page-specific) · Facebook · YouTube · Linktree
- Giant hollow **AGNITANTRA** wordmark = back-to-top button, floods cream on hover

### 4.9 `public/llms.txt` (AI-crawler summary)

Full text lives at `public/llms.txt`. Summary line:

> Full-service wedding photography and event management in Kerala, India. One team handling
> photography, cinematography, stage decoration, catering, light and sound, makeup, transport
> and entertainment. Founded in 2018 by Amal Sebastian Kalarickal; nine years of weddings and
> celebrations across Kerala.

---

## 5. Tech stack

**Runtime:** Node v24. Package manager: npm.
Note: Node 24 breaks Payload's CLI — irrelevant now, but a landmine if a CLI-heavy tool is added.

### Dependencies

| Package | Version | Role |
|---|---|---|
| `next` | 16.2.9 | Framework — App Router, Turbopack |
| `react` / `react-dom` | 19.2.4 | UI runtime |
| `@clerk/nextjs` | ^7.5.12 | Admin auth (Google sign-in) |
| `@neondatabase/serverless` | ^1.1.0 | Neon Postgres client (tagged-template `sql`) |
| `gsap` | ^3.15.0 | Animation — ships SplitText, MorphSVG, ScrollTrigger, Flip, Draggable free |
| `@gsap/react` | ^2.1.2 | `useGSAP` hook |
| `lenis` | ^1.3.23 | Smooth scroll |
| `hls.js` | ^1.6.11 | Custom Bunny HLS reel player |
| `sharp` | ^0.35.2 | Server-side image optimization (import scripts) |
| `graphql` | ^16.14.2 | Sanity-era leftover, **unused** — safe to remove |

### Dev dependencies

`typescript ^5` · `tailwindcss ^4` + `@tailwindcss/postcss` · `eslint ^9` +
`eslint-config-next 16.2.9` + `eslint-config-prettier ^10.1.8` · `prettier ^3.8.4` ·
`playwright ^1.61.0` (installed, **no committed test suite**) · `@types/{node,react,react-dom}`

### Scripts

```
npm run dev            next dev
npm run build          next build
npm start              next start
npm run lint           eslint
npm run format         prettier --write .
npm run format:check   prettier --check .
```

### Fonts

- **Nohemi** — display + UI grotesk. **Self-hosted** via `next/font/local` from
  `public/fonts/Nohemi/` (Light 300 / Regular 400 / Medium 500 / SemiBold 600, woff2).
- **Cormorant Garamond** — via `next/font/google`, 400/500/600 + italic. Reserved for the
  single italic accent word inside headlines.
- Both `display: "swap"`, self-hosted at build → no external font requests, no CLS.

### Security headers (`next.config.ts`)

`X-Content-Type-Options: nosniff` · `Referrer-Policy: strict-origin-when-cross-origin` ·
`X-Frame-Options: SAMEORIGIN` ·
`Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` ·
`/manage/*` gets `X-Robots-Tag: noindex, nofollow`.

A full CSP is **deliberately omitted** — it would need per-nonce wiring for Next's inline
bootstrap and the animation libs.

Image config: `qualities: [75, 80, 82]`; `remotePatterns` allow `*.b-cdn.net`, the configured
Bunny CDN host, and (dead) `cdn.sanity.io`.

---

## 6. Infrastructure & services

| Concern | Service | Details |
|---|---|---|
| **Hosting** | Vercel | Project `aira-site`, org `amalbycias-projects` |
| **Repo** | GitHub | `github.com/amalbycia/aira-site`, branch `master` |
| **Deploy** | Git-based, automatic | `git push origin master` → GitHub → Vercel production. **No `vercel --prod` needed.** Verify with `npx vercel ls aira-site` |
| **Database** | Neon Postgres | `DATABASE_URI` |
| **Images** | Bunny Storage | Zone `agnitantra-images` (id 1621240) → `agnitantra-images.b-cdn.net` |
| **Video** | Bunny Stream | Library `aira-reels`, ID **691820**, region India → `https://vz-d8b3817b-78d.b-cdn.net` (PullZone 6068885, StorageZone 1615433) |
| **Auth** | Clerk | Google social sign-in; access control = which users exist in the Clerk dashboard |
| **Local repo** | `C:\dev\aira-site` | **NOT** the OneDrive path — see below |

> **Repo location.** The project moved out of OneDrive on 2026-06-30 to escape a
> space-in-path + OneDrive file-locking combination causing random build errors. The old copy at
> `C:\Users\alkes\OneDrive\Websites\Agnitantra Events\aira-site` is a **dead fallback**
> (last commit `258dcf2`). Work only in `C:\dev\aira-site`.

### Environment variables

All must exist in **both** `.env.local` (dev) and **Vercel** (prod).

| Var | Purpose |
|---|---|
| `DATABASE_URI` | Neon Postgres connection string |
| `BUNNY_STREAM_LIBRARY_ID` | `691820` |
| `BUNNY_STREAM_API_KEY` | Library key (41 chars) — uploads/list, server-side |
| `BUNNY_ACCOUNT_API_KEY` | Account key (72 chars) — management API only |
| `NEXT_PUBLIC_BUNNY_CDN_URL` | Stream pull-zone host |
| `BUNNY_STORAGE_ZONE` | `agnitantra-images` |
| `BUNNY_STORAGE_API_KEY` | Storage zone key |
| `NEXT_PUBLIC_BUNNY_STORAGE_CDN_URL` | Storage pull-zone host |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Prod still serves a `pk_test` key — see §16 |
| `CLERK_SECRET_KEY` | Clerk server key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` + fallback redirect URLs | Clerk routing |
| `NEXT_PUBLIC_SITE_URL` | **Not set** — `lib/site.ts` falls back to the hardcoded domain |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | **Dead variables** — the custom auth stack was deleted |

> **Non-negotiable gotcha:** `ClerkProvider` wraps every route, so missing Clerk keys **500 the
> entire site**, not just `/manage`.

### Bunny Stream upload flow (verified working)

1. `POST https://video.bunnycdn.com/library/691820/videos`, header `AccessKey: <library key>`,
   JSON body `{"title": "..."}` → returns `{guid, status: 0}`
2. `PUT https://video.bunnycdn.com/library/691820/videos/{guid}`, header `AccessKey: <library key>`,
   **raw binary body**, `content-type: application/octet-stream`.
   A multipart-form PUT returns **HTTP 400 "Failed to read the request form"**.
3. Bunny transcodes async: `0` created → `1` uploaded → `2` processing → `3` transcoding →
   `4` finished. Playback URLs **403 until encoding completes**.

Playback: `{CDN}/{guid}/playlist.m3u8` (HLS) · `{CDN}/{guid}/thumbnail.jpg` ·
`{CDN}/{guid}/preview.webp` · MP4 fallback per rendition. Helpers in `lib/bunny.ts`.

Images upload from the admin with **in-browser WebP compression** (`app/manage/compressImage.ts`)
before hitting the API.

---

## 7. Database schema

Neon Postgres. Reference DDL in `lib/schema.sql`; tables already exist. Client in `lib/db.ts`.

| Table | Purpose | Key columns |
|---|---|---|
| `pages` | Per-brand page copy | `slug` (`photography`\|`events`), `description`, `location_text`, + **18 nullable content columns** (below) |
| `gallery_photos` | Gallery images | `url`, `alt`, `caption`, `page`, `sort_order` |
| `reels` | Reel videos | `bunny_video_id`, `title`, `thumbnail_url`, `page`, `sort_order` |
| `reviews` | Testimonials | `reviewer_name`, `rating`, `review_text`, `review_date`, `page`, `sort_order` |
| `site_settings` | Legacy settings | Largely superseded by hardcoded values |
| `menu_categories` | Catering categories | `id serial pk`, `label`, `sort_order`, `created_at` |
| `menu_dishes` | Catering dishes | `id serial pk`, `category_id → menu_categories ON DELETE CASCADE`, `name`, `sort_order`, `created_at` |
| `admin_users` | **Unused** — retired with the Clerk migration; still sits in Neon | |

### `page` scoping — strict, no "both"

`gallery_photos`, `reels` and `reviews` all carry a strict per-page value:
`photography` | `events`. The old 3-way `"both"` scope was **retired 2026-07-05**;
`ContentScope` in `lib/cms/admin.ts` is now just an alias of `PageBrand`. Admin list APIs
**require** a `?page=` query param and reject anything else.

### The 18 `pages` content columns (added by `scripts/migrate-page-content.mjs`)

```
hero_eyebrow · hero_title · hero_subtitle
intro_eyebrow · intro_heading · intro_body
services_heading · menu_heading · gallery_heading · reels_heading
cta_label · cta_href
stat_1_value · stat_1_label · stat_2_value · stat_2_label · stat_3_value · stat_3_label
```

All **nullable and additive** — every field falls back to the component's built-in copy when
null, so the site looks identical until the owner edits something. **This migration has already
been applied to the live Neon database**, and it is safe for older versions because `getPage()`
selects only the columns it knows about.

### Migration / seed scripts (`scripts/`, all idempotent)

| Script | What it does |
|---|---|
| `migrate-menu.mjs` | Creates `menu_categories` + `menu_dishes`, seeds the Kerala menu |
| `migrate-page-content.mjs` | Adds the 18 nullable page-content columns |
| `migrate-scope.mjs` | Moved 4 `both` reels + 15 `both` reviews → `events` |
| `seed-photography-reviews.mjs` | Seeded photography reviews from a copy of the events set |
| `seed.mjs` | Initial content seed |
| `upload-photography-gallery.mjs` | Bulk photo import → Bunny Storage |
| `optimize-hero-tiles.mjs` / `optimize-about-tiles.mjs` | sharp → WebP local hero/about tiles |
| `fix-brands.mjs`, `test-token.mjs` | One-off utilities |
| `create-admin-users-table.mjs` | Legacy — the table it creates is unused |

---

## 8. Data layer contract

This contract is what makes a UI redesign safe. **It survived two full redesigns unchanged.**

```
Public pages ──read──► lib/cms/getPage.ts       (getPage)
                       lib/cms/getContent.ts    (getReviews, getMenu, getSiteSettings,
                                                 footerPropsFromSettings)
                                │
                                └──► lib/db.ts (Neon) + lib/bunny.ts (CDN URL builders)

Admin UI ──mutate──► app/api/admin/**  ──guarded by──► requireAdmin()  (lib/auth/guard.ts)
                            │
                            └──► lib/cms/admin.ts   NEVER import into a public page
```

**Rules:**
- Public pages read **only** through `getPage.ts` / `getContent.ts`.
- All public reads **fail soft** — return `[]` / `{}` on DB error, so a Neon blip degrades the
  page instead of crashing it.
- Every `app/api/admin/*` route calls `requireAdmin()`.

### Types the UI consumes (`components/media/types.ts`, `lib/cms/*`)

```ts
type GalleryPhoto = { src: string; alt: string; caption?: string }

type ReelItem = {
  kind: "reel"; poster: string; videoSrc?: string; hlsSrc?: string;
  alt: string; caption?: string; span: MediaSpan
}

type ReviewItem = { reviewerName: string; rating: number; reviewText: string; date: string }

type MenuCategory = { id: string; label: string; dishes: string[] }

type PageContent = {
  heroEyebrow?, heroTitle?, heroSubtitle?, introEyebrow?, introHeading?, introBody?,
  servicesHeading?, menuHeading?, galleryHeading?, reelsHeading?, ctaLabel?, ctaHref?,
  stats: { value: string; label: string }[]
}

type PageData = { description?, locationText?, content: PageContent,
                  gallery: GalleryPhoto[], reels: ReelItem[] }
```

`getPage()` maps a reel row → playable URLs automatically:
`poster` ← `thumbnail_url` or `getBunnyThumbnailUrl()`, `hlsSrc` ← `getBunnyHlsUrl()`,
`videoSrc` ← `getBunnyMp4Url(id, "720p")`.

Stats only render when **both** halves of a value/label pair are filled in.

### Fallback chain (nothing ever renders blank)

| Content | Empty/DB-down fallback |
|---|---|
| Photography gallery | `PHOTOGRAPHY_PHOTOS` in `app/photography/clusters.ts` |
| Photography reels | `PHOTOGRAPHY_REELS` in `app/photography/clusters.ts` |
| Events gallery | `EVENTS_PHOTOS` in `app/events/clusters.ts` |
| Events reels | Section is **hidden entirely** when empty |
| Catering menu | `FALLBACK_MENU` in `CateringMenu.tsx` |
| Reviews | `PLACEHOLDER_REVIEWS` |
| Any page-content field | The component's hardcoded default via `??` |

---

## 9. Admin console (`/manage`)

**Auth: Clerk, Google sign-in.** No allowlist — access control is simply *which users exist in
the Clerk dashboard* (2–4 admins, comfortably in the free tier).

`proxy.ts` protects **only** `/manage(.*)` and `/api/admin(.*)`:
- Admin APIs → hard **401** (never redirect an API)
- Console page → redirect to `/sign-in`
- **The public site stays open. Do not flip this to a default-protect model.**

### Structure — organised by page, not by content type

```
Photography              Events
  ├─ Photos                ├─ Photos
  ├─ Reels & Videos        ├─ Reels & Videos
  └─ Reviews               ├─ Events Menu
                           ├─ Page Content
                           └─ Reviews
```

| Section | Edits | Backed by |
|---|---|---|
| Photos | Gallery images for that page | `gallery_photos` + Bunny Storage |
| Reels & Videos | Reels for that page | `reels` + Bunny Stream |
| Reviews | That page's testimonial marquee | `reviews` |
| Events Menu | Catering categories + dishes | `menu_categories` / `menu_dishes` |
| Page Content | Hero copy, section headings, 3 stat figures, CTA | the 18 `pages` columns |

`/manage` deliberately has **no Lenis** (native scroll) and its own `admin.css`.

### API routes (all `requireAdmin()`-guarded)

```
app/api/admin/photos/route.ts            · /[id] · /reorder
app/api/admin/reels/route.ts             · /[id]
app/api/admin/reviews/route.ts           · /[id]
app/api/admin/menu/route.ts              · /[id] · /dishes · /dishes/[id]
app/api/admin/page-content/route.ts
app/api/upload-reel/route.ts             (server proxy streaming video → Bunny Stream)
```

### Auth history — do not rewire to the old stack

The original login had a real hole: a shared `ADMIN_PASSWORD` fallback created a session for
*whatever email was typed*. Rather than patch it, auth was handed to Clerk and the entire custom
stack was **deleted** — `LoginForm`, login/logout routes, `lib/auth/session.ts`, `rateLimit.ts`,
`password.ts`, the Users tab, the `admin_users` table.

---

## 10. Design system (v3 "Maroon Cinema")

Defined in `app/globals.css`. Token *names* were kept from v2 so every component module re-skins
from the tokens alone — `--forest` holds maroon, deliberately.

### Palette

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f5ede0` | Page background (cream) |
| `--paper-deep` | `#eee3d0` | Alternating section bands |
| `--paper-warm` | `#e8d9c4` | Warm accent surface |
| `--ink` | `#1f0d0d` | Primary text |
| `--ink-soft` | `#5a3535` | Body copy, captions |
| `--ink-faint` | `#96756a` | Muted detail |
| `--forest` | `#7a1f1f` | **Maroon** — brand accent, dark sections, buttons |
| `--forest-deep` | `#5a1616` | Deeper maroon |
| `--forest-soft` | `#9a3030` | Softer maroon |
| `--gold` | `#c9a96e` | Eyebrows, rules, small accents |
| `--gold-soft` | `#dfc090` | Soft gold |
| `--line` | `rgba(31,13,13,.14)` | Hairlines |
| `--line-strong` | `rgba(31,13,13,.3)` | Stronger rules |
| `--line-invert` | `rgba(245,237,224,.22)` | Rules on dark |

No pure black, no pure white.

### Typography

- **Display + UI:** Nohemi (grotesk, self-hosted) — `--font-display`, `--font-ui`
- **Serif accent:** Cormorant Garamond italic — `--font-serif`, one accent word per headline
- Fluid scale `--step--1` … `--step-5` (`clamp()`), display end runs to `9rem`
- Body: weight 300, line-height 1.65, never below 16px on mobile
- Headings: weight 500, line-height 1.02, letter-spacing `-0.02em`, `text-wrap: balance`
- Eyebrows: 11–12px, `letter-spacing: .18em`, uppercase, gold

### Space & motion

- `--gutter: clamp(1.25rem, 4vw, 4rem)` · `--section-y: clamp(4.5rem, 10vh, 9.5rem)`
- `--measure: 62ch` · `--maxw: 1360px` · 8px base
- Eases: `--ease-out: cubic-bezier(.22,1,.36,1)` · `--ease-expo: cubic-bezier(.16,1,.3,1)` · `--dur: .42s`
- Helper classes: `.shell` · `.section` · `.section--deep` · `.section--forest` · `.eyebrow` ·
  `.display` · `.display--lg` · `.lede` · `.accent` · `.btn` (+ `--ghost`, `--light`)

### Signature elements

- **Diptych hero** — the two brands as two full-height panels; SplitText char-rise entrance; desktop hover swells one half. The client's two-button requirement, made physical.
- **Counter preloader** — 000→100 on a maroon curtain; the last 10 points complete only when fonts + hero image are genuinely ready. Session-gated (`sessionStorage`), 1.5s hard cap, home page only, never gates content (it is an overlay).
- **Filmstrip gallery** — desktop pins and pulls the strip horizontally (one transform, fixed aspect-ratios for deterministic width); mobile gets a calm vertical grid.
- **Custom cursor** — gold ring lerping after the pointer, swells over interactive targets. `pointer: fine` only; the native cursor is never hidden.
- **Film grain** — one fixed overlay, pure CSS SVG-noise data URI, 4.5% opacity, static, `pointer-events: none`.
- **Word marquee** — duplicated track + GSAP `modifiers` for a seamless 42s wrap; alternating solid/hollow type.
- **Review marquee** — full-bleed boxed quote cards, seamless half-track wrap, pause on hover/focus, 5-line clamp; reduced-motion → native scrollable row.
- **Footer wordmark** — giant hollow "AGNITANTRA" that is a back-to-top button, floods cream on hover. Footer links use the Osmo draw-in underline (in from the left, out to the right via a transform-origin flip).
- **Reel play/pause** — Osmo morphing toggle via GSAP `MorphSVGPlugin` (ships with 3.15, verified in `node_modules` — not a CDN script), `{type:"rotational", map:"complexity"}`, 0.5s, `power4.inOut`.

### Motion rules

- All `ScrollTrigger`s are `once: true`
- No parallax on mobile
- `prefers-reduced-motion` short-circuits to the final state everywhere
- Lenis stays GSAP-ticker driven (see §15)
- Reveal primitive: `[data-reveal]` fade + 24px rise, stagger ~60ms

---

## 11. File map

```
app/
  layout.tsx              Fonts, metadata, JsonLd, ClerkProvider, LenisProvider, SiteNav, Cursor
  page.tsx                Home
  globals.css             Design tokens + base + helper classes
  about/page.tsx
  photography/page.tsx  + clusters.ts    (fallback photos/reels)
  events/page.tsx       + clusters.ts    (fallback photos)
  not-found.tsx
  opengraph-image.tsx     Generated 1200x630 share image
  robots.ts · sitemap.ts
  sign-in/[[...sign-in]]/page.tsx
  manage/                 Dashboard.tsx · layout.tsx · page.tsx · admin.css · compressImage.ts
    tabs/                 PhotosTab · ReelsTab · ReviewsTab · MenuTab · PageContentTab
  api/admin/              photos · reels · reviews · menu · page-content
  api/upload-reel/

components/
  SiteNav · SiteFooter · FooterWordmark · Cursor · Preloader · Reveal · JsonLd
  LenisProvider · PageHero · StatStrip · LocationBlock · Testimonials · ReviewMarquee
  home/                   Hero · Intro · Marquee
  about/                  AboutStory
  events/                 ServicesList · CateringMenu
  media/                  FilmstripGallery · GalleryWithLightbox · PhotoViewer
                          ReelsStrip · ReelCard · PlayPauseToggle · types.ts
  (each paired with a .module.css)

lib/
  site.ts                 SITE_URL + BUSINESS — single source of truth for NAP
  structuredData.ts       JSON-LD builders
  db.ts                   Neon client
  schema.sql              Table reference
  bunny.ts                Stream embed/HLS/MP4/thumbnail + Storage upload/delete
  gsap.ts                 GSAP + ScrollTrigger setup, matchMedia helper
  auth/guard.ts           requireAdmin() — checks Clerk auth()
  cms/                    getPage.ts · getContent.ts (public) · admin.ts (admin only)

proxy.ts                  Clerk middleware — gates ONLY /manage + /api/admin
next.config.ts            Security headers, image remotePatterns, qualities [75,80,82]
scripts/                  Migrations + seeds (all idempotent)
public/
  images/                 about-1..4.webp · hero-tile-1..4.webp · hero-bg.jpg
                          footer-roses.webp · placeholders/
  fonts/Nohemi/           Light · Regular · Medium · SemiBold (woff2)
  llms.txt
```

---

## 12. SEO / GEO layer

Shipped 2026-07-27 (`1f4b82e`).

- **`lib/structuredData.ts`** — JSON-LD builders: `organizationSchema`, `websiteSchema`,
  `breadcrumbSchema`, `imageGallerySchema`, `faqSchema`. Rendered via `components/JsonLd.tsx`.
  - Site-wide (in `layout.tsx`): organization + website
  - Photography: breadcrumb + ImageGallery (each photo an ImageObject crediting Aira)
  - Events: breadcrumb + FAQ + ImageGallery
  - About: breadcrumb
- **`app/opengraph-image.tsx`** — generated 1200x630 share image
- **`public/llms.txt`** — AI-crawler summary of brands, services, NAP, pages
- **`app/robots.ts`** + **`app/sitemap.ts`**
- Canonical: `https://agnitantraevents.com`, verified serving
  `rel="canonical" href="https://agnitantraevents.com"` on 2026-08-15
- Body copy enlarged site-wide for readability
- Local-intent geo meta hints in `layout.tsx`

**NAP consistency is a real ranking signal** — schema NAP matches the Google Business Profile
exactly. That is why `BUSINESS.legalName` keeps its `&`, even though the 2026-07-28 copy pass
(`449fca3`) changed `&` → `and` everywhere else.

---

## 13. Stale docs & contradictions

| Doc | Status |
|---|---|
| `PROJECT-CONTEXT.md` | Accurate to **2026-08-15 but pre-v3-ship** — it describes the v1 design as live. v3 shipped the same day (`3021a33`). Infrastructure sections still correct. |
| `SITE-JOURNEY.md` | Accurate to 2026-07-05; missing everything after |
| `TODO.md` | **Fully stale** — still documents Sanity, `/studio`, `lib/imageUrl.ts`, none of which exist. Ignore. |
| `HANDOVER-PAYLOAD.md` | Historical only — Payload was abandoned |
| `HANDOVER-CHECKLIST.md` | Says "no custom domain", "no OG image", "placeholder phone", "reviews can be both" — **all four wrong now** |
| `CLIENTRAWDETAILS.md` | Client brief — still the authority on requirements, but its "Sanity Studio at `/studio`" and CMS sections are obsolete (admin is `/manage`) |
| `ADMIN-CONSOLE.md` | Accurate, except it says `middleware.ts` — the file is actually **`proxy.ts`** |
| `REDESIGN-PLAN.md` | The v2 plan; v3 superseded the palette/type but kept the structure and CMS contract |
| `VERSIONS.md` | Accurate and current |

---

## 14. Version history

### CMS journey

1. **Sanity** — original CMS. Abandoned after repeated Studio breakage (a corrupted dep tree left `@sanity/ui` missing after a `sanity 6.0.0 → 6.2.0` bump).
2. **Payload CMS** — chosen as the replacement, abandoned before completion (Node-24 CLI breakage + overkill for a two-job admin).
3. **Custom Neon + Bunny stack** — the actual answer, shipped `9c48d10` (2026-06-30). Migrated 40 gallery photos, 15 reviews, 5 reels, settings, 2 pages.

### Design versions

| Version | Tag | Branch | Status | Design |
|---|---|---|---|---|
| **v1** | `v1-pre-redesign` | — | Retired (rollback target) | Maroon + cream, Cormorant/Nohemi, damask hero, ColumnDriftGallery, SideNav + PageTransition |
| **v2** | `v2-redesign-wip` | `redesign-v2` | Built, never shipped | "Warm Archive" — paper `#F4F1EA` + forest green `#2E4034` + gold, Cormorant/Hanken, EditorialGallery. Added the Page Content CMS work. |
| **v3** | `v3-maroon-cinema` | `master` | **Live in production** | "Maroon Cinema" — v1 palette, Nohemi-led awwwards look: diptych hero, counter preloader, filmstrip gallery, custom cursor, film grain |

### Recent commits

```
3021a33  Ship v3 "Maroon Cinema" to production
5c851bf  docs: mark v3 as approved and live; v1 becomes rollback target
85552a0  v3 polish: nav visibility over heroes, review marquee, footer upgrade
f49e82c  Redesign v3: "Maroon Cinema" — awwwards direction on the live v1 palette
cb81747  Redesign v2: "Warm Archive" — full visual rebuild (WIP, unreviewed)
449fca3  Copy: "&" -> "and" site-wide; frame the /about intro block
1f4b82e  SEO/GEO layer, larger readable body copy, domain -> agnitantraevents.com
72a8e06  Footer: real WhatsApp/phone number, soften location line
```

### Version commands

```bash
git tag -n1                                  # see every version
git checkout v1-pre-redesign                 # inspect (detached HEAD)
git diff v1-pre-redesign v3-maroon-cinema --stat
git checkout master && git merge redesign-vN # promote a version
git push origin master                       # -> auto-deploys

# rollback
git checkout master && git reset --hard v1-pre-redesign
git push --force-with-lease origin master
```

**Conventions:** `master` always holds the live design; never build directly on it. One branch
per redesign direction. Tag every version worth returning to. Push tags with
`git push origin --tags` so they survive this machine.

---

## 15. Non-negotiables

**Lenis MUST be driven by GSAP's ticker.** In `components/LenisProvider.tsx`:

```ts
new Lenis({ autoRaf: false })
lenis.on("scroll", ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
```

With two separate RAF loops, ScrollTrigger reads a 1–2 frame stale scroll position and every
scrubbed/parallax tween jitters — most visibly the footer. **Never revert to `autoRaf: true`.**
`/manage` deliberately has **no** Lenis.

**Never invent APIs or paths.** Verify against installed packages in `node_modules` before
referencing any package API. This codebase is handed to a client and reviewed by other developers.

**Mobile/desktop isolation.** If a component differs meaningfully by viewport, split it into
`components/desktop/X.tsx` and `components/mobile/X.tsx` — editing one must never touch the other.

**`proxy.ts` gates only `/manage` + `/api/admin`.** Never flip to default-protect.

**`BUSINESS.legalName` keeps its `&`.** NAP consistency with the Google Business Profile.

**Never import `lib/cms/admin.ts` into a public page.**

**Working with James:** he handles all UI design himself (Google Stitch, Claude web) and pastes
designs mid-project. Do not build UI components, page content or final styling unprompted. When
he pastes a design for a section that already has an implementation, **ask explicitly** whether it
replaces the existing component or is an alternative version — never silently overwrite working
components.

---

## 16. Outstanding work

### Launch-blocking

- **Production still serves Clerk `pk_test` keys.** Confirmed in the live HTML — the Clerk dev
  banner shows and dev-tier limits apply. Swap to `pk_live` / `sk_live` in Vercel.
- Clerk dashboard: set sign-up to **Restricted**, add the real admin users, remove test accounts.

### Config

- `NEXT_PUBLIC_SITE_URL` is not set — currently works only because `lib/site.ts` hardcodes the
  fallback. Setting it explicitly in Vercel is the intended design.

### Content

- 32 of 72 photography photos not yet uploaded.
- Events gallery is empty in the DB (falls back to `EVENTS_PHOTOS`).

### Recommended, not done

- Analytics (Vercel Analytics or GA4) — nothing installed.
- Contact/enquiry form — "Enquire" currently just links to the Events page / WhatsApp.
- Google Search Console verification + sitemap submission.
- Lighthouse pass on the live domain (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1).
- Full keyboard + screen-reader audit if the client wants formal WCAG-AA sign-off.
- Playwright is installed but there is **no committed test suite**.

### Cruft (low priority)

- `next.config.ts` still allowlists the dead `cdn.sanity.io` image host.
- `graphql` is still a dependency — Sanity-era leftover, unused.
- `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` are dead env vars.
- `app/manage/login/` is an empty leftover directory.
- The unused `admin_users` table is still in Neon.
- Sanity-era comments and type names linger in several source files
  (e.g. `components/media/types.ts` still describes the Sanity mapping).
