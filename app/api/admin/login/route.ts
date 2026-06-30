import { NextRequest, NextResponse } from "next/server";
import { passwordMatches, createSession } from "@/lib/auth/session";
import {
  checkRateLimit,
  registerFailure,
  clearAttempts,
  clientIp,
} from "@/lib/auth/rateLimit";

export const runtime = "nodejs";

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

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !passwordMatches(password)) {
    registerFailure(ip);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  clearAttempts(ip);
  await createSession();
  return NextResponse.json({ ok: true });
}
