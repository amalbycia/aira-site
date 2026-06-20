# On-Scroll Column & Row Animations — Implementation Notes

Source: Codrops article + reference repo `codrops/OnScrollColumnsRows`
(cloned locally and read in full: `.reference/OnScrollColumnsRows/` — 10 HTML
demos, shared `base.css`, and 10 per-demo JS files). MIT licensed; images in
the repo are Midjourney-generated placeholders, not for reuse in production.

This doc explains the **pattern**, not a copy-paste of their source — adapt
the GSAP calls into our own `useGSAP` + `createMatchMedia` conventions
(`lib/gsap.ts`) rather than porting their vanilla-JS files directly.

---

## 1. The core idea

A grid of images is split into **columns**, each column is a vertical stack
of **items**. On scroll, GSAP + ScrollTrigger drives per-item and/or
per-column transforms (translate, rotate, skew, scale, 3D perspective,
filter) tied to scroll progress via `scrub: true`. Nothing plays on a timer —
every demo is 100% scroll-position-driven, and most use `scrub: true` for a
1:1 scroll-to-animation coupling rather than a stagger-on-enter pattern.

All 10 demos share the **same HTML/CSS skeleton** and only swap the JS
animation logic + a few CSS custom properties. That's the reusable part.

## 2. Shared markup skeleton

```
.columns                      (CSS grid, N columns, place-items: center)
  .column                     (one per grid column, display: grid, 1 col)
    .column__item             (figure — one image slot)
      .column__item-imgwrap   (overflow: hidden, aspect-ratio, border-radius — the "mask")
        .column__item-img     (the actual image/background — what scales/blurs/moves)
```

Two-layer wrapper is the key trick: **`-imgwrap` clips** (overflow hidden,
fixed aspect-ratio, radius), **`-img` is free to transform** (scale, skew,
translate, filter) without breaking the clipped frame. This is what lets
demos zoom/skew the image without it spilling outside its rounded card.

## 3. Shared CSS variables (theming knobs per demo)

Defined on `:root` in `base.css`, overridden per demo via a body class
(`.demo-1`, `.demo-2`, …):

| Variable | Purpose |
|---|---|
| `--grid-columns` | number of columns (3–7 across demos) |
| `--grid-gap` | gap between columns/items (`vw` or `px`) |
| `--grid-item-ratio` | aspect-ratio of each image slot (0.6–1) |
| `--grid-item-radius` | corner radius of the imgwrap mask |
| `--grid-item-translate` | oversize offset baked into `.column__item-img` (it's sized `100% + translate*2` and offset `-translate` on top/left) so the image has slack to pan/scale without showing edges |
| `--grid-width` / `--grid-max-width` | overall grid width constraint |

Changing these alone (no JS) reskins the grid density/shape — worth lifting
into our own CSS variable system the same way.

## 4. Shared JS scaffolding (every demo does this first)

1. Query `.columns`, then `.column` elements, then build a flat array of item
   objects: `{ element, column: columnIndex, wrapper, image }` — this
   `column` index is what most effects branch on (first/last/middle column
   gets different values).
2. **Lenis** smooth scroll is initialized and wired to `ScrollTrigger.update()`
   on every `lenis.on('scroll', ...)` tick, with `requestAnimationFrame`
   driving `lenis.raf(time)`. *(Our project already uses Lenis — reuse the
   existing instance instead of creating a second one.)*
3. Images are preloaded (`imagesloaded` library) before any GSAP/ScrollTrigger
   setup runs, then a `.loading` class is removed from `<body>` to reveal
   content. This avoids ScrollTrigger computing wrong bounds from
   not-yet-loaded image heights — **important**: in our Next.js setup,
   `next/image` mostly solves this via known dimensions, but if we use raw
   background-images we'd want an equivalent guard (or `ScrollTrigger.refresh()`
   after load).
4. Almost every `scrollTrigger` config uses
   `start: 'clamp(top bottom)', end: 'clamp(bottom top)', scrub: true` against
   either the item element or the whole grid — the `clamp()` modifier keeps
   the trigger from producing out-of-range progress values if the element is
   taller than the viewport. Worth knowing: `clamp()` is a ScrollTrigger
   start/end keyword feature, not a CSS clamp.

## 5. `getGrid()` helper — turning a flat list into rows/columns

`js/utils.js` ships a generic helper that's the most reusable piece of the
whole repo:

```js
const getGrid = selector => {
  // gsap.utils.toArray(selector) + getBoundingClientRect() per element
  // groups elements by rounded center-position on an axis (x for columns, y for rows)
  // .columns(alternating, merge) / .rows(alternating, merge)
  // alternating: 'odd' | 'even' to filter to alternating rows/columns
}
```

It works by reading each element's bounding box and bucketing elements that
share the same rounded center X (→ a column) or center Y (→ a row), which is
how demos 5, 6, 7, and 9 are able to target "every even row" / "every odd
row" purely from DOM geometry rather than hardcoded indices — this makes it
layout-agnostic (reflow-safe across breakpoints) as long as you call
`elements.refresh()` after layout changes/resize.

This is the one piece worth porting close to verbatim (it's a small,
self-contained utility, not a styling/content asset) if we build a similar
grid effect — credit the GreenSock forum source comment in the original file.

## 6. The 10 effect variants — what each one actually does

All operate on the same markup; only the transform recipe differs.

**Demo 1 — baseline parallax**
Each `.column` gets a scroll-scrubbed `yPercent` offset proportional to its
column index (`-1 * index * 10`), so columns drift at different vertical
speeds (classic multi-column parallax). Independently, each item's `.image`
(inner layer) animates `y: 30 → -30` as it crosses the viewport, adding a
subtle counter-drift inside the masked frame.

**Demo 2 — lateral skew/rotate, edge columns only**
Middle column stays mostly still; first/last column items rotate ±6° and
shift `xPercent` ±10% with `transformOrigin` anchored to the outer edge —
items lean outward as they scroll past, like pages fanning open.

**Demo 3 — radiating rotation/translate from center**
Every column gets a rotation + xPercent magnitude that scales with distance
from the grid (not from center — note the actual values increase as
`(column+1)`), combined with a dynamic `transformOrigin` computed from the
item's distance from the right edge of the viewport. Produces a fanned,
radiating skew across the whole row.

**Demo 4 — 3D perspective stack (the "depth" effect from the article)**
Sets `perspective: 1500` per item, then runs a `fromTo` timeline animating
`rotationX`, `z` (depth), `yPercent`, and `xPercent` from offset/rotated
values back to neutral — combined with a *second* parallel tween on
`.image` animating `filter: hue-rotate(90deg → 0deg)` and `scale: 3 → 1`.
This is the "items fly in from 3D space + color-correct as they land" demo.
Column position determines the starting `xPercent` (fans out from a computed
middle column) and rotation magnitude.

**Demo 5 — alternating row skew (uses `getGrid().rows()`)**
First demo to use the geometry-based row grouping. Even rows get
`skewX: 10°` + slight positive `xPercent` from one transform-origin; odd rows
get the mirrored negative values from the opposite origin. The `-img` layer
simultaneously un-scales from `scaleY: 1.2 → 1`. Net effect: alternating rows
"uncurl" in opposite directions as they scroll into place.

**Demo 6 — alternating rows, stronger skew + bounce ease**
Same row-alternation structure as #5 but with much larger `skewX` (±30°) and
`xPercent` (±50%), `transformOrigin` anchored near the top corners
(`0%/100% -10%`), and `ease: 'back.out(1.5)'` instead of linear — gives a
springy overshoot as each row resolves, plus an inner `scale: 1.2 → 1` on the
image.

**Demo 7 — alternating rows, subtle version**
Same family as #5/#6 but with much smaller values (`skewX: ±2°`,
`xPercent: ∓50` — note signs flipped vs #5) and a non-clamped
`end: 'bottom top'`. Also drives the inner image with a one-axis
`scaleX: 1.4 → 1` using `power1.in` easing — a tighter, less dramatic
version of the same row-skew technique, good as a "default" feel.

**Demo 8 — true 3D column rotation (perspective on the grid itself)**
Sets `perspective: 600` on the grid container (not per item), then tweens
each of the 4 columns' `rotationY` to different angles (column 0 and 3 get
both rotation *and* `z` depth; columns 1–2 only rotate) all in one shared
timeline keyed to grid scroll — the whole grid behaves like an open book/fan
in 3D space. Separately, each item's wrapper fades in from
`rotationX: -90 → 0` (flips up from flat) as it individually enters.

**Demo 9 — per-column skew/scale "venetian blind" zoom**
Only first/last columns get transform values (middle column items pass
through `column === 1 ? return : ...`-style early exits are absent here but
values are only assigned conditionally) — items skew (`±5°`) and shift
(`∓30%`) while scaling down to `0.7` and fading to `opacity: 0.5`, while the
inner image simultaneously scales up to `1.6`. The clipped wrapper shrinking
while the inner image grows creates a zoom-through-a-window feel.

**Demo 10 — the WebGL-style blur/scale distortion (3-column only)**
This is the one the article calls out as "filtering + transformation to
mimic WebGL." Per column (hardcoded for exactly 3 columns via a `switch`):
edge columns (`0`, `2`) start `scaleX: 6, scaleY: 0.3` (extremely squashed
and stretched horizontally) with `filter: blur(10px)` and
`xPercent: ∓400`, animating back to `scale: 1, blur(0px), xPercent: 0`. The
center column does a milder version (`scale: 0.7`, `blur(5px)`). The squash
+ blur + slide combination is what reads as a liquid/glass distortion
without any actual WebGL/shader involvement — it's pure CSS `filter: blur()`
+ non-uniform `scaleX`/`scaleY`.

## 7. Adapting this to our stack (Aira/Agnitantra site)

What to keep:
- The two-layer `imgwrap` (clip) / `img` (transform) split — directly
  reusable, matches how `MediaCluster.tsx` / `ReelCard.tsx` already separate
  a clipping container from inner content.
- The `getGrid()` row/column geometry grouping, if we want alternating-row
  effects on `GallerySection` — port it as a small typed utility in `lib/`,
  call `.refresh()` inside a `resize`/`ScrollTrigger.refresh()` hook since
  our grid breakpoints reflow at 768px (per MOBILE-RULES.md).
- `clamp(top bottom)` / `clamp(bottom top)` ScrollTrigger start/end pattern
  for per-item scrub reveals — safer than plain `top bottom` for tall items.

What to change for our conventions:
- Wrap every effect in `useGSAP(() => { ... }, { scope: ref })` from
  `@gsap/react`, not raw `addEventListener`/manual init like the demos.
- Split desktop vs. mobile values through `createMatchMedia()`
  (`mm.add("isDesktop", ...)` / `mm.add("isMobile", ...)`) — none of the demos
  do responsive branching at all (they're desktop-first codrops demos), so
  on mobile we should pick ONE simple version of an effect (e.g. demo 1's
  column drift) rather than the heavier 3D/skew ones, per MOBILE-RULES.md
  performance constraints.
- Add a `prefers-reduced-motion` branch that sets all transforms to their
  resting/final values immediately (matching the pattern already established
  in `HeroPreloader.tsx`), since none of the demos handle reduced motion.
- We already run Lenis site-wide — do not instantiate a second Lenis
  instance; just hook our existing one's `scroll` event to
  `ScrollTrigger.update()` if not already wired.
- Use `next/image` with known `width`/`height` instead of CSS
  `background-image` where practical, to avoid the demos' manual
  `imagesloaded` preload-gate.

## 8. Best candidate effects for our gallery sections

Given the burgundy/cream/gold aesthetic and "no AI slop, no scrolljacking"
brief already established for this project:

- **Demo 1 (multi-speed column drift)** — safest, most tasteful, cheapest on
  mobile. Good default for `MediaCluster`/`GallerySection`.
- **Demo 5 or 7 (alternating row skew)** — adds personality without going
  full 3D; demo 7's subtler values fit a premium-photography tone better
  than demo 6's springy overshoot.
- **Demo 10 (blur/squash distortion)** — striking but heavy (filter +
  non-uniform scale on every item); reserve for a single hero-adjacent
  moment, not the whole gallery grid, and desktop-only.

Avoid demo 8's full grid `perspective`/`rotationY` — expensive, and 3D tilt
on a portrait-photography grid can look gimmicky rather than premium.

## 9. Reference repo location

Cloned (not committed) at `.reference/OnScrollColumnsRows/` for direct
file inspection. Source: github.com/codrops/OnScrollColumnsRows (MIT).
Treat the images in `img/` as non-production placeholders only.
