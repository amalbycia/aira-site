# Redesign v2 — Design System & Implementation Plan

Branch `redesign-v2`. Revert point: `git checkout v1-pre-redesign`.

---

## 1. Research findings

### Tuesday Lights (tuesdaylights.in) — the client's reference
Scraped and analysed. Section spine:

> hero (eyebrow · headline with italic accent · lede · 2 CTAs · 2 offset photos) → stat row
> → "what we do" service pair → word marquee → philosophy + stats → portfolio grid with
> filters → films → process (01–04) → deliverables → testimonials → founder story → FAQ
> → Instagram grid → enquiry + footer

**What works and we take:** one idea per section; an eyebrow label above every heading;
numbered sequences (01–04) that make scanning effortless; an italic serif accent word inside
an otherwise roman headline; stat rows as proof; generous vertical rhythm.

**What we leave:** it is visually busy (✦ dividers everywhere, repeated sections rendered
twice for mobile/desktop, a duplicated "Made to be treasured" block). Our version keeps the
legibility and drops the clutter.

### Sam Bufalo — scattered editorial collage, left-rail nav, huge letter-spaced display type on warm off-white.
### Adovasio — full-bleed photo hero with an oversized serif headline overlapping the image; centered wordmark; near-invisible chrome.

**Synthesis:** Adovasio's hero drama + Sam Bufalo's warm paper canvas and airy collage +
Tuesday Lights' clear sectioning = grand but calm, and never confusing.

### 2026 design guidance (web search)
- High-res photography as the primary structural element; whitespace as "breathing room".
- Editorial/magazine layouts, responsive masonry, restrained transitions.
- **Playfair Display is flagged as over-used for wedding work in 2026 — avoided.**
- Preloaders are only justified when they cover real work; they must never gate content.

### Osmo morphing play/pause — exact source captured
Uses **GSAP MorphSVGPlugin**, `{type:"rotational", map:"complexity"}`, `duration 0.5`,
`ease power4.inOut`, with the two `d` paths copied verbatim.
**Verified: `node_modules/gsap/MorphSVGPlugin.js` exists** (GSAP 3.15 ships the former Club
plugins free), alongside SplitText, Flip, ScrollTrigger, Draggable. No guessing, no CDN.

---

## 2. Design system

### Palette — "warm archive"
Ink on warm paper, with a deep botanical green as the brand accent and muted gold for detail.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F4F1EA` | page background (warm off-white, from Sam Bufalo) |
| `--paper-deep` | `#EAE5DA` | alternating section bands |
| `--ink` | `#1A1A17` | primary text |
| `--ink-soft` | `#5A564E` | body copy, captions |
| `--forest` | `#2E4034` | brand accent, dark sections, buttons |
| `--gold` | `#A98A4B` | eyebrows, rules, small accents (sparingly) |
| `--line` | `rgba(26,26,23,.14)` | hairlines |

Dark sections invert to `--forest` ground with `--paper` text. No pure black, no pure white.

### Typography
- **Display:** `Cormorant Garamond` (400/500 + italic) — the luxury default in 2026 guidance,
  high-contrast and editorial. Italic is reserved for the accent word in headlines.
- **UI/body:** `Hanken Grotesk` (300/400/500) — the recommended pairing; quiet, highly legible
  at small sizes on phones.
- Both via `next/font/google` with `display: "swap"`, subset `latin`, self-hosted at build →
  no external font requests, no CLS, no CSP issues.
- Scale is fluid `clamp()`; body never below **16px** on mobile.
- Eyebrows: 11–12px, `letter-spacing: .18em`, uppercase, `--gold`.

### Spacing & layout
- 8px base. Section padding `clamp(80px, 12vh, 160px)`.
- Content max-width 1280px; text measure capped at 62ch.
- Asymmetric two-column editorial blocks on desktop; single column on mobile.

### Motion budget (deliberately restrained)
| Element | Motion |
|---|---|
| Preloader | one-time, ~1.1s, skippable, session-gated |
| Hero | headline word-rise + image scale-settle, once |
| Sections | `[data-reveal]` fade + 24px rise, `once: true`, stagger 60ms |
| Reels | Osmo morph play/pause |
| Nav / menu | 260ms ease |
| Everything else | **no motion** |

Rules: no parallax on mobile; all ScrollTriggers `once: true`; `prefers-reduced-motion`
short-circuits to final state; Lenis stays GSAP-ticker driven (`autoRaf: false`).

---

## 3. Preloader — researched, not guessed

Evidence says preloaders are only defensible when they mask real work and never block content.
So:

- Shows **only on first visit per session** (`sessionStorage`), and only on `/`.
- Hard cap **1200ms**, resolves early on `document.fonts.ready` + hero image decode.
- Content is in the DOM and readable behind it the whole time (it is an overlay, not a gate).
- Design: centered wordmark on `--paper`, a hairline rule that draws left→right as progress,
  then the whole overlay lifts to reveal the hero. Reduced-motion → instant removal.
- Never appears for returning visitors in the same session, and never on inner pages.

---

## 4. Page structure (unchanged routes, new design)

`/` · `/photography` · `/events` · `/about` — same routes, same nav, same simple UX the
client asked for ("simple, non-complicated nav").

| Page | Sections |
|---|---|
| **Home** | preloader → hero (full-bleed, oversized serif, 2 CTAs) → intro + 9+ years stat → the two brands (photography / events split) → signature marquee → featured work strip → reviews → footer |
| **Photography** | page hero → intro + stats → gallery (ColumnDriftGallery, data-fed) → reels → reviews → location → footer |
| **Events** | page hero → what we do (services) → gallery → reels → catering menu → reviews (rating hero) → location → footer |
| **About** | page hero → founder story → service scope → stats → footer |

All copy carried over **verbatim** (client brief, About text, footer NAP, service list).

---

## 5. CMS / CDN — contract preserved

**Unchanged:** `lib/db.ts`, `lib/bunny.ts`, `lib/cms/getPage.ts`, `getContent.ts`, `admin.ts`,
every `app/api/admin/*` route, `requireAdmin()`, `proxy.ts`, and the entire `/manage` UI design.

Redesigned components consume the **same props** (`GalleryPhoto[]`, `ReelItem[]`, `ReviewItem[]`,
`MenuCategory[]`), so CDN wiring survives any layout change:
- Photos → `p.url` (Bunny Storage) → `<Image>`
- Reels → `getBunnyHlsUrl` / `getBunnyMp4Url` / `getBunnyThumbnailUrl`
- Fallbacks retained: empty gallery → hardcoded clusters (events gallery is currently empty
  in the DB — verified 40 photos are all `photography`), empty menu → `FALLBACK_MENU`,
  empty reviews → `PLACEHOLDER_REVIEWS`.

### New: events-page customizability (additive only)
`pages` currently has just `slug, description, location_text` (verified against Neon). Add
**nullable** columns so nothing existing breaks:

```
hero_eyebrow, hero_title, hero_subtitle, intro_heading, intro_body,
cta_label, cta_href, stat_1_value, stat_1_label, stat_2_value, stat_2_label,
stat_3_value, stat_3_label
```

Delivered via an idempotent `scripts/migrate-page-content.mjs`, surfaced through a new
**"Page Content"** section in `/manage` → Events, built with the **existing admin styles and
component patterns** (no admin redesign). Every field falls back to the current hardcoded copy
when null, so the site looks identical until the client edits something.

---

## 6. Build order

1. Foundation — fonts, tokens, globals, motion primitives (`Reveal`)
2. Nav + footer (shared chrome)
3. Preloader + home hero
4. Home sections
5. Photography page
6. Events page + menu
7. About page
8. CMS: migration + API + Page Content tab
9. Mobile pass, reduced-motion, perf
10. `next build`, lint, localhost verification

## 7. Risk register

| Risk | Mitigation |
|---|---|
| Breaking CDN wiring | Components keep identical prop contracts; verified against live URLs |
| Breaking admin | Zero changes to existing admin files; new tab only |
| Migration damages data | Additive nullable columns; idempotent `IF NOT EXISTS`; no drops |
| Motion jank on mobile | No parallax on phones; `once:true`; GSAP-ticker Lenis |
| Losing the old site | Tag `v1-pre-redesign` + work isolated on `redesign-v2` |
