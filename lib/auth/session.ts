import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Signed-cookie session for the /manage admin.
 *
 * Accounts live in the `admin_users` table (email + scrypt hash); a legacy
 * shared password (ADMIN_PASSWORD) still works as a bootstrap/fallback so the
 * owner is never locked out before the first user is created.
 *
 * On a successful login we set a cookie whose value is
 * `<expiryMs>.<emailB64url>.<HMAC(payload, ADMIN_SESSION_SECRET)>`. Verifying the
 * cookie re-computes the HMAC; a tampered or expired cookie fails. The HMAC is
 * the only thing that grants access — the embedded email is just so the UI can
 * show who's signed in and is itself covered by the signature.
 */
const COOKIE_NAME = "agnitantra_admin";
const MAX_AGE_DAYS = 30;

const secret = () => process.env.ADMIN_SESSION_SECRET || "";

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

const b64url = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64url = (s: string) => Buffer.from(s, "base64url").toString("utf8");

/** Build the cookie value: `<expiryMs>.<emailB64url>.<signature>`. */
function makeToken(email: string): string {
  const expiry = Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const emailEnc = b64url(email);
  const payload = `admin.${expiry}.${emailEnc}`;
  return `${expiry}.${emailEnc}.${sign(payload)}`;
}

type Parsed = { valid: boolean; email: string | null };

/** Constant-time check that a token is well-formed, unexpired, and correctly signed. */
function parseToken(token: string | undefined): Parsed {
  const fail: Parsed = { valid: false, email: null };
  if (!token || !secret()) return fail;
  const parts = token.split(".");
  if (parts.length !== 3) return fail;
  const [expiryStr, emailEnc, sig] = parts;
  const expiry = Number(expiryStr);
  if (!expiryStr || !emailEnc || !sig || Number.isNaN(expiry) || expiry < Date.now()) {
    return fail;
  }
  const expected = sign(`admin.${expiry}.${emailEnc}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return fail;
  let email: string | null = null;
  try {
    email = unb64url(emailEnc) || null;
  } catch {
    email = null;
  }
  return { valid: true, email };
}

/**
 * Legacy shared-password fallback (constant-time). Matches against
 * ADMIN_PASSWORD. Kept so the owner can always get in to create the first
 * per-user account; returns false when the env var is unset.
 */
export function passwordMatches(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Set the admin session cookie (call after a verified login). */
export async function createSession(email: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

/** Clear the admin session cookie (logout). */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** True if the current request carries a valid admin session. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return parseToken(store.get(COOKIE_NAME)?.value).valid;
}

/** The signed-in user's email (or null), if the session is valid. */
export async function getSessionEmail(): Promise<string | null> {
  const store = await cookies();
  const parsed = parseToken(store.get(COOKIE_NAME)?.value);
  return parsed.valid ? parsed.email : null;
}
