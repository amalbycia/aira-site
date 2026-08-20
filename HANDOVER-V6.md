# HANDOVER — Aira v4 redesign (`/photography` build-out)

Paste this at the start of the next session.

---

## Start here

1. **`V4-REDESIGN.md`** — v4 approach, working rules, isolation, revert net.
2. **`SITE-MASTER.md`** — the v3 live site: business facts, infra, DB, data
   contract, non-negotiables.
3. **`OKAYRAWDOG.md`** — James's raw scratchpad. **Read-only.** Never act on it
   unless he says so.

Repo: `C:\dev\aira-site` — NOT the OneDrive copy.
Stale, ignore: `TODO.md`, `PROJECT-CONTEXT.md`, `SITE-JOURNEY.md`,
`HANDOVER-V4.md`, `HANDOVER-V5.md` (both superseded by this file).

---

## How James works — non-negotiable

- **He designs everything. Claude implements, exactly.** Nothing invented
  unprompted — no components, styling, content or "improvements".
- **Do only what he asks.** Do not touch adjacent things. If a change he asks
  for will visibly move something he did NOT ask about, say so first.
- **Do not over-deliver.** *"no need to do more than i asked for, ill lyk if i
  want it rn."*
- **When he says "a bit more", just do it.** *"just listen to me lol"* /
  *"dont tell me what ill notice, ill tell u, u do it, thats enough."*
  Adjust the value, state the new value, stop.
- **HE does the visual verification, not Claude.** He said this directly this
  session: *"i told you ill verify."* Do NOT run Playwright screenshot loops
  to check design work. Type-check, lint, confirm it compiles, then hand it to
  him. (Headless DOM checks to diagnose a *bug* he reported are still fine —
  but not as a habit, and never for "does this look right".)
- **Never auto-commit.** Only commit when he explicitly asks. Never push,
  never deploy.
- **Be brief.** Short answers, no essays, no unsolicited option menus.
- **Address him by name.**
- **Measure, don't eyeball.** Pull real CSS from reference sites.

---

## Where things stand

Branch `redesign-v4`, HEAD **`c2f1454`** — unchanged this session.
**Everything below is uncommitted.** He knows; he wanted a revert point before
experimenting.

Revert everything from this session:

```sh
git reset --hard c2f1454 && git clean -fd components/v4 app/photography public/images public/fonts
```

Dev server was running on `localhost:3000` throughout.

### Working tree

```
 M app/layout.tsx                          Calypso font registered
 M app/v4.css                              palette tokens, preload gate, underline plumbing
 M app/photography/page.tsx                all sections wired, preload gate script
 M app/photography/page.module.css         markers removed, scroll-margin
 M app/photography/hero.module.css         nav, draw-underline hooks
 M app/photography/roses-divider.module.css  mobile pull-up retuned
 M components/v4/photography/Hero.tsx      nav + intro hooks
 M components/v4/photography/Filmstrip.tsx data-hero-tile
 M components/v4/photography/RosesDivider.tsx  priority added
?? components/v4/photography/About.tsx         section 02
?? components/v4/photography/Works.tsx         section 03
?? components/v4/photography/Reviews.tsx       section 04
?? components/v4/photography/Footer.tsx        contact footer
?? components/v4/photography/FooterRoses.tsx   garland above footer
?? components/v4/photography/PetalField.tsx    falling petals (wraps 02+03)
?? components/v4/photography/PhotoMotion.tsx   ALL motion — preloader/reveals/parallax/petals
?? components/v4/photography/DrawUnderline.tsx Osmo hover underline
?? app/photography/{about,works,reviews,footer,footer-roses,petals,preloader}.module.css
?? public/fonts/Calypso/Calypso.ttf
?? public/images/v4-petal-{1,2,3}.webp         background-removed cutouts
?? public/images/v4-roses-footer.webp          garland above footer
```

---

## The page, top to bottom

`/photography` is now a complete page: **hero → roses → about → works →
reviews → garland → footer.**

### Preloader (`PhotoMotion.tsx` + `preloader.module.css`)

Maroon sheet: bracketed eyebrow, script wordmark that **writes in** via a
left-to-right clip wipe, and a Calypso counter running **000→100** in the
lower-right like a folio number. Then the sheet lifts and the hero rises in —
masthead first, then the filmstrip tiles staggered.

**The preload gate** (his requirement: the page must not peek through):
- An inline script in `page.tsx` sets `html[data-loading="true"]` **before
  first paint** — not on hydration, which would leave a visible gap.
- `app/v4.css` uses that flag to hide `<main>` and lock scroll (plus
  `touch-action: none`, since iOS ignores `overflow:hidden` on `html`).
- `PhotoMotion` clears it in the lift tween's `onStart`, and also releases
  Lenis (which runs its own scroll and ignores the CSS lock).
- **A 6s failsafe timer in the inline script also clears it.** Do not remove
  this — without it a JS error would leave the page permanently blank.
- Reduced motion skips the gate entirely, at every layer.

Runs on **every load**. If once-per-visit is wanted, gate on `sessionStorage`.

### Section 01 — hero (his design, do not redesign)

Pinyon Script wordmark top-centre, crimson `#9e1b32`, full-bleed filmstrip of
seven scattered tiles. **Nav added this session:** about / works on the left,
contact on the right, absolutely positioned so the wordmark did not move a
pixel; on phone it drops to a centred row below.

### Section 02 — About Us

Bracket-numbered Calypso heading, bracketed subline, three paragraphs that
**stagger deeper** (0 / 14% / 30%), and a two-image editorial stack with tiny
numbered italic captions.

### Section 03 — Selected Works

Five captioned frames on a 12-column grid, each with its own span, aspect and
vertical push. Heading steps in from the left so sections do not all open from
the same edge. On phone it becomes an alternating two-track scrapbook.
"view the full gallery →" is a **`<button>` with no destination** — ask him
where it goes.

### Section 04 — Kind Words

The **real Google aggregate leads the section**, per his request: a huge
Calypso `4.9`, a star row, and `from 148 google reviews` between hairlines —
all from `lib/site.ts`, never retyped. Then one oversized pull-quote with a
hanging crimson quotation mark, two staggered smaller quotes, and a bordered
**view on google** link to the real listing.

**Quote text is placeholder copy.** Real reviews come from the DB via
`lib/cms/getContent.ts`.

### Footer

Deep maroon band. Eyebrow → script wordmark → italic tagline → CTA row →
hairline → four columns → legal line. **WhatsApp is deliberately the loudest
element** (solid cream fill, larger, more padding; the others are outlined) —
he asked for that explicitly. Socials are 44px circular buttons. All NAP from
`lib/site.ts`; `legalName` keeps its `&`.

---

## Motion — all of it lives in `PhotoMotion.tsx`

One client component, four jobs. **Read its header comment before editing.**

1. **Preloader + hero intro** (above).
2. **Scroll reveals** — `[data-reveal]` rises in once on entry.
3. **Parallax** — `[data-parallax="<px>"]` drifts ±px across the viewport.
4. **Petals** — `[data-petal]` sways and falls.

### ⚠️ Reveals use IntersectionObserver, NOT ScrollTrigger — deliberately

This bit him hard. The reveals originally used ScrollTrigger; its triggers
silently never fired under this page's Lenis setup, so **About, Works, Reviews
and the footer content were all invisible** — he reported the sections looked
empty. Rebuilt on IntersectionObserver, which fires off the compositor and
cannot mis-measure. Parallax was moved off ScrollTrigger for the same reason
and now reads live `getBoundingClientRect` on the shared GSAP ticker.

**Do not "modernise" these back to ScrollTrigger.**

### Petals (`PetalField.tsx` + `petals.module.css`)

Nine petals from three background-removed cutouts of his stock images (cut
with sharp: luminance→alpha keying, soft edge ramp, trimmed).

- **The field wraps sections 02 AND 03 together** so a petal falls
  continuously across the boundary instead of being clipped at it. This is
  why they are not a child of `About`.
- Idle: each rocks on a slow yoyo loop. `sway` is the **half-range** (rocks
  that many degrees either side of rest). Currently 11–19°.
- Scroll: each falls downward, `fall` being a fraction of the **field's**
  height, so the distance scales with content instead of being a fixed px.
- **Rotation lives in JS, never CSS.** GSAP writes one combined transform
  (rotation + y + scaleX); a CSS `rotate()` on the same element is silently
  overwritten. Base angle comes from `data-petal-rot`.
- Reuse is hidden by mirroring (`data-petal-flip`) plus per-instance size,
  angle, opacity and duration. **Durations are all different on purpose** —
  equal ones fall into visible lockstep.
- Placement is **hand-authored, not randomised**: a runtime random scatter
  differs between server and client and throws a hydration error, and it
  would drop petals on top of the copy.

### Draw-random-underline (`DrawUnderline.tsx`)

Osmo's technique, ported faithfully from
`osmo.supply/demo/draw-random-underline` — the six hand-drawn squiggle paths
are verbatim from the demo. DrawSVGPlugin is free from GSAP 3.13; 3.15 is
installed locally, no CDN. Applied to every nav link, button and footer link.

**⚠️ Geometry trap:** the paths span the full height of their `310×40`
viewBox and the SVG stretches to fill its box, so **the box must sit entirely
below the text**. A positive `--draw-bottom` that overlaps the line box draws
the squiggle *through* the letters — which is exactly the bug he reported
("the underline is over the button"). Negative values move it down. The
constraint is written into `app/v4.css` next to the rule.

---

## Type

| Token | Face | Used for |
|---|---|---|
| `--font-script-v4` | Pinyon Script | hero + footer wordmark, preloader |
| `--font-display-v4` | **Calypso** (his file, self-hosted TTF) | section headings, rating figure, counter |
| `--font-serif-v4` | Playfair Display | body, captions, buttons, nav |

Palette tokens in `app/v4.css` §3: `--ink-v4 #33261c`, `--crimson-v4 #9e1b32`,
`--maroon-v4 #4f0f1c`, sheet `#ebe1cd`.

**Specificity trap:** `app/v4.css` §1 resets `h1–h4` to `font-family: inherit`
under `html[data-bare="true"]`, and that selector outranks a single class.
Every heading class is therefore **doubled** (`.heading.heading`) to win
without `!important`. Keep doing that for new headings.

---

## Images — loading strategy

| Asset | Size | Strategy |
|---|---|---|
| `v4-paper.webp` | 247KB | `<link rel="preload">` — it is a CSS background, discovered late otherwise, and would flash flat beige on reveal |
| `v4-roses-divider.webp` | 327KB | `priority` — first artwork seen when the sheet lifts; the preloader gives it ~3s of covered time |
| `v4-roses-footer.webp` | 279KB | `loading="lazy"` — bottom of a long page |
| `v4-petal-*.webp` | 17–30KB | `loading="lazy"` — decorative, below fold |

**`unoptimized` on every garland and petal is deliberate.** Next's optimizer
re-encodes to JPEG for clients that do not advertise webp, and JPEG has no
alpha — that puts a solid box behind the artwork. Do not remove it.

### Footer garland vs. hero divider — different on purpose

The hero divider is **pulled up** onto section 01 with a negative margin. The
footer garland is **in normal flow** and takes its own height, with only a
`-1px` overlap onto the maroon to hide the sub-pixel seam. He asked
specifically that it not cover the footer, and the footer holds the phone
number and email — so **do not give it a negative pull-down.**

Mobile: both widen past the viewport (165%/200%) to keep the roses readable,
centred with `left: 50% + translateX(-50%)`. **Not a negative margin** — that
resolves against the container, not the scaled image, and pushes it
off-centre. He hit this bug once already: *"no it moved to the left lmfao."*

---

## Rejected / do not retry

- **Torn-paper section edges.** Built with inline SVG (deckle line + cast
  shadow, plus a torn top on the footer), then he cut them: *"no need of
  those tears."* Removed entirely.
- **WebGL film-grain shader.** Built (animated grain + vignette + projector
  flicker, multiply-blended). He cut it: *"remove that weird filter on the
  brwoser just leave it plain no shader needed."* Deleted.
- **SVG `feTurbulence` paper texture** — from an earlier session; he could
  not see it. Creases are photographic; turbulence gives grain, not folds.
- **Two-row mobile filmstrip** — explicitly rejected in an earlier session.

---

## Isolation — how v4 stays off the live site

`components/SiteChrome.tsx` sets `html[data-bare="true"]` for `BARE_ROUTES`
(`["/", "/photography"]`), killing nav, cursor and film grain. `app/v4.css` —
every rule scoped to that flag — neutralises the v3 base layer.

**No shared v3 component has been edited.** `SiteNav.tsx` and `Cursor.tsx` are
untouched. `app/layout.tsx` was edited only to register the Calypso font
alongside the existing faces.

### Hard constraints

- `lib/cms` data contract is untouchable
- `/manage` + `app/api/admin/**` off limits
- `proxy.ts` gates ONLY `/manage` + `/api/admin`
- Lenis stays GSAP-ticker driven (`autoRaf: false`)
- `BUSINESS.legalName` keeps its `&`
- Never invent APIs or paths — verify against `node_modules`

### Mobile — mandatory

Built simultaneously with desktop, never retrofitted. `app/v4.css` §2: one
mobile-first breakpoint set (480/768/1024/1440), no horizontal scroll, 44px
touch targets under `(pointer: coarse)`, `100svh` over bare `100vh`,
reduced-motion respected. Every section written this session ships its own
`max-width: 767px` block.

---

## Revert net

```sh
git reset --hard c2f1454                                    # undo this session
git checkout v3-maroon-cinema -- app/photography/page.tsx   # v3 photography back
git checkout master                                         # live v3 site
```

Tags `v1-pre-redesign`, `v2-redesign-wip`, `v3-maroon-cinema` exist locally
and on the remote. `redesign-v4` is on GitHub but **behind** local — v4 work
is deliberately unpushed. master is untouched, so production is unaffected.

---

## Open

- **`/photography` gallery destination** — the works button and the data
  re-wiring (`lib/cms/getPage.ts` / `getContent.ts`) for real photos, reels
  and reviews. Currently grey placeholder boxes and placeholder quote copy.
- **Real photography** — every image frame is a wireframe box.
- **`/` is four empty sections** — must not reach production that way.
- **`/events`** — untouched v3. The connection between the two pages is still
  undecided.
- **Lenis on v4 routes** — active. Ask before gating.
- **LAUNCH-BLOCKING, unrelated to v4:** production still serves Clerk
  `pk_test` keys. Needs `pk_live`/`sk_live` in Vercel.
