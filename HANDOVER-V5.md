# HANDOVER — Aira v4 redesign (session 2)

Paste this at the start of the next session.

---

## Start here

1. **`V4-REDESIGN.md`** — v4 approach, working rules, isolation, revert net.
2. **`SITE-MASTER.md`** — the v3 live site: business facts, infra, DB, data
   contract, non-negotiables.
3. **`OKAYRAWDOG.md`** — James's raw scratchpad. **Read-only.** Never act on it
   unless he says so.
4. **`PARKED-hero-scatter.md`** — the hero tile system, parked mid-session then
   half-restored. See "UNFINISHED" below.

Repo: `C:\dev\aira-site` — NOT the OneDrive copy.
Stale, ignore: `TODO.md`, `PROJECT-CONTEXT.md`, `SITE-JOURNEY.md`,
`HANDOVER-V4.md` (superseded by this file).

---

## How James works — non-negotiable

- **He designs everything. Claude implements, exactly.** Nothing invented
  unprompted — no components, styling, content or "improvements".
- **Do only what he asks.** Do not touch adjacent things. If a change he asks
  for will visibly move something he did NOT ask about, say so first.
- **Do not over-deliver.** He said it directly this session: *"no need to do
  more than i asked for, ill lyk if i want it."* When he asks for a colour,
  give the colour — not a colour plus a texture system plus three options.
- **When he says "a bit more", just do it.** He got visibly annoyed at
  commentary during iterative nudges: *"just listen to me lol."* Adjust the
  value, state the new value, stop. Save observations for when he asks.
- **Never auto-commit.** Only commit when he explicitly asks. Never push,
  never deploy.
- **Be brief.** Short answers, no essays, no unsolicited option menus.
- **Address him by name.**
- When he pastes a design for a section that already has an implementation,
  **ask** whether it replaces it or is an alternative.
- **Measure, don't eyeball.** Pull real CSS from reference sites.

---

## Where things stand

Branch `redesign-v4`, HEAD `e1154fa` — unchanged this session. **All work is
uncommitted.** He knows and chose to leave it that way.

Dev server was running at `localhost:3000` throughout.

### Working tree

```
 M app/photography/page.module.css     beige + paper texture, per-section variation
 M app/photography/page.tsx            RosesDivider + 4 paper layers wired in
 D public/images/v4-roses.png          (staged deletion, from last session)
?? HANDOVER-V4.md                      previous handover
?? PARKED-hero-scatter.md              parked tile system — see UNFINISHED
?? app/photography/hero.module.css     scatter CSS restored, markup is not
?? app/photography/roses-divider.module.css
?? components/v4/                      Hero.tsx + RosesDivider.tsx
?? public/images/v4-paper.webp         241KB greyscale paper texture
?? public/images/v4-roses-divider.webp 326KB roses garland
```

---

## UNFINISHED — read before touching the hero

The seven hero tiles were parked mid-session (James wanted empty space to work
in), then he asked for them back, then changed his mind and stopped the restore
partway. **The tree is half-restored:**

- `app/photography/hero.module.css` — **tile CSS IS restored.** `.stage`,
  `.tile`, `.tileMain`, `.tileA`–`.tileF` and the mobile block are all present.
- `components/v4/photography/Hero.tsx` — **markup is NOT restored.** No
  `SATELLITES` constant, no stage div. The component renders only the wordmark
  and eyebrow.

Net effect: **the CSS is dead code and the page looks unchanged.** No visual
bug, nothing broken — but it is inconsistent, so resolve it deliberately.

**To finish the restore:** copy the two blocks from `PARKED-hero-scatter.md`
§Component back into `Hero.tsx` — the `SATELLITES` constant above the component,
and the stage div into the returned JSX after the eyebrow. They are recorded
there verbatim; paste them rather than retyping.

**To re-park instead:** delete the scatter rules from `hero.module.css` again.
`PARKED-hero-scatter.md` still holds a verbatim copy either way — it is the
source of truth for the tile system and must not be deleted until this is
resolved.

**Also dead:** the restored mobile block in `hero.module.css` (~lines 222, 238)
styles `.quote`, which no longer exists. Harmless, but remove it whenever the
above is settled.

**Do not "correct" the tile coordinates.** Several are James's deliberate
departures from the reference — A/B pushed left, E/F pushed right, D at
`67.58%`, and the fixed centre column (main `30.67%`, C `19.5%`). He was
explicit about not moving those.

---

## What was built this session

### 1. Quote block — DELETED

The serif quote and its "film / digital" tag are gone, markup and CSS. He
confirmed both should go. Not recoverable by design; `PARKED-hero-scatter.md`
records the final margin values as history only.

### 2. Hero mobile — scatter scales instead of reflowing

The old mobile block abandoned the scatter below 768px for a 6-column stacked
grid, so mobile was a different layout. Now the same composition scales down as
a group (tiles are % of a fixed-aspect stage, so they follow automatically).
Only the non-scaling parts were retuned: tile label size, `0.5px` borders,
negative margins, plus `overflow-x: clip` on `.hero` to contain the A/F bleed.

Status: live in the CSS, but see UNFINISHED — no markup renders it.

### 3. Roses divider — `components/v4/photography/RosesDivider.tsx`

His artwork, between sections 01 and 02, full-bleed edge to edge.

- Source PNG 2400x1018, 2.9MB -> `public/images/v4-roses-divider.webp`, 326KB
- Cropped 77px off top / 85px off bottom — pure transparent bands that would
  otherwise push the garland off the seam
- `unoptimized` on the Image component is **deliberate**: Next's optimizer
  re-encodes to JPEG for clients not advertising webp, and JPEG has no alpha —
  that would put a solid box behind the garland. Do not remove this flag.
- Pull-up: `margin-top: clamp(-18rem, -30vw, -8.5rem)` — he iterated to this
  across five nudges. Do not round it off.
- Mobile (<=767px): enlarged to `width: 175%`, `215%` below 480px, centred via
  `left: 50%` + `translateX(-50%)`. **Note:** a negative-margin centring
  approach was tried first and pushed it off-centre — the margin resolves
  against the container, not the scaled image. Do not reintroduce that.

### 4. Page background — beige + paper texture

`app/photography/page.module.css`.

- Base colour `#ebe1cd` (iterated: `#fff` -> `#f2ece0` -> `#ebe1cd`)
- Texture: `public/images/v4-paper.webp` — Texturelabs_Paper_332L, centre-
  cropped square, 1600x1600, greyscale, 241KB
- **Two layers.** `.slate::before` is a continuous base over the whole sheet at
  `opacity: 0.3`. Per-section `.paper1`–`.paper4` add rotation/scale/flip
  variation at `opacity: 0.16` so the same source never reads twice — his
  requirement: *"enlarge it and rotate it throughout sections to make sure
  pattern randomization occurs."*
- **Why the base layer exists:** the roses divider is a sibling of the
  sections, so it carries no `.paper` layer. Without the continuous base it
  left an untextured band at the seam with a hard edge. Do not remove it.
- **The greyscale/beige trap:** multiplying a greyscale layer over beige
  desaturates it and the page reads grey. Fixed with
  `filter: sepia(1) saturate(1.6) hue-rotate(-12deg) brightness(1.06)` on both
  layers. If the warmth is ever wrong, the clean alternative is re-exporting
  the texture in colour (~+200KB) and dropping the filter.

An earlier pure-SVG `feTurbulence` version was built and rejected — he could
not see it. Creases are photographic; turbulence gives grain but not folds.
Do not retry that approach.

---

## Open question he was mid-way through

He asked about **mixed-typeface editorial lockups** and what to search for to
find elegant fonts. Answered:

- His first reference (Modern Imagery / Timeless Moments): serif + **English
  roundhand / Spencerian script**, "quiet luxury" / modern editorial.
- His second (FLAMENCO): **high-contrast Didone with swashes** (Playfair,
  Butler, Prata, Canela, Ogg), oversized wordmark with **subject-through-type**
  masking.

He then asked: *"can you try to achieve such a look, like mixed typeface but
with the didone and some other font thatll work good, also what do i search for
to get such elegant fonts."*

**This was NOT delivered** — he interrupted to ask for the tiles back, then
ended the session. Pick it up only if he raises it again.

Groundwork done: `app/layout.tsx` already uses `next/font/google`
(Cormorant_Garamond) and `next/font/local` (Nohemi, `public/fonts/`), so adding
faces is straightforward. **Verify any font name against the installed Next
version before referencing it** — a check for available Google font names was
inconclusive when the session ended, so confirm rather than assume.

---

## Isolation — how v4 stays off the live site

`components/SiteChrome.tsx` sets `html[data-bare="true"]` for `BARE_ROUTES`
(`["/", "/photography"]`), killing nav, cursor and film grain. `app/v4.css` —
every rule scoped to that flag — neutralises the v3 base layer.

**No shared v3 component has been edited.** `SiteNav.tsx` and `Cursor.tsx` are
untouched.

### Hard constraints

- `lib/cms` data contract is untouchable
- `/manage` + `app/api/admin/**` off limits
- `proxy.ts` gates ONLY `/manage` + `/api/admin`
- Lenis stays GSAP-ticker driven (`autoRaf: false`)
- `BUSINESS.legalName` keeps its `&`
- Never invent APIs or paths — verify against `node_modules`
- Meaningful viewport differences -> `components/desktop/X.tsx` +
  `components/mobile/X.tsx`

### Mobile — mandatory

Built simultaneously with desktop, never retrofitted. `app/v4.css` §2: one
mobile-first breakpoint set (480/768/1024/1440), no horizontal scroll, 44px
touch targets under `(pointer: coarse)`, `100svh` over bare `100vh`,
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

**All this session's work is uncommitted.** A `git checkout` of these files
loses it. Confirm with James before any destructive git operation.

---

## Routes

| Route | State |
|---|---|
| `/photography` | v4 in progress — hero (wordmark + eyebrow), roses divider, paper bg; sections 02-04 empty |
| `/` | v4 clean slate, 4 empty sections |
| `/events`, `/about`, `/manage` | untouched v3 |

---

## Open

- **Fonts and palette** — still unspecified beyond the `#ebe1cd` ground.
  Wireframe type is Georgia/system fallback on purpose. The Didone/script
  direction above is the live thread.
- **Sections 02-04 of `/photography`** — empty, numbered markers only.
- **Torn-paper section transitions** — he asked about these last session and
  has not returned to it. Not started.
- **The connection** between `/photography` and `/events`, and what the home
  page becomes. Deferred until both pages exist.
- **`/` is four empty sections** — must not reach production that way.
- **Data re-wiring** — gallery/reels/reviews return through
  `lib/cms/getPage.ts` / `getContent.ts` once the design places them.
- **Lenis on v4 routes** — still active. Ask before gating.
- **LAUNCH-BLOCKING, unrelated to v4:** production still serves Clerk
  `pk_test` keys. Needs `pk_live`/`sk_live` in Vercel.
