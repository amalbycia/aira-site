import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { renameMenuDish, deleteMenuDish } from "@/lib/cms/admin";

export const runtime = "nodejs";

/** PUT /api/admin/menu/dishes/[id] — rename a dish. Body: { name }. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const dishId = Number(id);
  if (Number.isNaN(dishId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const b = (await req.json().catch(() => ({}))) as { name?: string };
  if (!b.name || !b.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  await renameMenuDish(dishId, b.name);
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/menu/dishes/[id] — remove a dish. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const dishId = Number(id);
  if (Number.isNaN(dishId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await deleteMenuDish(dishId);
  return NextResponse.json({ ok: true });
}
