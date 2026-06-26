# Parallax Image Layers (reference)

Saved reference from the Osmo Vault resource **"Parallax Image Layers"**.
Source: https://www.osmo.supply/demo/parallax-image-layers
Live preview: https://osmo-parallax-image-layers-resource.webflow.io/
Original source: https://project-parallax.com/ — credited to **Dennis Snellenberg**.
Published Nov 21, 2024 · Category: Scroll Animations · Free resource.

> This is a saved spec for **later use**. It is NOT wired into Aira yet.
> The raw code below is the Osmo/Webflow version (init on `DOMContentLoaded`,
> inline `registerPlugin`). To use on Aira it must be ported to our conventions:
> `useGSAP` + `createMatchMedia` from `lib/gsap.ts`, with a reduced-motion guard.
> See "Porting notes for Aira" at the bottom.

## What it is

A full-viewport, scroll-driven **multi-layer parallax hero** built with
**GSAP + ScrollTrigger**. Several stacked images plus a large title each scroll
at a different speed (foreground fastest → background slowest), faking 3D depth /
a camera-push feel as you scroll past.

## How it works (the trick)

- A wrapper `[data-parallax-layers]` holds N layers, each tagged
  `data-parallax-layer="1..4"`.
- One GSAP timeline, scrubbed to ScrollTrigger over the wrapper's scroll span.
- Each layer tweens `yPercent` by a different amount with `ease: "none"`, all
  stacked at the same time position (`"<"`). Different `yPercent` = different
  apparent depth.
- Layer order in the demo: 1 = front image (fastest), 2 = mid image,
  3 = title, 4 = back image (slowest).
- Images are oversized (`height: 117.5%; top: -17.5%`) so there's vertical slack
  to move through without exposing edges.

## Requirements

GSAP 3.15 + ScrollTrigger must be loaded before the script.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollTrigger.min.js"></script>
```

(Aira already has GSAP + ScrollTrigger installed as npm deps — no CDN needed.)

## HTML

```html
<div class="parallax">
  <section class="parallax__header">
    <div class="parallax__visuals">
      <div class="parallax__black-line-overflow"></div>
      <div data-parallax-layers class="parallax__layers">
        <img src=".../osmo-parallax-layer-3.webp" loading="eager" width="800" data-parallax-layer="1" alt="" class="parallax__layer-img">
        <img src=".../osmo-parallax-layer-2.webp" loading="eager" width="800" data-parallax-layer="2" alt="" class="parallax__layer-img">
        <div data-parallax-layer="3" class="parallax__layer-title">
          <h2 class="parallax__title">Parallax</h2>
        </div>
        <img src=".../osmo-parallax-layer-1.webp" loading="eager" width="800" data-parallax-layer="4" alt="" class="parallax__layer-img">
      </div>
      <div class="parallax__fade"></div>
    </div>
  </section>
  <section class="parallax__content">
    <!-- Osmo icon SVG omitted -->
  </section>
</div>
```

## CSS

```css
.parallax {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.parallax__content {
  padding: 10em 1em;
  justify-content: center;
  align-items: center;
  min-height: 100svh;
  display: flex;
  position: relative;
}

.parallax__layers {
  object-fit: cover;
  width: 100%;
  max-width: none;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}

.parallax__title {
  pointer-events: auto;
  text-align: center;
  text-transform: none;
  margin-top: 0;
  margin-bottom: .1em;
  margin-right: .075em;
  font-size: 10em;
  font-weight: 700;
  line-height: 1;
  position: relative;
}

.parallax__black-line-overflow {
  z-index: 20;
  background-color: #000;
  width: 100%;
  height: 2px;
  position: absolute;
  bottom: -1px;
  left: 0;
}

.parallax__layer-img {
  pointer-events: none;
  object-fit: cover;
  width: 100%;
  max-width: none;
  height: 117.5%;
  position: absolute;
  top: -17.5%;
  left: 0;
}

.parallax__fade {
  z-index: 30;
  object-fit: cover;
  background-image: linear-gradient(#0000, #000);
  width: 100%;
  max-width: none;
  height: 20%;
  position: absolute;
  bottom: 0;
  left: 0;
}

.parallax__header {
  z-index: 2;
  padding: 10em 1em;
  justify-content: center;
  align-items: center;
  min-height: 100svh;
  display: flex;
  position: relative;
}

.parallax__visuals {
  object-fit: cover;
  width: 100%;
  max-width: none;
  height: 120%;
  position: absolute;
  top: 0;
  left: 0;
}

.parallax__layer-title {
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100svh;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
}
```

## JavaScript

```javascript
gsap.registerPlugin(ScrollTrigger);

function initParallaxLayers() {
  document.querySelectorAll('[data-parallax-layers]').forEach((triggerElement) => {
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 0%",
        end: "100% 0%",
        scrub: 0
      }
    });
    const layers = [
      { layer: "1", yPercent: 70 },
      { layer: "2", yPercent: 55 },
      { layer: "3", yPercent: 40 },
      { layer: "4", yPercent: 10 }
    ];
    layers.forEach((layerObj, idx) => {
      tl.to(
        triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
        {
          yPercent: layerObj.yPercent,
          ease: "none"
        },
        idx === 0 ? undefined : "<"
      );
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initParallaxLayers();
});
```

## Author's guidance

- **Wrapper** — `[data-parallax-layers]` controls the scroll interaction and
  registers all layers within it.
- **Layer** — each `[data-parallax-layer]` reacts to scroll position. Lower
  values move faster, higher values move slower (simulating depth).
- **Layer speed** — `"1"` moves fastest, higher numbers more subtly. Tune the
  `yPercent` values in the script.
- **Image layers** — works best with images that have visible depth (landscapes,
  architecture, wide shots). Cut the photo into separate transparent PNG layers
  (foreground / midground / background) in Photoshop for clean depth planes.
- **Tips** — no more than 4–5 layers for performance; mix image + text layers
  for a stronger 3D look. Pair with the Lenis smooth-scroll setup for smoothness.

## Porting notes for Aira

Our stack already has GSAP + ScrollTrigger + Lenis, so this is directly
compatible — but do NOT paste the Osmo init code as-is. To match Aira conventions:

- Initialize inside `useGSAP` (scoped to the component ref), not on
  `DOMContentLoaded`.
- Register ScrollTrigger / build triggers via `createMatchMedia` from
  `lib/gsap.ts`, with a `prefers-reduced-motion` guard that skips/flattens the
  parallax (static layers, no scrub) for reduced-motion users.
- We don't need the CDN script tags — import from the installed `gsap` package.
- Lenis is already wired site-wide; no separate Lenis setup needed.
- Test mobile at 320 / 375 / 768px and run `npx next build` clean before
  declaring done (per CLAUDE.md / MOBILE-RULES.md).
