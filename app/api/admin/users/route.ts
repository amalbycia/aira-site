import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import {
  listAdminUsers,
  createAdminUser,
  MAX_ADMIN_USERS,
} from "@/lib/cms/admin";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/** GET /api/admin/users — list admin accounts (no hashes). */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ users: await listAdminUsers(), max: MAX_ADMIN_USERS });
}

/** POST /api/admin/users — create an account { email, password }. */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!email || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (!password || password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD} characters.` },
      { status: 400 },
    );
  }

  try {
    const user = await createAdminUser(email.trim(), password);
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === "limit") {
      return NextResponse.json(
        { error: `Limit reached — max ${MAX_ADMIN_USERS} accounts.` },
        { status: 409 },
      );
    }
    if (msg === "exists") {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
