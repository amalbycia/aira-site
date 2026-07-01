import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { renameMenuCategory, deleteMenuCategory } from "@/lib/cms/admin";

export const runtime = "nodejs";

/** PUT /api/admin/menu/[id] — rename a category. Body: { label }. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const catId = Number(id);
  if (Number.isNaN(catId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const b = (await req.json().catch(() => ({}))) as { label?: string };
  if (!b.label || !b.label.trim()) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }
  await renameMenuCategory(catId, b.label);
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/menu/[id] — remove a category (and its dishes). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const catId = Number(id);
  if (Number.isNaN(catId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await deleteMenuCategory(catId);
  return NextResponse.json({ ok: true });
}
