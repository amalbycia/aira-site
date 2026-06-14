# Aira — Build Checklist

Check items off as you complete them. Each section is independent — work in any order.
Items marked `[DESIGN]` require a design from James before implementation.

---

## Infrastructure (done)

- [x] Next.js 16 + App Router + TypeScript + Tailwind v4
- [x] GSAP 3 + @gsap/react + ScrollTrigger
- [x] Lenis smooth scroll
- [x] Sanity 6 + next-sanity 13 + @sanity/image-url + @sanity/vision
- [x] Prettier + ESLint (with eslint-config-prettier)
- [x] `.env.local.example` with all required variables documented
- [x] `next.config.ts` — image domain allowlist (Sanity CDN, Bunny CDN, Bunny Stream)
- [x] `lib/gsap.ts` — matchMedia helper with isolation pattern
- [x] `lib/bunny.ts` — Stream embed/HLS/thumbnail + Storage upload helpers
- [x] `lib/imageUrl.ts` — Sanity image URL builder
- [x] Sanity schemas: page, reel, siteSettings, review
- [x] Sanity Studio mounted at `/studio`
- [x] Route scaffolds: `/`, `/photography`, `/events`
- [x] CLAUDE.md, MAP.md, TODO.md, CLIENTRAWDETAILS.md, README.md

---

## Sanity Setup (one-time, before content editing)

- [ ] Create Sanity project at sanity.io/manage
- [ ] Copy `.env.local.example` → `.env.local`, fill in `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
- [ ] Run `npm run dev` and visit `/studio` to confirm Studio loads
- [ ] Create one `siteSettings` document in the Studio — fill in business name, tagline, years of experience
- [ ] Create one `page` document for Photography and one for Events
- [ ] Add a Sanity API token (`SANITY_API_TOKEN`) for server-side mutations if needed

---

## Bunny.net Setup (one-time)

- [ ] Create Bunny Storage zone — note zone name and API key
- [ ] Create Bunny CDN pull zone pointing to the storage zone — note CDN hostname
- [ ] Create Bunny Stream library — note library ID and API key
- [ ] Fill in all `BUNNY_*` variables in `.env.local`
- [ ] Test `getBunnyEmbedUrl()` with a real video ID

---

## Global Layout & Nav

- [ ] `[DESIGN]` Desktop nav component (`components/desktop/Nav.tsx`)
- [ ] `[DESIGN]` Mobile nav component (`components/mobile/Nav.tsx`)
- [ ] Nav links: Home logo, Photography, Events
- [ ] Wire nav into `app/layout.tsx`
- [ ] `[DESIGN]` Footer component (shared across all pages)
- [ ] Footer content: contact info, social links, location summary, copyright
- [ ] Wire footer into `app/layout.tsx`
- [ ] Lenis smooth scroll — initialize in a client component or layout provider
- [ ] Test nav + footer on mobile and desktop viewports

---

## Home Page (`/`)

### Hero Section
- [ ] `[DESIGN]` Desktop hero (`components/desktop/Hero.tsx`)
- [ ] `[DESIGN]` Mobile hero (`components/mobile/Hero.tsx`)
- [ ] "Aira Photography" CTA button with arrow → links to `/photography`
- [ ] "Aira Events & Catering" CTA button with arrow → links to `/events`
- [ ] GSAP entrance animation — desktop (`createMatchMedia` → `isDesktop`)
- [ ] GSAP entrance animation — mobile (`createMatchMedia` → `isMobile`)

### About Section
- [ ] `[DESIGN]` About section component
- [ ] Feature "9+ years of experience" prominently
- [ ] Wire content from Sanity `siteSettings` (tagline, description)
- [ ] GSAP ScrollTrigger reveal animation

### Footer
- [ ] Included via layout — see Global Layout above

---

## Photography Page (`/photography`)

### Data
- [ ] Fetch `page` document where `brand === "photography"` from Sanity
- [ ] Fetch `siteSettings` for shared business info

### Gallery Section
- [ ] `[DESIGN]` Desktop gallery layout (`components/desktop/Gallery.tsx`)
- [ ] `[DESIGN]` Mobile gallery layout (`components/mobile/Gallery.tsx`)
- [ ] Render images using `urlFor()` from `lib/imageUrl.ts`
- [ ] Use Next.js `<Image>` with `alt` text from Sanity
- [ ] Lightbox or fullscreen view on image click
- [ ] GSAP ScrollTrigger stagger reveal — desktop
- [ ] GSAP ScrollTrigger stagger reveal — mobile

### Reels / Video Section
- [ ] `[DESIGN]` Reel grid / carousel layout
- [ ] Render Bunny Stream embeds using `getBunnyEmbedUrl()` from `lib/bunny.ts`
- [ ] Thumbnail cover image before play (from Sanity `reel.thumbnail` or `getBunnyThumbnailUrl()`)
- [ ] Mobile: single-column layout; Desktop: multi-column or carousel

### Location Section
- [ ] Display `locationText` from Sanity `page` document (text only, no map)

### Google Reviews Section
- [ ] If `googleReviewsEmbedCode` is set in Sanity: render it via `dangerouslySetInnerHTML`
- [ ] If no embed code: render manual `review` documents as cards
- [ ] `[DESIGN]` Review card component
- [ ] Show star rating, reviewer name, date, review text

---

## Events Page (`/events`)

(Mirror of Photography page — same component list, different Sanity data source)

### Data
- [ ] Fetch `page` document where `brand === "events"` from Sanity
- [ ] Fetch `siteSettings` for shared business info

### Gallery Section
- [ ] `[DESIGN]` Reuse or adapt `Gallery` components — confirm with James before duplicating
- [ ] Wire Sanity gallery images for Events brand

### Reels / Video Section
- [ ] Wire Bunny Stream reels for Events brand
- [ ] Thumbnail and embed logic (same as Photography)

### Location Section
- [ ] Display `locationEvents` from Sanity `siteSettings` (or `locationText` from page doc)

### Google Reviews Section
- [ ] Same logic as Photography page — embed or manual cards

---

## Animations (GSAP)

- [ ] All GSAP code uses `useGSAP()` from `@gsap/react` (never raw `useEffect`)
- [ ] All desktop animations inside `mm.add("isDesktop", ...)` blocks
- [ ] All mobile animations inside `mm.add("isMobile", ...)` blocks
- [ ] `mm.revert()` called in every `useGSAP` cleanup
- [ ] No animation targets shared between `isDesktop` and `isMobile` blocks
- [ ] ScrollTrigger scrub/pin on hero — desktop
- [ ] ScrollTrigger fade-in on gallery items — both viewports
- [ ] ScrollTrigger reveal on about section stats (9+ years)
- [ ] Page transition (optional — confirm with James)

---

## SEO & Metadata

- [ ] `app/layout.tsx` — base `<title>` and `<meta description>` (done — placeholder values)
- [ ] `app/page.tsx` — export `metadata` with home-specific title/description
- [ ] `app/photography/page.tsx` — export `metadata`
- [ ] `app/events/page.tsx` — export `metadata`
- [ ] `<link rel="canonical">` on each page
- [ ] Open Graph image (og:image) for social sharing — Photography page
- [ ] Open Graph image — Events page
- [ ] `public/favicon.ico` — replace placeholder
- [ ] `public/apple-touch-icon.png` — add

---

## Performance

- [ ] All images use Next.js `<Image>` with `width`, `height`, `alt`
- [ ] Gallery images use `sizes` prop for responsive loading
- [ ] Video embeds are lazy-loaded (no iframe until user clicks play)
- [ ] Fonts: confirm subset loading in `app/layout.tsx`
- [ ] Run `npm run build` and check for any size warnings
- [ ] Lighthouse audit — target 90+ Performance, 100 Accessibility on mobile

---

## Deployment

- [ ] Create Vercel project — import from Git
- [ ] Set all `.env.local` variables as Vercel environment variables
- [ ] Set `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN`
- [ ] Set all `BUNNY_*` variables
- [ ] Confirm `/studio` works on production URL
- [ ] Deploy Sanity Studio to production (`npx sanity deploy` — optional; `/studio` route works without it)
- [ ] Point custom domain (if applicable)
- [ ] Test all routes on production: `/`, `/photography`, `/events`, `/studio`
- [ ] Test on real mobile device (not just browser DevTools)

---

## Handover

- [ ] Fill in `README.md` with actual project IDs / zone names (or keep generic and give client a separate credentials doc)
- [ ] Record a Loom walkthrough of the Sanity Studio for the client
- [ ] Confirm client can log in to Sanity and edit content
- [ ] Confirm client can log in to Bunny.net and upload videos
