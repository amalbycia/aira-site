# Handover Checklist — Aira Photography & Agnitantra Events

Status as of this session. Live at **https://aira-site-rose.vercel.app**
(deploys automatically on every push to `master` → GitHub `amalbycia/aira-site` → Vercel).

Legend: ✅ done · 🟡 needs a value/decision from you · ⬜ recommended, not yet done

---

## 1. Launch-blocking (do before telling the client "it's live")

| | Item | Notes |
|---|---|---|
| 🟡 | **Real contact email + phone** | Placeholders `hello@agnitantra.com` / `+91 00000 00000` are in [`components/SiteFooter.tsx`](components/SiteFooter.tsx) (`CONTACT_EMAIL`, `CONTACT_PHONE`). Give me the real ones. |
| 🟡 | **Custom domain** | No real domain is connected — the site runs on `aira-site-rose.vercel.app`. If the client wants e.g. `agnitantra.com`, buy it and I'll wire it in Vercel + set `NEXT_PUBLIC_SITE_URL` (sitemap/OG/canonical all update automatically). |
| 🟡 | **Real photos & reels loaded** | The Photography/Events galleries and reels fall back to placeholder images until the owner uploads real ones in `/manage`. Confirm real media is in before launch. |
| ✅ | Production build is clean | `next build` passes, deploy is ● Ready. |
| ✅ | Search engines can index it | `robots.txt` allows crawling of public pages, blocks `/manage` + `/api`. |
| ✅ | `sitemap.xml` present & valid | Auto-generated from the 3 public routes. |
| ✅ | Admin is secured | `/manage` behind login; all admin APIs `requireAdmin`-guarded; rate-limited login; noindex. |

## 2. SEO & discoverability

| | Item | Notes |
|---|---|---|
| ✅ | Root + per-page metadata | Title/description/keywords, OpenGraph, Twitter card, canonical, `metadataBase`. |
| ✅ | Logical headings, one H1/page | Each page has a single hero H1. |
| ✅ | Branded 404 page | `app/not-found.tsx`. |
| ⬜ | **OG share image** | No custom social-share image yet — links shared to WhatsApp/Instagram will show text only. A 1200×630 branded image is a nice-to-have (I can generate one if you give me a hero photo). |
| ⬜ | **Google Business Profile / Search Console** | Client-side task: verify the domain in Search Console and submit the sitemap once a real domain exists. |
| ⬜ | **Analytics** | No analytics installed. Recommend Vercel Analytics (1-click) or GA4. Say the word and I'll add it. |

## 3. Accessibility & UX

| | Item | Notes |
|---|---|---|
| ✅ | Alt text on gallery images | Falls back to sensible defaults; owner can set real alt per photo in admin. |
| ✅ | Reduced-motion respected | All GSAP animations guard `prefers-reduced-motion`. |
| ✅ | Pill buttons, contrast checked | Menu/footer contrast verified in screenshots. |
| ✅ | Touch targets ≥44px | Menu tabs and admin controls meet the minimum. |
| ⬜ | Full keyboard-path + screen-reader audit | Recommended before a formal WCAG-AA sign-off if the client needs it. |

## 4. Mobile (verified this session)

| | Item | Notes |
|---|---|---|
| ✅ | Footer location map flush at 320 / 375 / desktop | Measured 1px gaps (border only) on all edges; card doesn't stretch. |
| ✅ | Catering menu responsive | Single-column dishes on phone, 16px text floor. |

## 5. Performance

| | Item | Notes |
|---|---|---|
| ✅ | Images compressed on upload | Browser-side WebP resize before Bunny Storage. |
| ✅ | Video via Bunny Stream | Never inline-hosted. |
| ⬜ | Lighthouse pass on the live domain | Worth running once real media + domain are in (Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1). |

---

## What the owner can now edit in `/manage`

- **Photos** — Photography & Events galleries (upload, reorder, alt/caption, delete)
- **Reels & Videos** — Bunny Stream reels per page
- **Reviews** — testimonials (per page or both)
- **Events Menu** *(new)* — catering categories + dishes: add / rename / delete / reorder both levels. Shows live on the Events page.
- **Users** — up to 4 admin accounts

Intentionally **not** editable (hardcoded by design): socials, contact, location text, About copy.

---

## Placeholders / info I still need from you

Fill these and I'll drop them in:

1. **Contact email:** `______________________`
2. **Contact phone:** `______________________`
3. **Custom domain (if any):** `______________________`
4. **Business hours** (footer currently says "By appointment · Mon–Sat"): `______________________`
5. **Real hero / share image** for the OG social preview (optional): `______________________`
6. Confirm the **Google Maps location** in the footer is the correct business address.

---

## Suggestions (optional, not done — your call)

- **Analytics** (Vercel Analytics — 1 click, privacy-friendly) so the client can see traffic.
- **A contact/enquiry form** — right now "Enquire" links to the Events page. A real form (name/date/event type → email or WhatsApp) converts better; couples increasingly expect it.
- **OG share image** — matters a lot when links get shared on WhatsApp/Instagram.
- **A short "About the team" section with a real founder photo** — trust signal that converts wedding enquiries (per 2026 wedding-site best practice).
- **Testimonials with real Google rating link** — the marquee already supports it; point it at the real Google Business listing.
- **Blog / recent work** — helps SEO for "wedding photographer Kerala" type searches. Bigger lift; flag if you want it.
