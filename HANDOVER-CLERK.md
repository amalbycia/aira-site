# Handover — Aira / Agnitantra site (Clerk auth migration in progress)

**Project:** `C:\dev\aira-site` (NOT the OneDrive path). Next.js 16.2.9 (App Router, Turbopack),
React 19.2.4, TS, Tailwind v4, GSAP 3.15, Lenis. Node 24.
**Content:** Neon Postgres + Bunny (Storage images, Stream video). No CMS. Custom admin at `/manage`.
**Deploy:** git push `master` → GitHub `amalbycia/aira-site` → **auto-deploys to Vercel**
(project `aira-site`, org `amalbycias-projects`, canonical URL `https://aira-site-rose.vercel.app`).
`origin` MUST point at `https://github.com/amalbycia/aira-site.git` — if it ever points at a local
folder again, a push won't trigger a deploy (that bug already bit us once). CLI auth: `gh` + `vercel`
are both logged in as `amalbycia`.

Read `CLAUDE.md`, `ADMIN-CONSOLE.md`, `ARCHITECTURE.md`, and the memory files for full context.

---

## What was done in the sessions leading here (all shipped)

- **Deploy pipeline fixed** — repointed `origin` from a local OneDrive folder to the real GitHub repo;
  git push now auto-deploys via the existing Vercel↔GitHub connection.
- **Events catering menu is now DB-driven** — new `menu_categories` + `menu_dishes` tables (Neon),
  admin editor at `/manage` → **Events Menu** tab (`app/manage/tabs/MenuTab.tsx`), API under
  `app/api/admin/menu/**`, public read `getMenu()` in `lib/cms/getContent.ts`. `CateringMenu.tsx` takes
  a `categories` prop and falls back to a hardcoded placeholder if the DB is empty/unreachable.
  Migration/seed script: `scripts/migrate-menu.mjs` (already run against prod Neon).
- **Events media** — already covered by the existing Photos + Reels admin tabs (they manage
  `page='events'` content); the events page renders `ColumnDriftGallery` + `ReelsStrip` from the DB.
  No new work needed there.
- **Footer location card** — updated to the real Google Business listing:
  Changanassery, Kurishummood, Chethipuzha Kadavu, Kerala 686104; hours "Open daily from 9 am · by
  appointment"; map link uses the exact place CID. Map stays flush to the card (verified 320/375/desktop).
- **Hero white-band fix** — the home hero (`components/HeroPreloader.tsx`) showed a cream band when
  `100dvh` (image) < the section's `100vh`-based height on mobile. Fixed by adding a **static
  `object-fit:cover` hero-bg image behind the carousel** (`.crisp-header__bg`, same `HERO_BG` asset),
  revealed after the morph — so any gap reveals the matching bg, not cream. Also set the revealed
  backdrop to maroon as a second safety net. NOTE: the preloader only plays **once per tab**
  (`sessionStorage["aira-hero-played"]`); to see it replay, use an incognito window.
- **`listMenu()` made fail-soft** — a transient Neon `fetch failed` was crashing the whole `/manage`
  page. `listMenu` now try/catches → `[]`, matching the read contract of every other cms function.

---

## What we're doing NOW: replace custom admin auth with **Clerk**

**Why:** the current login has a real security hole. In `app/api/admin/login/route.ts` the shared
`ADMIN_PASSWORD` fallback creates a session for **whatever email was typed** — so *any* email + the
shared password logs in. We're handing auth for `/manage` to Clerk instead of patching this.

**Decisions locked with the client (James):**
- **Full swap** — Clerk fully owns `/manage` login. Remove the custom auth stack (see below).
- **Google social login** — admins click "Sign in with Google". No restricted/allowlist mode; James
  just creates the 2–4 allowed users in the Clerk dashboard (that IS the access control).
- A "few users" is enough → comfortably within Clerk's free tier (50k MAU).

### Files the migration touches
Replace / remove (custom auth stack — all becomes dead once Clerk lands):
- `app/api/admin/login/route.ts`, `app/api/admin/logout/route.ts`
- `lib/auth/session.ts`, `lib/auth/rateLimit.ts`, `lib/auth/password.ts`
- `app/manage/LoginForm.tsx`
- `app/manage/tabs/UsersTab.tsx` + `app/api/admin/users/**` (Clerk dashboard replaces this)
- `admin_users` table + its functions in `lib/cms/admin.ts` (`listAdminUsers`, `createAdminUser`,
  `verifyAdminCredentials`, etc.) — leave the table in Neon for now, just stop using it.

Rewrite:
- `lib/auth/guard.ts` — `requireAdmin()` now checks Clerk `auth()` instead of the cookie session.
- `app/manage/page.tsx` — gate on Clerk `auth()`; drop `listAdminUsers` + `getSessionEmail`; the
  dashboard no longer needs `initialUsers`/`currentEmail` (or feed them from Clerk's `currentUser()`).
- `app/manage/Dashboard.tsx` — remove the Users tab; show Clerk `<UserButton />` for sign-out.

Add:
- `@clerk/nextjs` dependency.
- `middleware.ts` at repo root — `clerkMiddleware` + `createRouteMatcher(['/manage(.*)'])`,
  `auth().protect()` on match.
- `<ClerkProvider>` wrapping the app in `app/layout.tsx`.
- `app/sign-in/[[...sign-in]]/page.tsx` → `<SignIn />` (catch-all route).
- Env vars: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
  `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`. Add to `.env.local` AND Vercel prod env.

### Clerk API notes (verified against current docs, July 2026 — do NOT hallucinate these)
- Install: `npm install @clerk/nextjs`.
- `auth()` is **async** — always `await auth()`. It returns `{ isAuthenticated, userId, redirectToSignIn, protect, ... }`.
- Server route protection: `const { isAuthenticated } = await auth(); if (!isAuthenticated) ...`
  or `await auth.protect()` (redirects/404s).
- `currentUser()` from `@clerk/nextjs/server` for full user (email at `user.emailAddresses[0].emailAddress`).
- UI components (`SignIn`, `UserButton`, `SignedIn`, `SignedOut`) import from `@clerk/nextjs`.
- Google login is enabled in the **Clerk dashboard** (Social Connections → Google), not in code.
- Middleware `config.matcher` must exclude `_next` and static files (see quickstart matcher).

### Guardrails (unchanged)
- Never restyle `app/photography/page.tsx` or `components/media/ColumnDriftGallery.tsx`.
- Public pages read via `lib/cms/*` (fail-soft); admin mutations behind `requireAdmin()` — after the
  swap, `requireAdmin()` = Clerk check, but every `app/api/admin/**` route keeps calling it.
- `npx next build` must be clean before declaring done. Verify package APIs against installed versions.
- There's a parked TODO: `TODO-REELS-PLAYER.md` (Osmo HLS player upgrade) — separate task, don't mix in.

### Definition of done for the Clerk task
1. `/manage` (and every `/api/admin/**`) is reachable only when signed in via Clerk.
2. "Any email + shared password" no longer works (the whole custom login path is gone).
3. Google sign-in works; sign-out via `<UserButton />`.
4. Menu/Photos/Reels/Reviews tabs still function (their APIs still gated by `requireAdmin()`).
5. Clean `next build`, committed, pushed, auto-deployed, verified Ready.
6. Clerk keys added to Vercel prod env (else prod `/manage` 500s).
