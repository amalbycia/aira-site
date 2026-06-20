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

### Hero Section — built as merged Preloader + Hero (`components/HeroPreloader.tsx`)
> See **[docs/HERO-PRELOADER.md](docs/HERO-PRELOADER.md)** before modifying — explains
> safe image swaps, editable text/buttons, and the structural pieces that must not be renamed.
- [x] Osmo "crisp loading" preloader carousel → center image expands into the hero bg
- [x] Hero title word-rise entrance (SplitText), then divider + buttons rise in
- [x] "Our Photography" CTA → `/photography`, "Events & Catering" CTA → `/events`
- [x] `prefers-reduced-motion` guard (skips morph, shows hero instantly)
- [x] Mobile sizing via Osmo `--size-font` scaling (no desktop params touched)
- [x] Hero background optimized (16MB → ~200KB via sharp), in `public/images/hero-bg.jpg`
- [ ] Swap the 4 placeholder carousel images (`LOADER_IMAGES`) for real photos — keep center = `HERO_BG`
- [ ] Replace `hero-bg.jpg` with the final chosen hero photo (optimize first, see doc §1)
- [ ] Verify the title doesn't clip on 320/375px (doc §5) once real copy is locked
- [ ] Optional: re-add scroll-lock during loading (page can't scroll while preloader plays)
- [ ] Delete the unused old `components/HeroSection.tsx` once the preloader is signed off

### About Section
- [ ] `[DESIGN]` About section component
- [ ] Feature "9+ years of experience" prominently
- [ ] Wire content from Sanity `siteSettings` (tagline, description)
- [ ] GSAP ScrollTrigger reveal animation

### Footer
- [ ] Included via layout — see Global Layout above

---

## Photography Page (`/photography`)

> Built `2026-06-18`. Layout: `app/photography/page.tsx` (assembles sections);
> placeholder content in `app/photography/clusters.ts`. Aesthetic matches the
> homepage hero (burgundy band → cream → fixed footer reveal). Build passes clean.

### Hero
- [x] Shared `PageHero` (`components/PageHero.tsx`) — burgundy band, script eyebrow,
      SplitText word-rise title, gold sparkle divider, bottom curve morph into cream
- [x] `prefers-reduced-motion` guard (shows hero in final state, no entrance)

### Gallery Section — asymmetric mixed photo+reel clusters
- [x] `MediaCluster` (`components/media/MediaCluster.tsx`) — 12-col asymmetric grid
      that gracefully holds MIXED photo+reel clusters (not separate grids), alternating
      left/right offset; collapses to single stacked column <768px
- [x] `GallerySection` wrapper carries shared media CSS + section heading
- [x] Self-hosted reels via `ReelCard` (`components/media/ReelCard.tsx`) — `<video>`
      slot, poster now, hover/tap-to-play, NOT Instagram. Drop a Bunny `videoSrc` in to play.
- [x] GSAP ScrollTrigger scrub reveal, isolated desktop/mobile via `createMatchMedia`
- [ ] Wire `page` doc (`brand === "photography"`) gallery → cluster `src` via `urlFor()`
- [ ] Swap reel posters/`videoSrc` for Bunny (`getBunnyCdnUrl` / `getBunnyThumbnailUrl`)
- [ ] Optional: lightbox/fullscreen on photo click

### Reels / Video Section
- [x] Dedicated horizontal `ReelsStrip` (`components/media/ReelsStrip.tsx`) — portrait
      rail, native horizontal scroll/snap (no scrolljack), scrub entrance, mobile sizing
- [ ] Populate from Sanity `reel` docs (`page === "photography" | "both"`) + Bunny URLs

### Location Section
- [x] `LocationBlock` (`components/LocationBlock.tsx`) — text only, no map (per scope)
- [ ] Wire `locationText` from Sanity `page` document

### Google Reviews Section
- [ ] (Photography) embed or manual `review` cards — pattern built on Events page (reuse)

---

## Events Page (`/events`)

> Built `2026-06-18`. Layout: `app/events/page.tsx`; gallery placeholders in
> `app/events/clusters.ts`. Sections: hero → catering menu → other services →
> gallery → testimonial marquee → location → footer reveal. Build passes clean.

### Hero
- [x] Shared `PageHero` — same treatment as Photography (burgundy band + curve)

### Menu Section (catering)
- [x] `CateringMenu` (`components/events/CateringMenu.tsx`) — tabbed categories
      (Veg / Non-Veg / Live Counters / Desserts), Kerala-leaning placeholder dishes,
      animated dish-list on tab change, 44px tab tap targets, accessible tablist/tabpanel
- [ ] Wire real menu from Sanity (add a `menu` field to the events `page` doc) when supplied

### Other Services Section
- [x] `ServicesList` (`components/events/ServicesList.tsx`) — asymmetric indexed rows
      (NOT a bento grid). Real scope from CLIENTRAWDETAILS: stage decoration, stage
      programs, catering, light & sound, makeup, car rentals, dancers, photography/video
- [x] Alternating slide-in reveal (scrubbed ScrollTrigger), hover shade shift

### Gallery Section
- [x] Reuses `GallerySection` / `MediaCluster` (decor, stage, feast clusters — mixed media)
- [ ] Wire Sanity gallery (`brand === "events"`) + Bunny reels

### Testimonial Marquee (placeholder reviews → Google Reviews later)
- [x] `TestimonialMarquee` (`components/events/TestimonialMarquee.tsx`) — horizontal
      infinite GSAP loop, pauses on hover/focus, edge fades; cards shaped to the Sanity
      `review` schema (reviewerName / rating / reviewText / date). Reduced-motion → static scroll
- [ ] Replace `REVIEWS[]` with live Google Reviews (or Sanity `review` docs / page embed code)

### Location Section
- [x] `LocationBlock` — text only, no map
- [ ] Wire `locationText` from Sanity

### Reels / Video Section
- [ ] Wire Bunny Stream reels for Events brand (in-cluster reels already support `videoSrc`)

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
