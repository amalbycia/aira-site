# Handover — Next session: security hardening, Google login, improvements

## Read first
- `ARCHITECTURE.md` — how the whole content system + admin is built.
- `CLAUDE.md` — conventions, stack, do-not-touch list.
- Project is at **`C:\dev\aira-site`** (NOT the old OneDrive path). Node v24,
  Next 16.2.9, Turbopack. Dev: `npm run dev` (admin at `/manage`, password in
  `.env.local` → `ADMIN_PASSWORD`).
- Clean git revert point to the working Sanity site if ever needed: `258dcf2`.
  Current migration commit: `9c48d10`.

## Mission for this session
James will drive a few major updates. Two things are pre-defined and should be
done carefully: **(A) fix the security flaws**, and **(B) add a Google login
option** as an alternative to the current shared-password login. For (B), **use
web fetch / web search to find a ready-made, well-maintained auth library** and
implement it — do NOT hand-roll OAuth.

---

## A. Security flaws to fix (audited, real — not generic)

Listed worst-first. Each is concrete and present in the current code.

1. **`/api/upload-reel` is UNAUTHENTICATED.** `app/api/upload-reel/route.ts` is a
   public proxy that streams arbitrary files into the Bunny Stream library. Anyone
   who finds the URL can upload videos and burn the Bunny quota. **Fix:** add
   `requireAdmin()` (from `lib/auth/guard.ts`) at the top, like every other admin
   route. Then confirm `ReelsTab` still works (it calls this while authenticated).

2. **No rate limiting on `/api/admin/login`.** The shared password can be
   brute-forced. **Fix:** add basic rate limiting / lockout (per-IP attempt
   counter; a small in-memory or Upstash/Redis limiter). If Google login (part B)
   becomes the primary path, this matters less but should still exist for the
   password fallback.

3. **No upload validation on `/api/admin/photos`.** It accepts any `File` and
   forwards to Bunny. **Fix:** enforce a max size (e.g. 8 MB after the browser
   already compressed), and verify the mime/type is an image before upload.
   Browser compression is client-side and bypassable, so validate server-side too.

4. **`ADMIN_SESSION_SECRET` and `ADMIN_PASSWORD` defaults.** Confirm there is no
   weak/committed default in code paths, and that prod uses strong values in
   Vercel env. The session cookie HMAC is fine; just ensure the secret is strong.

5. **Migration secret check is gone (good)** — the one-time `setup-migrate` /
   `import-photos` routes were deleted. Verify none were reintroduced and that no
   route still trusts a `?secret=` query param.

6. **General pass:** add security headers (CSP where feasible, `X-Content-Type-
   Options`, referrer policy), confirm `secure` cookie flag in prod (it already
   keys off `NODE_ENV==='production'`), and review error messages for info leaks.

Acceptance for A: every `app/api/**` route either is public-by-design (the site
itself) or calls `requireAdmin()`; login is rate-limited; photo upload is size +
type validated; `npx next build` stays clean.

---

## B. Add Google login (alternative to the password)

**Goal:** the owner can sign into `/manage` with Google (restricted to an allowed
email / list of emails), while the existing password login stays as a fallback.

**Approach — do NOT build OAuth by hand:**
1. **Web-fetch / web-search for the current best ready-made auth library** for
   Next.js 16 App Router + React 19. Likely candidates to evaluate (verify
   current docs + version compatibility before choosing — do not assume):
   - **Auth.js / NextAuth v5** (`next-auth@beta`) — Google provider, App Router
     support.
   - **better-auth** — newer, TS-first, growing adoption.
   - **Clerk** / **Lucia** (Lucia is winding down — verify status before picking).
   Fetch their official docs, confirm they support Next 16 + React 19, and pick
   one. Record the choice + version in `ARCHITECTURE.md`.
2. **Restrict access:** only allow specific Google account(s) (an allowlist of
   emails in env, e.g. `ADMIN_GOOGLE_EMAILS`). A valid Google login from a
   non-allowlisted email must be rejected.
3. **Integrate with the existing guard:** `requireAdmin()` / `isAuthenticated()`
   should accept EITHER a valid Google session OR the existing signed-password
   cookie, so all `app/api/admin/*` routes keep working unchanged. Keep the
   password login as a labelled fallback on the `/manage` login screen.
4. Google OAuth needs a Google Cloud project (Client ID/Secret) — James will
   supply these or create them; wire them via env (`GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, plus the library's required vars like `AUTH_SECRET`).

Acceptance for B: "Sign in with Google" on `/manage` works for an allowlisted
email, is rejected for others, the password fallback still works, all admin APIs
still pass `requireAdmin()`, and the build is clean.

---

## C. Likely "major updates" James will add (be ready, don't pre-build)
Wait for James to specify these — do not implement unprompted (his standing
preference: no unsolicited UI/feature work). Just be aware they're coming and
keep the data layer / admin flexible. When he describes one, scope it, confirm,
then build.

---

## Working agreement / guardrails
- **Never restyle** `app/photography/page.tsx` or `components/media/
  ColumnDriftGallery.tsx` — the gallery layout is final; feed it data only.
- Public pages read ONLY through `lib/cms/getPage.ts` / `getContent.ts`; never
  query Neon directly from a page; keep the fail-soft contract.
- Admin mutations stay behind `requireAdmin()` in `app/api/admin/*`.
- Verify package APIs against installed versions before using them (no
  hallucinated APIs — this is production, handed to a client).
- `npx next build` must be clean before declaring anything done.
- Commit at logical checkpoints; address James by name.

## Deploy reminders (still outstanding from last session)
- Add all env vars to Vercel (DATABASE_URI, ADMIN_*, BUNNY_STORAGE_*,
  NEXT_PUBLIC_BUNNY_STORAGE_CDN_URL) — see `.env.local.example`.
- Client still to supply real footer email/phone.
