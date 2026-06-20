# Hero Preloader — Modification Guide

The homepage hero is `components/HeroPreloader.tsx`. It is a **merged preloader +
hero**: an Osmo "crisp loading" carousel plays, the center image expands to fill
the viewport, and that same expanded image *becomes* the hero background while the
real hero title + buttons animate in on top. One continuous GSAP timeline, no fade
hand-off.

It is mounted only on the homepage (`app/page.tsx`), not site-wide.

> **Golden rule:** the animation works because of how a few specific classes,
> selectors, and the image array line up. You can swap content freely — just keep
> the structural pieces below intact.

---

## 1. Swapping images (safe)

All carousel imagery lives in one array near the top of the file:

```ts
const HERO_BG = "/images/hero-bg.jpg";   // the image that expands into the hero
const LOADER_IMAGES = [ ... 5 entries ... ];
const CENTER_INDEX = 2;                   // which array entry expands (0-based)
```

**To change the hero background:** replace `public/images/hero-bg.jpg` (keep the
same filename) OR change the `HERO_BG` path. The entry at `CENTER_INDEX` in
`LOADER_IMAGES` is the one that expands — it is set to `HERO_BG`, so the expanding
image always matches the final hero bg. Keep that link (center entry = `HERO_BG`).

**To change the side carousel images:** swap the other 4 strings. They are currently
`picsum.photos` placeholders. Any URL or `/images/...` local path works.

**Image rules:**
- Keep **exactly 5 images** unless you also update the layout spacing. The duplicate
  group and the relative group must have the same count.
- `CENTER_INDEX` must stay a valid index (0–4) and should be the visual middle (2)
  so the expand starts from screen center.
- **Optimize before adding.** The original 16MB source was compressed to ~200KB with
  `sharp` (2400px wide, q78 mozjpeg). Do the same for any real photo — a heavy hero
  image defeats the point of a fast preloader. Source originals go in
  `_source-assets/` (gitignored).

---

## 2. Changing the hero text / buttons (safe)

The hero content is plain JSX inside `.hero-content`:

- **Title:** the `<h1 class="hero-title">` — edit the text freely. It is split into
  words by GSAP `SplitText` at runtime, so any text gets the word-rise entrance
  automatically. Keep the `hero-title` class.
- **Subtitle accent:** `<span class="hero-title__sub">` — the lighter-weight part.
- **Buttons:** the two `<Link class="btn-animate-chars">` inside `.hero-cta-group`.
  Add/remove buttons freely; each direct child of `.hero-cta-group` animates in
  (staggered). The per-character hover effect needs the inner
  `<span data-button-animate-chars>` wrapper — keep that structure when adding a button.
- **Spacing between title and buttons:** the `.hero-divider`'s inline
  `marginBottom` (currently `var(--space-sm)`). Adjust that token to tighten/loosen.

---

## 3. Structural pieces — DO NOT rename/remove (will break the animation)

These class names and attributes are queried by the GSAP timeline. Renaming any of
them silently breaks the morph:

| Class / attribute | Role in the animation |
|---|---|
| `.crisp-header` (root `<section>`) | Animation scope + holds `is--loading` / `is--hidden` state |
| `is--loading` (on root) | Drives the structural reveal — removed when the morph ends |
| `is--hidden` (on root) | Hides the header until the timeline's `onStart` |
| `.crisp-loader__group > *` | The carousel images that wipe across (`xPercent`) |
| `.crisp-loader__media` | The boxes that expand to `100vw/100dvh` |
| `.crisp-loader__media .is--scale-down` | Edge images that scale to 0.5 |
| `.crisp-loader__media.is--scaling.is--radius` | The center (expanding) image's radius toggle |
| `.hero-title` | Word-rise entrance via SplitText |
| `.hero-cta-group > *` | Buttons that rise in (each direct child) |
| `.hero-divider` | Divider that rises in between title and buttons |
| `.hero-curve` + `curvePathRef` | Bottom curve that morphs on scroll |

**Reveal mechanism:** while `is--loading` is present, `.hero-content` + `.hero-curve`
are `visibility: hidden` and the loader is shown. The timeline removes `is--loading`,
which keeps the expanded image as the bg, drops the side `.crisp-loader__fade`
gradients, and lets the hero content animate in. The loader is NEVER `display: none`
after reveal — its expanded image is the hero background.

---

## 4. Timeline order (for reference if you tweak timing)

1. Carousel images wipe across — `xPercent 500 → -500`, stagger 0.05, 2.5s
2. Edge images scale down to 0.5 — stagger from "edges"
3. Center image expands — `10em → 100vw/100dvh`, 2s
4. `is--loading` dropped (structural reveal)
5. Hero title words rise — `yPercent 110 → 0`, masked, stagger 0.075, expo.out
6. Divider rises, then buttons rise (staggered), expo.out
7. Bottom curve wired to scroll (ScrollTrigger scrub)

Easing defaults to `expo.inOut` for the loader, `expo.out` for the content rise.

---

## 5. Mobile / accessibility

- **Sizing is already responsive:** carousel images use `em` units tied to
  `--size-font` (the Osmo scaling system in `globals.css`), which scales down at the
  834 / 550 / 390 mobile breakpoints. The expand target (`100vw/100dvh`) is
  viewport-relative. **No desktop values are touched for mobile** — sizing flows from
  the shared scaling variable.
- **`prefers-reduced-motion`:** if the user has reduced motion enabled, the whole
  loader/morph is skipped — the hero shows instantly in its final state (image
  expanded, text + buttons visible). This is a separate early-return branch and does
  not alter the standard-motion parameters.
- The hero title has `white-space: nowrap` on desktop and switches to wrapping at
  ≤767px (in the component's `@media` block). If a longer title clips on mobile,
  adjust that block — not the desktop rule.

---

## 6. Related files

- `components/HeroPreloader.tsx` — the component
- `public/images/hero-bg.jpg` — the expanding/hero image (optimized)
- `_source-assets/` — original uncompressed sources (gitignored)
- `app/page.tsx` — mounts `<HeroPreloader />` (homepage only)
- `components/HeroSection.tsx` — the OLD standalone hero, no longer imported; kept
  only as a markup reference. Safe to delete once you're happy with the preloader.
