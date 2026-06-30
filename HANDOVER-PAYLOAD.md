# Handover — Migrate Aira CMS from Sanity → Payload

## Mission
Cleanly migrate the Aira / Agnitantra site's CMS from **Sanity to Payload CMS**, losing
no content. The client (non-technical) must end up with a clean Payload admin where he
uploads photos, reels, and reviews himself. Reels stay on **Bunny Stream** (do NOT move
video hosting). When Payload works end-to-end, remove all Sanity code/deps.

James hates Sanity now after repeated Studio breakage (image-array field wouldn't render;
root cause was a corrupted dep tree — `@sanity/ui@3.2.0` went missing after a
`sanity@6.0.0→6.2.0` bump). The decision is final: go Payload.

## Project
- Root: `c:\Users\alkes\OneDrive\Websites\Agnitantra Events\aira-site`
- Stack: Next.js 16.2.9 (App Router, Turbopack), React 19.2.4, TS, Tailwind v4,
  GSAP 3.15 + @gsap/react, Lenis. Node v24. Windows (PowerShell + Bash tools).
- Git: on `master`. Last commit `24e3a7e`. **Uncommitted working changes exist**
  (PageTransition.tsx, package.json/lock, all sanity/* edits). Decide: stash or commit
  before ripping Sanity out. There's a clean revert point at `0257f47` if needed.
- Read first: `CLAUDE.md`, `MOBILE-RULES.md`, `CLIENTRAWDETAILS.md`. Conventions:
  GSAP via `useGSAP` + `createMatchMedia` from `lib/gsap.ts`, reduced-motion guards,
  pill buttons, test mobile 320/375/768, run `npx next build` clean before "done".

## What content must survive (already exported to `aira-site/migration-export/`)
- `gallery-urls.txt` — **40 photography gallery photo URLs** (Sanity CDN). Re-download
  these and re-upload into Payload's media. Events gallery was empty (0 photos).
- `reviews.json` — **15 real Google reviews** (reviewerName, rating=5, reviewText, date,
  page). Re-seed into Payload.
- `siteSettings.json` — contact/social/location singleton values.
- `pages.json` — page descriptions + locationText + the gallery URLs.

## Reels — stay on Bunny, do NOT migrate video
Bunny Stream is set up and working. Keep `lib/bunny.ts` and the upload concept; rebuild
the custom upload field in Payload's admin (Payload supports custom field components).
- Library ID **691820**, CDN host `https://vz-d8b3817b-78d.b-cdn.net`.
- Env in `.env.local` (gitignored): `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_API_KEY`
  (library key, uploads), `BUNNY_ACCOUNT_API_KEY`, `NEXT_PUBLIC_BUNNY_CDN_URL`.
- Upload flow (verified): `POST video.bunnycdn.com/library/691820/videos` {title} → guid,
  then `PUT .../videos/{guid}` with **raw octet-stream body** (NOT multipart → 400).
- Playback: `{cdn}/{guid}/play_720p.mp4` + `/thumbnail.jpg` (referrer-gated; works from a
  real page, blocked for no-referrer). Helpers exist: getBunnyMp4Url/getBunnyThumbnailUrl.
- The 5 reels already uploaded (recreate guid→page mapping in Payload):
  - `11b62bc0-7226-4e49-b902-a62050eb159c` → photography — "Aira Photography Reel"
  - `41d1809b-c991-4c4f-a1f8-4f7904928bcf` → both — "Agnitantra Events Reel 1"
  - `3e2da716-f1b9-4be8-8884-17fe32e58f46` → both — "Agnitantra Events Reel 2"
  - `f474d234-03e2-4d02-8972-855e0a1273e6` → both — "Agnitantra Events Reel 3"
  - `e33d1d41-54c3-419a-b7fe-c7b57553eb73` → both — "Agnitantra Events Reel 4"

## Current Sanity coupling to replace
Files importing Sanity (these are the integration seams to rewrite for Payload):
- `app/page.tsx`, `app/about/page.tsx`, `app/photography/page.tsx`, `app/events/page.tsx`
  — call `getPage()` / `getReviews()` / `getSiteSettings()` / `footerPropsFromSettings()`
  from `@/sanity/lib/getPage` and `@/sanity/lib/getContent`.
- `app/studio/[[...tool]]/page.tsx` — Sanity Studio mount (remove).
- `app/api/upload-reel/route.ts` — Bunny upload proxy (KEEP/adapt; it's Bunny, not Sanity).
- `lib/imageUrl.ts` — Sanity `urlFor()` (remove; Payload media gives URLs directly).
- `sanity/` whole dir — schemas (page/reel/review/siteSettings), structure, client,
  queries, `components/BunnyVideoUpload.tsx` (rebuild as a Payload field component).

Data model to recreate in Payload (collections + one global):
- **pages** (or 2 globals): photography + events — description, locationText, gallery
  (array of images w/ alt+caption), reels (relationship to reels).
- **reels**: title, bunnyVideoId (custom upload field), thumbnail (optional), page
  (photography|events|both), defaults to "both".
- **reviews**: reviewerName, rating(1-5), reviewText, date, page (defaults "both").
- **siteSettings** (global): businessName, tagline, yearsOfExperience, logo, email, phone,
  instagramUrl, facebookUrl, youtubeUrl, locationPhotography, locationEvents.

Display components are CMS-agnostic and should stay; just feed them Payload data:
ColumnDriftGallery, ReelsStrip, ReelCard, GallerySection, TestimonialMarquee (takes
reviews + googleRating/googleReviewCount/googleUrl props), LocationBlock, SiteFooter
(takes instagramUrl/facebookUrl/youtubeUrl/email/phone/locationText), PageHero, AboutStory.

## Payload setup notes / gotchas
- Payload 3.x runs natively inside Next.js App Router (admin at `/admin`) — good fit here.
  Needs a database: Postgres or MongoDB. **Confirm with James which DB / hosting** before
  building (this affects Vercel deploy — Payload needs a persistent DB, e.g. Vercel
  Postgres / Neon / Mongo Atlas). This is the one real infra decision.
- Per-page Instagram is intentional: Photography footer uses
  `https://www.instagram.com/aira__photography_`, Events uses
  `https://www.instagram.com/agnitantra_events_and_caterers`. Pages pass it explicitly.
- Google reviews band is hardcoded on the review section: 4.9★, 148+, link
  `https://www.google.com/maps?cid=10454241291312957415`. Keep it.
- Footer map embed (Agnitantra listing) is inline in SiteFooter — pure HTML iframe, no CMS.

## Known open issues from last session (verify/fix during migration)
- `components/PageTransition.tsx`: was edited to disable the overlay in `/studio` (becomes
  `/admin` for Payload) via an `is--disabled` class + effect guards. Re-point to `/admin`.
- Footer contact email/phone are still PLACEHOLDERS (`hello@agnitantra.com` /
  `+91 00000 00000`) — James still needs to supply real ones.

## Still-pending from the big prompt (after migration, James will direct)
- Button SFX (sound vs visual — undecided), QR codes + logo wiring, real contact info.

## Definition of done for the migration
1. Payload admin at `/admin`, clean + understandable for a non-technical client.
2. All 40 photos, 5 reels (Bunny), 15 reviews, siteSettings present and editing live.
3. Photography + Events + Home + About read from Payload; build clean; mobile checked.
4. Reel upload works from the Payload admin (file → Bunny → guid saved), reels play.
5. All Sanity code + deps removed; `.env` Sanity vars removed; Vercel env updated.
6. Deploy works (DB connected). Then commit.

## To run
`npm run dev` (port 3000). Build check: `npx next build`. Vercel CLI is linked
(project `aira-site`, user amalbycia); Bunny env vars already added to Vercel
(Production+Development).
