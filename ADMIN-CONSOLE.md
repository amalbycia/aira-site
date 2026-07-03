# Admin Console (`/manage`) — how it works & how to set it up

The owner manages site content through a custom console at **`/manage`**. This doc is the source of
truth for how the console and its auth work, so a fresh session (human or agent) doesn't rediscover it
the hard way.

---

## What the console manages

| Tab | Edits | Backed by |
|---|---|---|
| **Photos** | Gallery images per brand (Photography / Events) | `gallery_photos` (Neon) + Bunny Storage |
| **Reels & Videos** | Reels shown on each page | `reels` (Neon) + Bunny Stream |
| **Reviews** | Testimonials in the marquee | `reviews` (Neon) |
| **Events Menu** | Catering menu (categories + dishes) on the Events page | `menu_categories` + `menu_dishes` (Neon) |

Everything else on the site (socials, contact, About copy, location) is **hardcoded** — there's no
Settings tab by design.

### Data flow (unchanged by the auth swap)
- **Public pages** read via `lib/cms/getPage.ts` and `lib/cms/getContent.ts` ONLY. All reads **fail
  soft** (return `[]`/`{}` on DB error) so the site never hard-crashes if Neon blips.
- **Admin mutations** go through `app/api/admin/**` route handlers, each guarded by `requireAdmin()`.
  Admin-only queries live in `lib/cms/admin.ts` — never import that into a public page.
- Admin list reads are also fail-soft (e.g. `listMenu()` try/catches → `[]`) so one DB hiccup can't
  crash the whole dashboard.

---

## Auth — **Clerk** (Google sign-in)

`/manage` is protected by **Clerk**. There is no custom password login anymore.

### How it's wired
- `middleware.ts` (repo root) runs `clerkMiddleware` and protects `/manage(.*)` via
  `createRouteMatcher` → `auth().protect()`.
- `<ClerkProvider>` wraps the app in `app/layout.tsx`.
- Sign-in page: `app/sign-in/[[...sign-in]]/page.tsx` renders `<SignIn />`.
- `app/manage/page.tsx` calls `await auth()` and redirects to sign-in if not authenticated.
- `lib/auth/guard.ts` → `requireAdmin()` checks Clerk's `auth()`; every `app/api/admin/**` route
  still calls it at the top, so all mutations stay gated.
- Sign-out is Clerk's `<UserButton />` in the dashboard top bar.

### Who can log in
Access = **being a user in the Clerk dashboard**. There's no self-signup allowlist configured; you
simply create the 2–4 admin users in Clerk. To add/remove an admin, do it in the Clerk dashboard —
NOT in the app or the database.

### Sign-in method
Google social login (enabled in Clerk dashboard → Social Connections → Google). Admins click
"Sign in with Google".

---

## First-time / new-environment setup

1. **Clerk app:** create (or reuse) the Clerk application in the Clerk dashboard. Enable **Google**
   under Social Connections. Add the allowed admin users.
2. **Env vars** — set in `.env.local` (dev) AND Vercel project env (prod):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   ```
   Without these, `/manage` 500s in that environment.
3. **Neon:** `DATABASE_URI` must be set (content store). Menu tables are created by
   `node scripts/migrate-menu.mjs` (idempotent; already run in prod).
4. **Bunny:** `BUNNY_STORAGE_*` (images) and `BUNNY_STREAM_*` (video, library 691820) must be set for
   uploads to work.
5. Run `npm run dev`, open `/manage`, sign in with a Google account that's an allowed Clerk user.

---

## Gotchas (things that have bitten us)

- **`origin` must be the GitHub URL** (`https://github.com/amalbycia/aira-site.git`), not a local
  folder — otherwise `git push` doesn't trigger a Vercel deploy.
- **Preloader plays once per tab** (`sessionStorage["aira-hero-played"]`). Not a bug — use incognito
  to see it replay.
- **Clerk keys missing in prod** → `/manage` 500. Always add the 3 env vars to Vercel when deploying.
- The old `admin_users` table + `lib/auth/session.ts`/`rateLimit.ts`/`password.ts` are **retired**.
  Don't wire new code to them. (Table left in Neon only to avoid a needless migration.)
- Admin field labels/help text are written for a **non-technical owner** — keep that tone.

---

## Related docs
- `HANDOVER-CLERK.md` — contextual handover + the Clerk migration plan/status.
- `CLAUDE.md` — full developer guide (conventions, boundaries, mobile rules).
- `ARCHITECTURE.md` — deeper architectural reasoning.
- `TODO-REELS-PLAYER.md` — parked task (Osmo HLS reels player), unrelated to auth.
