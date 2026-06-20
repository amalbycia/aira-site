# Client: Aira Photography & Events — Requirements

## Company Background (client-provided, verbatim)

Founded in 2018 by Amal Sebastian Kalarickal, Aira Photography & Agnitantra Events &
Caters has established itself as a premier, all-inclusive event management solution.
The company seamlessly integrates creative artistry with logistical expertise to bring
diverse celebrations to life. At its core, the firm delivers exceptional visual
storytelling through high-quality photography, videography, and comprehensive event
shoot coverage. Beyond capturing memories, they transform venues with striking stage
decorations and organize flawless stage programs, ensuring that every event has a
captivating and professional presence.

Driven by a commitment to full-service excellence, the company handles every intricate
detail of event organization to provide a stress-free experience for its clients. Their
extensive portfolio features top-tier catering services that elevate the culinary
experience, alongside premium car rentals for elegant arrivals. To ensure seamless
execution and high entertainment value, they provide state-of-the-art light and sound
systems, professional makeup artistry, and talented dancers. By managing everything
from technical production to live entertainment, Amal Sebastian Kalarickal's venture
stands as a trusted partner for creating sophisticated, memorable, and meticulously
coordinated events.

**Key facts to use across copy:**
- Founded: 2018
- Founder: Amal Sebastian Kalarickal
- Full service scope: photography, videography, event shoot coverage, stage decoration,
  stage programs, catering, car rentals, light & sound systems, makeup artistry, dancers

---

## Raw Requirements (verbatim)

- Gallery to be added (photos)
- Google reviews shown live on site
- Videos, photos, and reels on both pages
- Aira Photography and Aira Events & Catering are two separate pages
- Simple, non-complicated nav — single scroll covers about + footer
- Admin console (Sanity Studio) for client to manage content
- Hero section: two buttons with arrows, leading to Photography page and Events page respectively
- Location: written text only, no map embed
- Business has 9+ years of experience — feature this

---

## Organized Requirements

### Pages
| Page | URL | Purpose |
|---|---|---|
| Home | `/` | Hero with two CTA buttons, about section, footer — single-page scroll |
| Photography | `/photography` | Aira Photography sub-brand — gallery, reels, location, reviews |
| Events | `/events` | Aira Events & Catering sub-brand — gallery, reels, location, reviews |
| Studio | `/studio` | Sanity CMS — client manages all content here |

### Navigation
- Single nav across all pages
- Home is a single-scroll page (no separate About or Contact routes)
- No hamburger-heavy or cluttered nav — keep it clean and minimal

### Home — Hero
- Two CTA buttons with arrow icons
- Button 1 → `/photography` (Aira Photography)
- Button 2 → `/events` (Aira Events & Catering)

### Home — About
- Feature: **9+ years of experience**
- Included in the home scroll, not a separate page

### Photography Page (`/photography`)
- Photo gallery
- Videos / reels
- Location text (written, no map)
- Google Reviews (live embed preferred; manual entries as fallback)

### Events Page (`/events`)
- Photo gallery
- Videos / reels
- Location text (written, no map)
- Google Reviews (live embed preferred; manual entries as fallback)

### CMS (Sanity Studio at `/studio`)
- Client manages: gallery images, reels, reviews, location text, site settings
- Fields and labels written in plain, non-technical English

### Media / Video
- Videos hosted on Bunny Stream (not YouTube)
- Photos served from Bunny Storage CDN or Sanity CDN
- Both sub-brands have their own gallery and reel collections

### Branding
- Two sub-brands under one business:
  - **Aira Photography** — wedding + portrait photography
  - **Aira Events & Catering** — event management and catering
- Both share the same nav and footer
- Each has its own dedicated page with its own content

### Out of Scope (not requested)
- Map embeds (location is text-only)
- Separate About page
- Separate Contact page
- Blog
- Booking/enquiry form (not mentioned — confirm with client if needed)
