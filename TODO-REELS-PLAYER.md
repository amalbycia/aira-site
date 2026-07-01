# TODO (later): Upgrade the reels player — Osmo custom Bunny HLS player

**Reference:** https://www.osmo.supply/demo/custom-bunny-hls-player-basic
**Requested by:** James (2026-07-02). Deferred — do NOT touch the current player until we pick this up.

## Goal
Improve the reels player to the Osmo "custom Bunny HLS player" style.

## What we know so far (from a first scrape)
- The Osmo demo **does use hls.js** (`Hls`, `.m3u8`, `mediadelivery`/`b-cdn` all referenced in the page HTML).
  So the upgrade = adaptive HLS streaming via hls.js, with a custom control UI, instead of the current
  progressive MP4.
- The scrape (`.firecrawl/osmo-player.json`, ~614KB HTML) did **not** expose the inline `<script>` logic
  cleanly (0 inline blocks, 0 external src found via naive regex — the code is likely bundled/obfuscated
  or injected). **Next step: re-fetch with WebFetch + firecrawl scrape (rawHtml + --wait-for) and dig for
  the actual player JS + control markup before implementing.** Don't guess the implementation.

## Current player (what we'd be replacing)
- `components/media/ReelCard.tsx` — plain `<video>` with **MP4 progressive** (`reel.videoSrc` =
  `getBunnyMp4Url(guid, "720p")` from `lib/bunny.ts`), muted, loop, hover-to-play (desktop) / tap (touch),
  play affordance overlay, no controls, no scrub bar.
- `components/media/ReelsStrip.tsx` — horizontal snap rail of 9:16 cards; GSAP entrance. (Layout stays.)
- Bunny Stream library 691820. HLS URL available per guid (Bunny gives `.../{guid}/playlist.m3u8`).

## Rough implementation sketch (to validate against the real Osmo code first)
1. Add `hls.js` dependency. Feature-detect: native HLS (Safari) → set `video.src` to the m3u8 directly;
   otherwise attach `Hls`.
2. Add a `getBunnyHlsUrl(guid)` helper in `lib/bunny.ts` (mirror the existing MP4/thumbnail helpers).
3. New player component (or extend ReelCard) with the Osmo control UI: play/pause, mute, progress/scrub,
   maybe fullscreen. Keep reduced-motion + keyboard a11y that ReelCard already has.
4. Keep the fail-soft/hover behavior; MP4 fallback if HLS fails.
5. Verify on desktop + mobile (320/375), and that it doesn't break the ReelsStrip layout.

## Time estimate (see chat) — ~3–5 focused hours once we have the real Osmo code.

## Guardrails
- Don't restyle ReelsStrip's rail layout. Verify hls.js API against the installed version (no hallucinated API).
- Test build clean + screenshot before shipping.
