# V4 REDESIGN — working doc

Live tracking doc for the v4 rebuild. `SITE-MASTER.md` documents the **v3 live
site** and stays the reference for business facts, infra, DB and the data
contract. This file owns everything about **v4**.

Last updated: 2026-08-19

---

## 1. The decision

Aira Photography and Agnitantra Events are two sub-brands of one company. v1
put a two-button fork in the hero (`Our Photography` / `Events and Catering`)
on a bare maroon splash screen — the client's literal spec, and it did not work.

**v4 approach (James's call):** build the two pages as strong standalone
experiences first, and solve the connection between them last.

- Domain stays `agnitantraevents.com`
- `/photography` — the whole Aira Photography experience
- `/events` — the whole Agnitantra Events experience
- Same structural language, **different palettes**
- The home page and the link between the two brands are decided **after** both
  pages exist

Build order: **Aira (`/photography`) first.**

---

## 2. Working rules — non-negotiable

- **James designs all UI.** He supplies designs (Google Stitch, Claude web);
  Claude implements them exactly. No components, styling or content invented
  unprompted.
- **From scratch.** v4 inherits nothing from v3 — no tokens, no fonts, no
  components. Treat it as a new site that happens to share a repo.
- **Do not touch the current site.** No edits to shared v3 components, to
  `/events`, `/about`, `/manage`, or to `app/api/admin/**`.
- **Localhost only.** `npm run dev` → :3000.
- **Commit freely, never push, never deploy** until James says so.
- **master stays untouched** — Vercel deploys master only, so production keeps
  serving v3 for the whole rebuild.
- When James pastes a design for a section that already has an implementation,
  **ask** whether it replaces it or is an alternative. Never silently overwrite.

Everything in `SITE-MASTER.md` §15 (Non-negotiables) still applies — notably:
the `lib/cms` contract is untouchable, `proxy.ts` gates only `/manage` +
`/api/admin`, Lenis stays GSAP-ticker driven (`autoRaf: false`), and
`BUSINESS.legalName` keeps its `&`.

---

## 3. Isolation — how v4 is kept apart from v3

One flag drives everything: `components/SiteChrome.tsx` sets
`html[data-bare="true"]` on any route listed in `BARE_ROUTES`.

```ts
const BARE_ROUTES = ["/", "/photography"];
```

Add a route to that array and it becomes a v4 bare canvas. Remove it and the
route returns to full v3 chrome. **No shared v3 component is ever edited.**

### What that flag switches off

| Thing | Where it lives | How it is gated |
|---|---|---|
| Site nav | `components/SiteNav.tsx` | `SiteChrome` returns `null` — file untouched |
| Custom cursor | `components/Cursor.tsx` | same — file untouched |
| Film grain | `app/globals.css` `body::after` | `html[data-bare="true"] body::after { display: none }` |
| v3 base styles | `app/globals.css` | neutralised in `app/v4.css` |
| v3 fonts | `app/layout.tsx` | font tokens unset in `app/v4.css` |

### `app/v4.css` — the isolation layer

Every rule is scoped to `html[data-bare="true"]`, so v3 routes never match and
the live site cannot be affected. It does two jobs:

1. **Neutralises v3** — resets `body` (background, colour, font, weight,
   line-height), `h1`–`h4`, `p`, `::selection`, and unsets the
   `--font-*` tokens so v3 typefaces cannot be referenced.
2. **Holds the v4 design tokens** — currently empty, awaiting James's palette.

Deliberately kept from the v3 reset because they are neutral, not stylistic:
`box-sizing`, `margin: 0`, `img`/`svg` `display: block`, `a { color: inherit }`,
`button { font: inherit }`.

Imported at the **top** of `globals.css` — CSS `@import` is only valid before
other rules.

### Still shared (by design, for now)

`app/layout.tsx` wraps every route, including v4 ones, with:

- **Clerk** (`ClerkProvider`) — needed by `/manage`
- **Lenis** (`LenisProvider`) — smooth scroll; kept deliberately, **ask James
  before gating it**
- **Site-wide JSON-LD** — Organization + WebSite schema
- **Font files** — still loaded site-wide because v3 routes need them; v4 just
  cannot reference them by token
- **Global metadata** — title template, OG, geo hints

### SEO kept on v4 routes

Design-independent and preserved on a live domain: per-page `metadata`
(title, description, keywords, canonical, OG) and breadcrumb JSON-LD.
The `imageGallerySchema` was dropped with the gallery and returns once the v4
design places photos.

---

## 3a. Mobile — mandatory, not an afterthought

**Every v4 section is built for phone and desktop simultaneously.** Mobile is
not a pass done afterwards. Defaults live in `app/v4.css` §2 so no component
re-solves them.

### Breakpoints — one set, mobile-first. Do not invent others.

| Token | Width | Target |
|---|---|---|
| (base) | `0px+` | phone — **write this first** |
| `--bp-sm` | `480px+` | large phone |
| `--bp-md` | `768px+` | tablet |
| `--bp-lg` | `1024px+` | laptop |
| `--bp-xl` | `1440px+` | large desktop |

Always `min-width` (mobile-first). CSS variables are not valid inside `@media`,
so media blocks use the px literals; the tokens keep JS and docs in agreement.

### Enforced defaults

- **Viewport height** — never bare `100vh` on mobile; it ignores browser chrome
  and overflows. Use `100svh` for sections that must always fit, `100dvh` when
  it should grow as bars retract. Ship the `100vh` line first as fallback.
- **No horizontal scroll** — the page never scrolls sideways. Wide content
  (galleries, marquees, tables) scrolls inside its own `overflow-x` container.
- **Touch targets** ≥ `44x44px` under `@media (pointer: coarse)` — WCAG 2.5.5 /
  iOS HIG. Desktop links keep their natural size.
- **Media** never exceeds its container (`max-width: 100%`, `height: auto`).
- **Long words / URLs** wrap rather than forcing the page wide.
- **Reduced motion** respected — animation degrades, never strands mid-state.
- **Fluid gutter** `--gutter-v4`: 20px phone → 64px large desktop.

### Rule for building

If a component differs *meaningfully* by viewport — not just spacing — split it
into `components/desktop/X.tsx` and `components/mobile/X.tsx` per
`SITE-MASTER.md` §15. Otherwise one responsive component.

v3's breakpoints (640/900/1024, applied inconsistently) are **not** inherited.

---

## 4. Current state

| Route | State |
|---|---|
| `/` | v4 clean slate — 4 empty full-height sections, `#section-1`…`4` |
| `/photography` | v4 clean slate — 4 empty full-height sections, metadata + breadcrumb kept |
| `/events` | untouched v3 |
| `/about` | untouched v3 |
| `/manage` | untouched v3 |

**Palette: not yet specified.** Both slates are plain `#fff` placeholders —
no v3 tokens referenced.

### Files changed vs master

```
app/globals.css                  one grain rule + the v4.css import
app/layout.tsx                   two imports swapped for <SiteChrome />
app/page.tsx                     home clean slate
app/page.module.css              new
app/photography/page.tsx         Aira clean slate
app/photography/page.module.css  new
app/v4.css                       new — isolation layer + mobile constraints
components/SiteChrome.tsx        new — route gate
V4-REDESIGN.md                   new — this file
```

---

## 5. Revert net

Every level, verified:

```sh
# Restore the v3 photography page only
git checkout v3-maroon-cinema -- app/photography/page.tsx

# Restore the v3 home page only
git checkout v3-maroon-cinema -- app/page.tsx

# Undo one v4 commit
git revert <sha>

# Drop v4 isolation entirely: delete app/v4.css and its @import in globals.css

# Back to the live v3 site
git checkout master

# Promote v4 when James says so
git checkout master && git merge redesign-v4
```

Tags `v1-pre-redesign`, `v2-redesign-wip`, `v3-maroon-cinema` exist locally and
on the remote. Branch `redesign-v4` is on GitHub (amalbycia/aira-site) but is
**behind** local — v4 work is deliberately unpushed.

---

## 6. Open questions

- **Palette** for Aira — James to supply.
- **Fonts** for v4 — James to supply. Currently system-ui fallback.
- **The connection** between `/photography` and `/events`, and what the home
  page becomes. Deferred until both pages exist.
- **Home page before merge** — `/` is currently four empty sections. Must not
  reach production in that state.
- **Data re-wiring** — gallery, reels and reviews come back through
  `lib/cms/getPage.ts` / `getContent.ts` once the design places them. The
  contract itself does not change.
- **Lenis on v4 routes** — still active. Ask before gating.

---

## 7. Not part of v4 (still outstanding)

**LAUNCH-BLOCKING:** production still serves Clerk `pk_test` keys. Needs
`pk_live` / `sk_live` in Vercel. Independent of this redesign.
