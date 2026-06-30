import { NextRequest, NextResponse } from "next/server";
import { passwordMatches, createSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !passwordMatches(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
