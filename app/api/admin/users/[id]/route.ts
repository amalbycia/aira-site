import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import {
  setAdminUserPassword,
  deleteAdminUser,
  countAdminUsers,
} from "@/lib/cms/admin";

export const runtime = "nodejs";

const MIN_PASSWORD = 8;

/** PATCH /api/admin/users/[id] — change a user's password { password }. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD} characters.` },
      { status: 400 },
    );
  }

  await setAdminUserPassword(userId, password);
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/users/[id] — remove an account. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Don't let the last account be deleted — that could lock everyone out.
  if ((await countAdminUsers()) <= 1) {
    return NextResponse.json(
      { error: "Can't remove the last account." },
      { status: 409 },
    );
  }

  await deleteAdminUser(userId);
  return NextResponse.json({ ok: true });
}
