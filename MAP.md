# Aira — Codebase Map

> Read this first. It explains what every major file and folder does and **why it exists**.

---

## `app/` — Routes

### `app/page.tsx`
The home page. A single-scroll page covering: hero (two CTA buttons → Photography / Events), 
about section (featuring 9+ years experience), and footer. No sub-routes — everything is 
on one scroll. Design is provided by James; this file is a scaffold placeholder.

### `app/photography/page.tsx`
The Aira Photography sub-brand page. Contains: photo gallery, video reels, written location 
text, and Google Reviews (embed or manual). Fetches its content from the Sanity `page` document 
where `brand === "photography"`.

### `app/events/page.tsx`
The Aira Events & Catering sub-brand page. Same structure as the Photography page but scoped 
to `brand === "events"`. Exists as a separate route because the two brands have different content,
imagery, and positioning — they should feel like distinct pages while sharing nav and footer.

### `app/studio/[[...tool]]/page.tsx`
Mounts the Sanity Studio UI inside the Next.js app at `/studio`. The catch-all `[[...tool]]` 
segment is required by Sanity — it lets the Studio router handle its own internal navigation 
(e.g. `/studio/desk/page`, `/studio/vision`). The client uses this to manage all site content.

### `app/studio/[[...tool]]/layout.tsx`
Minimal layout wrapper for the Studio route. Intentionally bare — the Studio renders its own 
full-screen UI and must not inherit the site's nav/footer layout from `app/layout.tsx`.

### `app/layout.tsx`
Root layout wrapping all routes. Sets global metadata (`<title>`, `<meta description>`), 
loads fonts, and applies base Tailwind classes. The Studio layout overrides this.

### `app/globals.css`
Global CSS entry point for Tailwind v4. Contains `@import "tailwindcss"` and any 
CSS custom properties (design tokens) you define.

---

## `components/` — UI Components

### `components/desktop/`
Components whose **layout or animation logic differs structurally on desktop** (≥1024px).
Only create a file here when the mobile and desktop versions would diverge enough that 
sharing a single file adds more conditional complexity than it saves. If a component is 
just scaled or reflowed by Tailwind classes, it does not need to be split.

### `components/mobile/`
Counterpart to `components/desktop/`. A component here must have a matching file in 
`components/desktop/` with the same name. The parent page decides which to render based 
on viewport.

---

## `lib/` — Utilities

### `lib/gsap.ts`
Single source of truth for GSAP setup. Registers `ScrollTrigger` once at module level 
(safe — GSAP ignores duplicate registrations). Exports `createMatchMedia()`, a thin wrapper 
around `gsap.matchMedia()` that enforces the desktop/mobile isolation convention: animations 
passed to `"isDesktop"` and `"isMobile"` are compiled to `(min-width: 1024px)` and 
`(max-width: 1023px)` queries respectively. This ensures editing one block can never 
break the other.

### `lib/bunny.ts`
All Bunny.net integration in one place:
- `getBunnyEmbedUrl(videoId)` — iframe embed URL for Bunny Stream player
- `getBunnyHlsUrl(videoId)` — HLS stream URL for custom players
- `getBunnyThumbnailUrl(videoId)` — auto-generated video thumbnail
- `getBunnyCdnUrl(path)` — CDN URL for Bunny Storage assets
- `uploadToBunnyStorage(buffer, path)` — server-side upload reference implementation

Bunny was chosen over YouTube/Vimeo for privacy, performance, and CDN control.

### `lib/imageUrl.ts`
Exports `urlFor(source)`, a chainable image URL builder for Sanity images. This is the 
correct way to resize, crop, and format Sanity images (`urlFor(img).width(800).format("webp").url()`).
Direct `cdn.sanity.io` URLs should never be hardcoded — always use this helper.

---

## `sanity/` — CMS Layer

### `sanity/sanity.config.ts`
Sanity Studio configuration. Registers the schema types, enables the Structure tool 
(content browser) and Vision tool (GROQ query playground). The `projectId` and `dataset` 
are read from environment variables — never hardcode them.

### `sanity/lib/client.ts`
The Sanity data client used by Server Components and API routes to query content. 
`useCdn: true` in production serves cached responses from Sanity's CDN — fast and cheap. 
`useCdn: false` in development ensures you always get fresh data while authoring.

### `sanity/schemas/index.ts`
Barrel file that collects all schema types and exports them to `sanity.config.ts`. 
Add new schema files here when you create them.

### `sanity/schemas/page.ts`
**The main content document.** One document per sub-brand (Photography, Events). Contains:
gallery images, reel references, location text, Google Reviews embed code, and manual 
review references. The `brand` field (`"photography"` | `"events"`) acts as the document 
identifier — queries filter by this field.

### `sanity/schemas/reel.ts`
Represents a single video/reel. Stores the Bunny Stream video ID (not a full URL — the 
URL is constructed at render time by `lib/bunny.ts`). Each reel declares which page it 
belongs to, so you can query reels per brand without a join.

### `sanity/schemas/siteSettings.ts`
**Singleton document** — only one should ever exist. Stores global business information: 
name, tagline, years of experience, logo, contact details, social links, and location text 
for both pages. Components that need this data query it once and pass it down.

### `sanity/schemas/review.ts`
Manual review entry — used when the Google embed isn't available or the client wants to 
curate specific reviews. Each review has a star rating, text, date, and a `page` field 
to scope it to Photography, Events, or both.

---

## Config Files

### `next.config.ts`
Configures `images.remotePatterns` to allow Next.js `<Image>` to serve from:
- `cdn.sanity.io` (all Sanity-hosted images)
- Your Bunny CDN pull zone hostname (from `NEXT_PUBLIC_BUNNY_CDN_URL`)
- `*.b-cdn.net` (Bunny Stream thumbnails)

### `.env.local.example`
Template for required environment variables. Copy to `.env.local` and fill in values. 
The `NEXT_PUBLIC_` prefix exposes variables to the browser; all others are server-only.

### `eslint.config.mjs`
ESLint config using the flat config format (ESLint 9). Extends Next.js core web vitals 
and TypeScript rules, then applies `eslint-config-prettier` last to disable any rules 
that conflict with Prettier formatting.

### `.prettierrc`
Prettier formatting rules. `printWidth: 100` gives slightly more room than the default 
80 — appropriate for a modern monitor. `trailingComma: "all"` reduces git diff noise.

---

## Documentation Files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Quick-start guide for Claude Code and developers — commands, conventions, boundaries |
| `MAP.md` | This file — architectural reasoning for the codebase |
| `TODO.md` | Living build checklist — everything left to build, section by section |
| `CLIENTRAWDETAILS.md` | Client requirements verbatim + organized for reference throughout the build |
| `README.md` | Setup guide for Sanity, Vercel, and Bunny.net |
