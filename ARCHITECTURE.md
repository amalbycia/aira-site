# Architecture — Aira / Agnitantra Site & Admin

How the content system and admin console are built, end to end. Read this before
touching auth, the data layer, or the admin. Companion to [CLAUDE.md](./CLAUDE.md)
(conventions) and [MAP.md](./MAP.md) (per-file reasoning for the public site).

> **Project location:** `C:\dev\aira-site` (moved off the old OneDrive path on
> 2026-06-30 to escape a space-in-path + sync-locking that caused random build
> errors). Node v24, Next 16.2.9, React 19.2.4, Turbopack.

---

## 1. The big picture

There is **no third-party CMS** (the site was migrated off Sanity on 2026-06-30;
a Payload attempt was abandoned first). Content is owned by three pieces of
self-hosted infrastructure, and the owner edits it through a custom admin:

```
                          ┌─────────────────────────┐
   Public pages  ◀────────│  Neon Postgres           │  ← text content + records
   (Server Comps)         │  pages / gallery_photos  │
        ▲                 │  reels / reviews /        │
        │ lib/cms read    │  site_settings            │
        │                 └─────────────────────────┘
        │                          ▲  writes
        │                          │  (lib/cms/admin.ts)
        │                 ┌─────────────────────────┐
   /manage admin ────────▶│  app/api/admin/* routes  │
   (React client)         │  (each requireAdmin())   │
        │                 └─────────────────────────┘
        │  uploads
        ├──────────────▶  Bunny Storage  (images → agnitantra-images.b-cdn.net)
        └──────────────▶  Bunny Stream   (videos → vz-d8b3817b-78d.b-cdn.net)
```

- **Neon Postgres** holds only text/records (a few KB). Images and videos never
  touch the DB — they live on Bunny and the DB stores their URLs.
- **Bunny Storage** (zone `agnitantra-images`, id 1621240) serves gallery and
  cover images publicly via its pull zone.
- **Bunny Stream** (library 691820) transcodes and serves reel videos (HLS +
  MP4 fallback).

---

## 2. Data store (Neon Postgres)

- Client: `lib/db.ts` exports `sql` — the `@neondatabase/serverless` HTTP driver
  as a tagged template. `sql\`select … where x = ${value}\`` parameterizes
  `${value}` safely (no SQL injection). `hasDb()` reports whether `DATABASE_URI`
  is set.
- Schema: `lib/schema.sql` (reference; the tables already exist in Neon).

| Table | Purpose | Key columns |
|---|---|---|
| `pages` | per-brand page text | `slug` (photography\|events), `description`, `location_text` |
| `gallery_photos` | gallery images | `page`, `url`, `storage_path`, `alt`, `caption`, `sort_order` |
| `reels` | reel records (video on Bunny) | `page` (photography\|events\|both), `bunny_video_id`, `title`, `thumbnail_url`, `sort_order` |
| `reviews` | testimonials | `page`, `reviewer_name`, `rating` (1–5), `review_text`, `review_date`, `sort_order` |
| `site_settings` | singleton (id=1) | business/contact/social/location fields |

Ordering everywhere is `sort_order asc` (reviews fall back to `review_date desc`).
`gallery_photos.storage_path` is kept so deletes can also remove the Bunny file.

---

## 3. Data layer (the contract that kept the site unchanged)

`lib/cms/` exposes the **same function signatures the old Sanity helpers had**,
which is why migrating only changed import paths in the 4 page files — no display
component changed.

- `getPage(brand)` → `{ description, locationText, gallery[], reels[] }`. Maps DB
  rows to the display shapes (`GalleryPhoto`, `ReelItem`), resolving reel video +
  poster URLs through `lib/bunny.ts`.
- `getReviews(brand)` → `ReviewItem[]` (brand or "both", newest first).
- `getSiteSettings()` → `SiteSettings`; `footerPropsFromSettings(s, brand)` builds
  `SiteFooter` props.

**Fail-soft contract:** every public read returns `[]` / `{}` on DB error (and
logs). The site must never hard-crash because Neon is briefly asleep/unreachable.
Pages also keep their hardcoded placeholder fallbacks. **Preserve this.**

`lib/cms/admin.ts` is the admin-side data access (raw rows with ids, both
brands, plus mutations). **Never import it into a public page** — it has no
fail-soft wrapping and exposes more than the public needs.

---

## 4. The admin console (`/manage`)

### Routing & layout
- `app/manage/page.tsx` is a Server Component. It checks `isAuthenticated()`; if
  not logged in it renders `LoginForm`, otherwise it loads all content
  server-side and renders `Dashboard` (client) pre-populated.
- `app/manage/layout.tsx` wraps it in `.admin-root` and pulls in `admin.css`.
- The site chrome bails on `/manage`: `LenisProvider`, `SideNav`, and
  `PageTransition` each early-return when `pathname.startsWith("/manage")`, so the
  admin gets plain native scrolling and none of the site's nav/overlay.

### Tabs (`app/manage/tabs/`)
- **PhotosTab** — per-brand grid. Upload is drag-drop or click; each file is
  compressed in the browser (`compressImage.ts`: canvas resize to 1600px long
  edge → WebP q0.82) **before** upload, then POSTed one at a time. Delete (with
  confirm) and drag-to-reorder (persists via `/photos/reorder`).
- **ReelsTab** — title + page scope, then video upload via XHR to
  `/api/upload-reel` (→ Bunny guid), then records the reel. Thumbnail comes from
  Bunny's auto-generated `/thumbnail.jpg`.
- **ReviewsTab** — full CRUD in a modal (name, rating, text, date, page scope).
- **SettingsTab** — flat form over `site_settings`.

### Why browser-side compression matters
Vercel caps a serverless request body at **4.5 MB**. Camera originals are
10–50 MB. Compressing to ~300–600 KB in the browser keeps uploads under that
limit *and* makes them fast. The gallery frame only displays ~430px wide, so
there's no visible quality loss. (The initial 40-photo import was optimized
server-side with `sharp` because it ran locally, not on Vercel.)

---

## 5. Authentication (current — see security notes)

Single shared password, no user table:

- `lib/auth/session.ts` — `passwordMatches()` compares against `ADMIN_PASSWORD`
  (constant-time). On success, `createSession()` sets an httpOnly cookie whose
  value is `<expiryMs>.<HMAC-SHA256(payload, ADMIN_SESSION_SECRET)>`.
  `isAuthenticated()` re-computes the HMAC and checks expiry (30 days).
- `lib/auth/guard.ts` — `requireAdmin()` returns a 401 `NextResponse` or null;
  every `app/api/admin/*` route calls it first.
- `app/api/admin/login` / `logout` set/clear the cookie.

This is deliberately minimal (one owner, content-only admin). **It is NOT
hardened** — see [HANDOVER-NEXT.md](./HANDOVER-NEXT.md) for the known gaps
(unauthed `/api/upload-reel`, no login rate-limit, no upload validation) and the
plan to add Google login.

---

## 6. Bunny helpers (`lib/bunny.ts`)

- **Stream (video):** `getBunnyEmbedUrl`, `getBunnyHlsUrl`, `getBunnyMp4Url`,
  `getBunnyThumbnailUrl`, `getBunnyPreviewUrl`, `deleteFromBunnyStream`.
- **Storage (images):** `getBunnyStorageUrl`, `uploadToBunnyStorage`,
  `deleteFromBunnyStorage`. Uploads/deletes hit `storage.bunnycdn.com`; public
  reads come from the `agnitantra-images.b-cdn.net` pull zone.
- Reel video upload itself goes through `app/api/upload-reel/route.ts` (raw
  octet-stream PUT — multipart returns HTTP 400 from Bunny).

---

## 7. Environment variables

See `.env.local.example`. Required for the site + admin to work:

| Var | What |
|---|---|
| `DATABASE_URI` | Neon Postgres (pooled) connection string |
| `ADMIN_PASSWORD` | password for `/manage` |
| `ADMIN_SESSION_SECRET` | 32-byte hex, signs the session cookie |
| `BUNNY_STREAM_LIBRARY_ID` / `BUNNY_STREAM_API_KEY` | reel video host |
| `NEXT_PUBLIC_BUNNY_CDN_URL` | Stream pull-zone host |
| `BUNNY_STORAGE_ZONE` / `BUNNY_STORAGE_API_KEY` | image host |
| `NEXT_PUBLIC_BUNNY_STORAGE_CDN_URL` | Storage pull-zone host |
| `BUNNY_ACCOUNT_API_KEY` | management API only (creating zones) |

**Deploy:** all of these must be added to Vercel env before the site works in
prod. `NEXT_PUBLIC_*` are exposed to the browser by design; the rest are
server-only.

---

## 8. Build / run

```bash
npm run dev     # localhost:3000 (admin at /manage)
npm run build   # production build — must be clean before deploy
```

Node 24 note: the app runs fine, but some third-party *CLI* tools (e.g. Payload's)
break on Node 24 due to a tsx loader quirk. Not relevant to this stack, but keep
it in mind if adding tooling that ships its own CLI.

---

## 9. Migration provenance (for context)

- Off Sanity → this stack on 2026-06-30 (commit `9c48d10`). Clean revert point to
  the working Sanity site: `258dcf2`.
- 40 gallery photos imported from `C:\Users\alkes\Downloads\000-…\000` (first 40
  alphabetical), optimized sharp→1600px WebP q82.
- 15 reviews / 5 reels / settings / 2 pages seeded from `migration-export/`.
- The one-time migration routes (`setup-migrate`, `import-photos`) were deleted
  after use — they are not part of the runtime.
