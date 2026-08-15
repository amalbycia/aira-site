# Site Versions

How to find, run, and switch between versions of this site. Every version is a
git tag plus (for work in progress) a branch, so nothing is ever lost and any
version can be brought back exactly as it was.

**Currently checked out:** `master` → **v1** (the live design).

---

## Version list

| Version | Tag | Branch | Status | Design |
|---|---|---|---|---|
| **v1** | `v1-pre-redesign` | `master` | **Live in production** | Maroon + cream, Cormorant/Nohemi, damask hero, column-drift gallery |
| **v2** | `v2-redesign-wip` | `redesign-v2` | Built, needs visual review | "Warm Archive" — paper + forest green + gold, Cormorant/Hanken, editorial gallery |

---

## v1 — Current live site

**Tag:** `v1-pre-redesign` · **Branch:** `master` · **Deploys to:** https://agnitantraevents.com

The design that has been in production since the SEO pass in July 2026. This is
what visitors see today, and what `git push origin master` deploys.

- Palette: maroon `#7a1f1f` + cream `#f5ede0` + gold `#c9a96e`
- Type: Cormorant Garamond, Nohemi, DM Sans, Alex Brush, Sometimes Times
- Home: `HeroPreloader` (Osmo crisp-loader carousel that expands into the hero)
- Photography: `ColumnDriftGallery` — multi-speed scroll-scrubbed column parallax
- Events: `TestimonialMarquee` with rating hero, `CateringMenu`, `ServicesList`
- Nav: `SideNav` + `PageTransition`

---

## v2 — "Warm Archive" redesign

**Tag:** `v2-redesign-wip` · **Branch:** `redesign-v2` · Not deployed.

A complete visual rebuild commissioned to be more eye-catching, informed by
Tuesday Lights (the client's own reference), Sam Bufalo and Adovasio. Routes,
copy, contact details and CMS/CDN wiring are all unchanged from v1.

**Design**
- Palette: warm paper `#F4F1EA`, ink `#1A1A17`, botanical green `#2E4034`, gold `#A98A4B`
- Type: Cormorant Garamond (display) + Hanken Grotesk (UI). Playfair deliberately
  avoided — 2026 guidance flags it as over-used for wedding work.
- Restrained motion: one reveal primitive, all `once: true`, **no scroll-scrubbed
  parallax** (the main cause of jank on mid-range phones), full reduced-motion support.
- Reel play/pause uses the **Osmo morphing toggle**, ported verbatim from the demo
  the client linked, via GSAP's MorphSVGPlugin (ships with 3.15, verified in
  `node_modules` — not a CDN script).

**New in v2**
- `Preloader` — first-visit only (per session), capped at 1200ms, never gates content
- `EditorialGallery` — masonry rhythm replacing column-drift
- `SiteNav`, `Reveal`, `Testimonials`, `StatStrip`, `PlayPauseToggle`,
  `home/{Hero,Intro,BrandSplit,Marquee}`
- **Events/Photography page customizability in `/manage`** — a "Page Content" tab
  where the owner edits hero copy, section headings, three stat figures and a CTA.

**Known state at time of commit**
- `next build` passes; lint clean in our source; all four pages return 200 with a
  clean browser console.
- Fixed during verification: invisible hero headline (GSAP `yPercent` resolving
  against the CSS pre-state), a hydration mismatch in the preloader, a React 19
  `inert` warning, and two setState-in-effect cascades.
- **Not yet reviewed by James.** Hero image crops and the type scale still need a
  human eye. Mobile pass was started but not finished.

---

## Database note (important)

The v2 work added **18 nullable columns** to the `pages` table via
`scripts/migrate-page-content.mjs`. That migration has **already been applied to
the live Neon database**.

This is safe for v1: the columns are additive and nullable, and v1's `getPage()`
selects only the columns it knows about, so the live site is unaffected. Nothing
needs to be rolled back to run v1.

---

## Commands

```bash
# See every version
git tag -n1

# Switch to the live design (v1)
git checkout master

# Switch to the redesign (v2)
git checkout redesign-v2

# Inspect a version without moving a branch (detached HEAD — look, don't commit)
git checkout v1-pre-redesign
git checkout v2-redesign-wip

# Compare two versions
git diff v1-pre-redesign v2-redesign-wip --stat

# Run whichever version is checked out
npm run dev        # http://localhost:3000
```

### Making a new version

```bash
git checkout master
git checkout -b redesign-v3           # branch off the live design
# …build…
git add -A && git commit -m "Redesign v3: …"
git tag -a v3-<name> -m "<what it is>"
```

Then add a row to the table above.

### Promoting a version to live

Only when the version has been reviewed and approved:

```bash
git checkout master
git merge redesign-v2                 # or whichever branch
git push origin master                # auto-deploys to Vercel
```

### If a deploy goes wrong

```bash
git checkout master
git reset --hard v1-pre-redesign
git push --force-with-lease origin master
```

---

## Conventions

- `master` always holds the **live** design. Never build directly on it.
- One branch per redesign direction (`redesign-v2`, `redesign-v3`, …).
- Tag every version worth returning to, with a description in the tag message.
- Tags are permanent bookmarks — a branch may move, a tag never does.
- Push tags to GitHub with `git push origin --tags` so they survive this machine.
