/**
 * Tiny in-memory rate limiter for the single-owner admin.
 *
 * No Redis/Upstash dependency: the admin has one user and login attempts are
 * rare, so an in-process sliding-window counter is enough to stop brute force.
 * (On serverless, each warm instance keeps its own window — an attacker can only
 * spread attempts across instances, which is still far slower than unlimited,
 * and the constant-time password check plus a strong password do the rest.)
 *
 * Keyed by client IP. After MAX_ATTEMPTS failures inside WINDOW_MS, the key is
 * locked out until the window rolls off. A successful login clears the key.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 8; // failed attempts allowed per window

type Entry = { count: number; first: number };

// Module-level map persists for the life of the server instance.
const attempts = new Map<string, Entry>();

// Opportunistic cleanup so the map can't grow unbounded.
function sweep(now: number) {
  if (attempts.size < 500) return;
  for (const [key, e] of attempts) {
    if (now - e.first > WINDOW_MS) attempts.delete(key);
  }
}

export type RateLimitResult = {
  limited: boolean;
  /** Seconds until the caller may try again (only meaningful when limited). */
  retryAfter: number;
};

/** Check whether `key` is currently locked out. Does NOT count an attempt. */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const e = attempts.get(key);
  if (!e) return { limited: false, retryAfter: 0 };
  if (now - e.first > WINDOW_MS) {
    attempts.delete(key);
    return { limited: false, retryAfter: 0 };
  }
  if (e.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfter: Math.ceil((e.first + WINDOW_MS - now) / 1000) };
  }
  return { limited: false, retryAfter: 0 };
}

/** Record one failed attempt against `key`. */
export function registerFailure(key: string): void {
  const now = Date.now();
  sweep(now);
  const e = attempts.get(key);
  if (!e || now - e.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
  } else {
    e.count += 1;
  }
}

/** Clear `key` after a successful login. */
export function clearAttempts(key: string): void {
  attempts.delete(key);
}

/** Best-effort client IP from the request (proxy headers, then connection). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
