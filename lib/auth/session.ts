import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Minimal signed-cookie session for the /manage admin.
 *
 * No user database — there is a single admin password (ADMIN_PASSWORD). On a
 * correct password we set a cookie whose value is an HMAC signature over a
 * fixed payload + expiry, signed with ADMIN_SESSION_SECRET. Verifying the
 * cookie re-computes the HMAC; a tampered or expired cookie fails. This is
 * enough for a one-owner content admin and adds no dependencies.
 */
const COOKIE_NAME = "agnitantra_admin";
const MAX_AGE_DAYS = 30;

const secret = () => process.env.ADMIN_SESSION_SECRET || "";

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Build the cookie value: `<expiryMs>.<signature>`. */
function makeToken(): string {
  const expiry = Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const payload = `admin.${expiry}`;
  return `${expiry}.${sign(payload)}`;
}

/** Constant-time check that a token is well-formed, unexpired, and correctly signed. */
function verifyToken(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const [expiryStr, sig] = token.split(".");
  const expiry = Number(expiryStr);
  if (!expiryStr || !sig || Number.isNaN(expiry) || expiry < Date.now()) return false;
  const expected = sign(`admin.${expiry}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** True if the supplied password matches ADMIN_PASSWORD (constant-time). */
export function passwordMatches(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Set the admin session cookie (call after a verified login). */
export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(), {
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
  return verifyToken(store.get(COOKIE_NAME)?.value);
}
