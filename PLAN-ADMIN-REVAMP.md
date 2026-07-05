# Plan — Admin console split (per-page) + emphasized reviews rating

Two pieces, both additive. **No existing admin feature is removed or broken** — this
reorganizes the SAME upload/edit/delete/reorder logic into per-page sections, and
adds a rating hero to the events reviews. Events page media layout is intentionally
LEFT AS-IS for now (to discuss later). Footer untouched.

---

## A. Admin console → two page-scoped sections

### Goal
Top-level split so the owner works "by page", not "by content type":

```
Photography            Events
  ├─ Photos              ├─ Photos
  └─ Reels & Videos      ├─ Reels & Videos
                         ├─ Events Menu
                         └─ Reviews
```

Each page's **reels/videos are distinct** (a photography reel never shows on events).
Photos are already per-page; reels/reviews move from a 3-way scope to strict per-page.

### Current state (so nothing breaks)
- `Dashboard.tsx` has flat tabs: Photos, Reels & Videos, Reviews, Events Menu.
- `PhotosTab` already has an internal photography/events switch → already per-page.
- `ReelsTab` / `ReviewsTab` use `ContentScope = "photography" | "events" | "both"`
  with a "Show on" dropdown.
- Menu is events-only already.

### Data model change: drop `"both"`, go strictly per-page
- `ContentScope` becomes `"photography" | "events"` (a `PageBrand`).
- **Migration (one-off script, like migrate-menu.mjs):**
  - Reels: the 4 `both` reels are event reels → set to `events`. (Photography keeps its 1.)
  - Reviews: the 15 `both` reviews → set to `events` (they're wedding/event
    testimonials). Photography starts with no live reviews; its marquee already
    falls back to tasteful placeholders, so it won't look empty. James adds
    photography-specific reviews later via the new Photography → (no reviews tab)…
    NOTE: per the section map, Reviews live ONLY under Events. Photography has no
    Reviews sub-tab. So photography's marquee stays on its placeholder fallback
    until/unless we add a photography reviews section later.
  - Script is idempotent + prints a summary; run once locally against prod Neon.
- Update the CHECK/allowed values everywhere `both` is referenced:
  `lib/cms/admin.ts` (isScope guards, types), the 4 `/api/admin/reels|reviews` routes,
  `getContent.ts` `getReviews` (drop the `or page='both'`), `getPage.ts` reels query
  (drop `or page='both'`).

### UI restructure (Dashboard.tsx)
- Replace the 4 flat tabs with a **two-level nav**: a top row picking
  **Photography | Events**, then a sub-tab row scoped to that page.
  - Photography → [Photos] [Reels & Videos]
  - Events → [Photos] [Reels & Videos] [Menu] [Reviews]
- Reuse existing tab components, just pass a fixed `page` prop instead of an internal
  switch/dropdown:
  - `PhotosTab` — drop its internal photography/events toggle; accept `page` prop.
  - `ReelsTab` — drop the "Show on" dropdown; accept `page`, POST that page.
  - `ReviewsTab` — drop the "Show on" select; accept `page`, POST/PUT that page.
  - `MenuTab` — unchanged (events-only), lives under Events.
- `manage/page.tsx` already loads photography+events photos separately; extend the
  same split to reels/reviews (load per page) so each section is pre-populated.
- Keep ALL current behavior: uploads (Bunny), compress, reorder arrows/drag, delete,
  Clerk `<UserButton>`, toasts. Only the grouping changes.

### Why this is safe
- Same APIs, same DB tables, same upload flow — only the `page` value is now fixed by
  which section you're in, instead of chosen in a dropdown. Fewer ways to mis-tag.
- Admin field labels stay owner-friendly.

---

## B. Emphasize the reviews rating (events page)

### Goal
Turn the small pill (`4.9 ★ · 148+ Google reviews`) into a real focal point: a large
**hero rating block** above the testimonial marquee. The scrolling cards stay as-is.

### Change (scoped to `components/events/TestimonialMarquee.tsx` only)
- Add a prominent rating hero ABOVE the marquee head when `googleRating` is present:
  - Large `4.9` numeral (Sometimes-Times display face), full gold star row,
    `148+ Google reviews` label, and the existing "Read on Google" CTA.
  - Sits in the cream section, centered, with generous spacing so it reads as the
    section's headline moment. Mobile: stack + scale down (fluid clamp, 16px floor).
- Keep the existing marquee, cards, pause-on-hover, reduced-motion fallback exactly.
- The old inline pill (`.tm__band`) is replaced by the hero block (same data:
  `googleRating`, `googleReviewCount`, `googleUrl` already passed from the events page).
- No new deps. Pure CSS/markup in the component's scoped `<style>`.

### Explicitly NOT touched
- The events page section order and the gallery/reels layout (leave as-is; discuss later).
- The footer (stays the same).
- Photography page's testimonial usage (it doesn't pass the Google band today, so the
  hero only appears where the data is provided — no change there).

---

## Files touched
- `app/manage/Dashboard.tsx` — two-level page/section nav.
- `app/manage/page.tsx` — load reels/reviews per page.
- `app/manage/tabs/PhotosTab.tsx` `ReelsTab.tsx` `ReviewsTab.tsx` — take a `page` prop,
  drop the scope selectors.
- `lib/cms/admin.ts` — `ContentScope` → per-page; update list/add/update signatures.
- `app/api/admin/reels/route.ts` + `[id]`, `reviews/route.ts` + `[id]` — validate page.
- `lib/cms/getContent.ts`, `lib/cms/getPage.ts` — drop `or page='both'`.
- `components/events/TestimonialMarquee.tsx` — rating hero block.
- `scripts/migrate-scope.mjs` — one-off: reels both→events, reviews both→dup per page.
- Docs: update `ADMIN-CONSOLE.md` (new section layout) + memory `project-events-menu`.

## Verification
- `next build` clean + `tsc`.
- Admin: each section uploads/edits/deletes/reorders correctly; a photography reel
  does NOT appear on events and vice-versa; menu still events-only.
- Public: events + photography still render their reels/reviews (fail-soft intact).
- Rating hero shows on events, scales on mobile (320/375), contrast OK.
- Commit + push (auto-deploy), verify prod.

## Rollout order
1. Migration script (data first, reversible-ish — keep a note of what moved).
2. Data-layer + API scope changes.
3. Admin UI restructure.
4. Reviews rating hero.
5. Build/verify/deploy.
