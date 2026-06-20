# Mobile Optimization Rules — Non-Negotiable

These rules exist because the current mobile build is broken (text overflow, oversized
hero bleeding off-screen, illegible button labels). Every component, from this point on,
must be checked against these rules before it's considered done — not as a follow-up pass.

---

## 1. Design Mobile-First, Not Desktop-Shrunk

- Write the smallest-viewport styles first, then layer up with `min-width` media queries
  for tablet/desktop — never the reverse.
- Never take a desktop layout and apply `font-size: smaller` as the only mobile fix.
  If a layout breaks on mobile, the structure changes, not just the scale.
- Breakpoints are based on where content actually breaks, not arbitrary device widths.
  Common reference ranges: 320–480px (phone), 481–767px (large phone/small tablet),
  768–1023px (tablet), 1024px+ (desktop).

## 2. Touch Targets

- Every interactive element (buttons, links, nav toggles) must have a minimum tap target
  of 44×44px (Apple HIG) — never smaller.
- Minimum 8px spacing between adjacent tappable elements to avoid mis-taps.
- Icon-only buttons need the same 44×44px minimum hit area even if the visible icon is
  smaller — pad the clickable area, don't shrink the target.

## 3. Typography

- Body text minimum 16px on mobile. Never go smaller — it forces iOS Safari to
  auto-zoom on input focus, which breaks layout.
- Line height for body text: 1.5–1.8 on mobile (more breathing room than desktop).
- Headings must use `clamp()` so they scale fluidly — never a fixed `em`/`rem` value that
  was only checked on desktop.
- No `nowrap` on any heading or button label unless verified it fits at 320px width.
  Wrapping is fine; horizontal overflow or text clipping is not.

## 4. Layout & Overflow

- `overflow-x: hidden` on `body` is a safety net, not a fix — find and fix the actual
  element causing horizontal scroll, don't just hide it.
- No fixed pixel widths on containers meant to hold text or buttons — use `%`, `clamp()`,
  or `min()`/`max()` so nothing bleeds off-screen at 320px.
- Multi-column desktop layouts (grids, side-by-side panels) must collapse to a single
  column on mobile — never shrink columns to fit, stack them.
- Hero sections must never force content (title, buttons) to overflow their container on
  small viewports — test at 320px width explicitly, not just 375px or 390px.

## 5. Spacing

- Reduce (don't just scale) spacing on mobile — desktop's generous whitespace becomes
  wasted scroll distance on a small screen. Use the Osmo fluid scaling system's container
  variants rather than hardcoded desktop spacing values.

## 6. Testing Requirement

- Every new component or layout change must be checked at minimum: 320px, 375px, and
  768px widths before being marked done.
- Use actual viewport resizing (browser DevTools device toolbar) — not just shrinking
  the browser window, which doesn't simulate real mobile rendering.
- If a component has genuinely different structure on mobile vs desktop (not just scale),
  split it per the project's existing `components/desktop/` / `components/mobile/`
  convention — see [CLAUDE.md](./CLAUDE.md).

---

## Sources

- [UXPin — Mobile-First Design Guide (2026)](https://www.uxpin.com/studio/blog/a-hands-on-guide-to-mobile-first-design/)
- [Scrimba — Responsive Web Design Complete Guide (2026)](https://scrimba.com/articles/responsive-web-design-a-complete-guide-2026-2/)
- [Smart Interface Design Patterns — Accessible Tap Target Sizes](https://smart-interface-design-patterns.com/articles/accessible-tap-target-sizes/)
- [TestParty — WCAG 2.5.8 Target Size Guide](https://testparty.ai/blog/wcag-target-size-guide)
- [FontFyi — Minimum Font Sizes and Touch Targets](https://fontfyi.com/blog/mobile-typography-accessibility/)
