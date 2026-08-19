# HANDOVER — Aira v4 redesign

Paste this at the start of the next session.

---

## Start here

Read these three, in order:

1. **`V4-REDESIGN.md`** — the v4 approach, working rules, isolation mechanism,
   revert net. Owns everything about v4.
2. **`SITE-MASTER.md`** — the **v3 live site**: business facts, infra, DB, data
   contract, non-negotiables. Still authoritative for everything except v4.
3. **`OKAYRAWDOG.md`** — James's raw idea scratchpad. **Read-only context.**
   Never act on anything in it unless James says so.

Repo: `C:\dev\aira-site` — NOT the OneDrive copy (dead fallback).
Stale, ignore: `TODO.md`, `HANDOVER-*.md` (other than this one),
`PROJECT-CONTEXT.md`, `SITE-JOURNEY.md`.

---

## How James works — non-negotiable

- **He designs everything. Claude implements, exactly.** No components,
  styling, content or "improvements" invented unprompted.
- **Do only what he asks.** Do not touch things adjacent to the request. If a
  change he asks for will visibly move something he did NOT ask about, say so
  first — do not silently absorb it.
- **Never auto-commit.** Only commit when he explicitly asks. Never push, never
  deploy.
- **Be brief.** Short answers, no essays, no unsolicited option menus.
- **Address him by name.**
- When he pastes a design for a section that already has an implementation,
  **ask** whether it replaces it or is an alternative.
- **Measure, don't eyeball.** He caught Claude guessing dimensions off
  screenshots. If a reference site is available, pull its real CSS.

---

## Where things stand

Branch `redesign-v4`, HEAD `e1154fa`. **Significant uncommitted work in the
tree** (the whole hero) — he was told it is uncommitted and chose to leave it.

Dev server: `npm run dev` → localhost:3000. Was running at session end.

### Routes

| Route | State |
|---|---|
| `/photography` | **v4 in progress** — hero built in section 1; sections 02-04 empty |
| `/` | v4 clean slate, 4 empty sections |
| `/events`, `/about`, `/manage` | untouched v3 |

### Uncommitted

```
 M app/photography/page.tsx          hero wired in, marker 01 removed
 M app/photography/page.module.css   marker styles
 D public/images/v4-roses.png        roses removed at his request
?? components/v4/photography/Hero.tsx
?? app/photography/hero.module.css
```

---

## The hero (section 1)

Wireframe: grey placeholder blocks, no real images, system/Georgia fallback
type. Deliberate — he is wireframing, not styling.

Reference: **https://camila.soulkynd.com/** — a Showit site on a fixed
**1200x1100 canvas**. Its stylesheet carries exact pixel coordinates. Get them:

```sh
curl -sL https://camila.soulkynd.com/ -o /tmp/camila.html
sed -n '/id="si-page-css"/,/<\/style>/p' /tmp/camila.html | tr '}' '}\n' | grep '^\.d \.sie-hero_'
```

Original reference coordinates (converted to % of a 1200 stage in
`hero.module.css`):

| Tile | Showit id | px (x, y, w×h) | notes |
|---|---|---|---|
| Main | `hero_7` | 368, 270 · 464×543 | ~6:7 portrait, **not square** |
| A | `hero_3` | −38, 147 · 200×247 | bleeds off left, opacity .7 |
| B | `hero_4` | 111, 353 · 145×173 | opacity .8 |
| C | `hero_11` | 234, 569 · 158×190 | overlaps main's lower-left |
| D | `hero_9` | 811, 346 · 115×139 | overlaps main's right edge |
| E | `hero_6` | 882, 606 · 122×145 | opacity .8 |
| F | `hero_5` | 949, 671 · 274×372 | tallest, bleeds off right |

### Where James moved it away from the reference

His tweaks, applied on top — do not "correct" these back:

- Wordmark **much smaller** (`clamp(1.5rem, 4.4vw, 3.6rem)`), top-centred
- **A and B pushed further left** (−9%, 3.5%)
- **E and F pushed further right** (79%, 85%)
- **D returned to the reference** `67.58%` — he wants it tight to the centre box
- **Centre column fixed** — main `30.67%`, C `19.5%`. He was explicit: do not
  move these.
- Whole stage pulled up via negative top margin `clamp(-6rem, -11vw, -3rem)`
- Quote block pulled up via negative margin `clamp(-2rem, -3.5vw, -0.75rem)`

**Lesson learned the hard way:** shrinking the wordmark shortened the header and
shifted the stage up, which read to him as "you moved the centre box." When a
change will move something he did not ask about, warn him first.

---

## Next session — his stated plan

1. Scoop elements from other sites he likes
2. **Torn-paper section transitions** — he asked how hard; answer given:
   easy-to-medium. SVG path with a jagged edge at each section boundary, filled
   with the next section's colour. Randomised per seam needs a deterministic
   seed or React throws a hydration error. Only works between two solid
   colours; a photo background needs a mask instead.
3. Design the rest of `/photography`

Ask before starting. Do not begin any of it unprompted.

---

## Isolation — how v4 stays off the live site

One flag: `components/SiteChrome.tsx` sets `html[data-bare="true"]` for routes
in `BARE_ROUTES` (currently `["/", "/photography"]`). That kills nav, cursor and
film grain. `app/v4.css` — every rule scoped to that flag — neutralises the v3
base layer and unsets the v3 font tokens.

**No shared v3 component has been edited.** `SiteNav.tsx` and `Cursor.tsx` are
untouched.

### Hard constraints

- `lib/cms` data contract is untouchable
- `/manage` + `app/api/admin/**` off limits
- `proxy.ts` gates ONLY `/manage` + `/api/admin`
- Lenis stays GSAP-ticker driven (`autoRaf: false`)
- `BUSINESS.legalName` keeps its `&`
- Never invent APIs or paths — verify against `node_modules`
- Meaningful viewport differences → `components/desktop/X.tsx` +
  `components/mobile/X.tsx`

### Mobile — mandatory

Built simultaneously with desktop, never retrofitted. Defaults in `app/v4.css`
§2: one mobile-first breakpoint set (480/768/1024/1440), no horizontal scroll,
44px touch targets under `(pointer: coarse)`, `100svh` over bare `100vh`,
reduced-motion respected.

---

## Revert net

```sh
git checkout v3-maroon-cinema -- app/photography/page.tsx   # v3 photography back
git checkout v3-maroon-cinema -- app/page.tsx               # v3 home back
git checkout master                                         # live v3 site
git checkout master && git merge redesign-v4                # promote v4
```

Tags `v1-pre-redesign`, `v2-redesign-wip`, `v3-maroon-cinema` exist locally and
on the remote. `redesign-v4` is on GitHub but **behind** local — v4 work is
deliberately unpushed. master is untouched, so production is unaffected.

---

## Open

- **Palette and fonts** — not yet specified. Everything is grey placeholders
  and system fallback type on purpose.
- **The connection** between `/photography` and `/events`, and what the home
  page becomes. Deferred until both pages exist.
- **`/` is four empty sections** — must not reach production that way.
- **Data re-wiring** — gallery/reels/reviews return through
  `lib/cms/getPage.ts` / `getContent.ts` once the design places them.
- **Lenis on v4 routes** — still active. Ask before gating.
- **LAUNCH-BLOCKING, unrelated to v4:** production still serves Clerk
  `pk_test` keys. Needs `pk_live`/`sk_live` in Vercel.
