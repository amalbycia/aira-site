# Aira Photography & Events

Wedding photography + event management portfolio. Built with Next.js 16, Sanity 6, GSAP 3, 
Lenis, and Bunny.net for media hosting.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Fill in all values — see sections below for where to find each one

# 3. Start the dev server
npm run dev
# → http://localhost:3000        (site)
# → http://localhost:3000/studio (Sanity Studio)
```

---

## Environment Variables

All required variables are listed in `.env.local.example`. Copy it to `.env.local` and fill in 
each value. The sections below explain where to find them.

---

## Sanity Setup

Sanity is the CMS — the client uses it to manage all content (gallery, reels, reviews, settings).

### 1. Create a Sanity project
1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Click **Create new project**
3. Note the **Project ID** — add it to `.env.local` as `NEXT_PUBLIC_SANITY_PROJECT_ID`
4. The default dataset is `production` — matches the `NEXT_PUBLIC_SANITY_DATASET` default

### 2. Create an API token (for server-side writes)
1. In your project → **API** → **Tokens** → **Add token**
2. Give it the **Editor** role minimum
3. Add the token to `.env.local` as `SANITY_API_TOKEN`

### 3. First run
```bash
npm run dev
# Visit http://localhost:3000/studio
# Create one "Site Settings" document
# Create one "Page" document for Photography and one for Events
```

### 4. Deploy Sanity Studio (optional)
The Studio is already embedded in the app at `/studio`. You can also deploy it standalone:
```bash
npx sanity deploy
```
This gives the client a permanent `your-project.sanity.studio` URL independent of Vercel.

### Responsively App (recommended during development)
[Responsively App](https://responsively.app/) lets you preview the site on multiple screen sizes 
simultaneously in one window. Invaluable for the mobile/desktop isolation pattern used in this 
project — you can verify desktop and mobile layouts side by side as you build.

---

## Bunny.net Setup

Bunny.net handles all video and CDN asset delivery. You need three Bunny products:

### Bunny Storage — for static assets (images, files)
1. Log in at [dash.bunny.net](https://dash.bunny.net)
2. Go to **Storage** → **Add Storage Zone**
3. Note the **Storage Zone Name** → `BUNNY_STORAGE_ZONE`
4. Go to the zone → **FTP & API Access** → copy the **API Key** → `BUNNY_STORAGE_API_KEY`

### Bunny CDN — pull zone over your Storage zone
1. Go to **CDN** → **Add Pull Zone**
2. Point it to your Storage zone as the origin
3. Note the auto-generated CDN hostname (e.g. `your-zone.b-cdn.net`)
4. Add as `NEXT_PUBLIC_BUNNY_CDN_URL=https://your-zone.b-cdn.net`

### Bunny Stream — for video hosting
1. Go to **Stream** → **Add Library**
2. Note the **Library ID** → `BUNNY_STREAM_LIBRARY_ID`
3. Go to the library → **API** → copy the **API Key** → `BUNNY_STREAM_API_KEY`
4. Upload videos via the Bunny dashboard
5. Copy the **Video ID** from each uploaded video and paste it into the Sanity Studio reel field

---

## Vercel Deployment

1. Push the project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo
3. In **Environment Variables**, add every variable from `.env.local`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`
   - `BUNNY_STORAGE_ZONE`
   - `BUNNY_STORAGE_API_KEY`
   - `BUNNY_STREAM_LIBRARY_ID`
   - `BUNNY_STREAM_API_KEY`
   - `NEXT_PUBLIC_BUNNY_CDN_URL`
4. Deploy. Vercel auto-deploys on every push to `main`.
5. After deploy, add your production URL to the Sanity project's **CORS origins**:
   sanity.io/manage → API → CORS Origins → Add origin

---

## GSAP matchMedia — Mobile/Desktop Isolation Pattern

All GSAP animations use the `createMatchMedia()` helper from `lib/gsap.ts`. The rule:

- Desktop animations live exclusively inside `mm.add("isDesktop", () => { ... })`
- Mobile animations live exclusively inside `mm.add("isMobile", () => { ... })`
- The two blocks never share targets or logic — editing one cannot break the other
- Always call `mm.revert()` in the `useGSAP` cleanup

```tsx
import { useGSAP } from "@gsap/react";
import { createMatchMedia, gsap } from "@/lib/gsap";

export function HeroSection() {
  useGSAP(() => {
    const mm = createMatchMedia();

    mm.add("isDesktop", () => {
      gsap.from(".hero-title", { x: -100, opacity: 0, duration: 1 });
    });

    mm.add("isMobile", () => {
      gsap.from(".hero-title", { y: 40, opacity: 0, duration: 0.6 });
    });

    return () => mm.revert();
  });
}
```

---

## Useful Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
```
