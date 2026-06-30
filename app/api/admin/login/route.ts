import { NextRequest, NextResponse } from "next/server";
import { passwordMatches, createSession } from "@/lib/auth/session";
import { verifyAdminCredentials } from "@/lib/cms/admin";
import {
  checkRateLimit,
  registerFailure,
  clearAttempts,
  clientIp,
} from "@/lib/auth/rateLimit";

export const runtime = "nodejs";

/** Identity used when logging in via the legacy shared-password fallback. */
const FALLBACK_IDENTITY = "owner";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  // Brute-force protection: lock out an IP after too many failed attempts.
  const limit = checkRateLimit(ip);
  if (limit.limited) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!password) {
    registerFailure(ip);
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  // 1) Per-user account (email + password) — the normal path.
  if (email && email.trim()) {
    let identity: string | null = null;
    try {
      identity = await verifyAdminCredentials(email.trim(), password);
    } catch {
      // DB unreachable — fall through to the shared-password fallback below.
    }
    if (identity) {
      clearAttempts(ip);
      await createSession(identity);
      return NextResponse.json({ ok: true });
    }
  }

  // 2) Legacy shared-password fallback (bootstrap / lockout safety net).
  //    Works with or without an email field so the owner can always get in.
  if (passwordMatches(password)) {
    clearAttempts(ip);
    await createSession(email?.trim() || FALLBACK_IDENTITY);
    return NextResponse.json({ ok: true });
  }

  registerFailure(ip);
  return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
}
