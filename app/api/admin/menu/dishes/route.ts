import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { addMenuDish, reorderMenuDishes } from "@/lib/cms/admin";

export const runtime = "nodejs";

/** POST /api/admin/menu/dishes — add a dish. Body: { categoryId, name }. */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const b = (await req.json().catch(() => ({}))) as {
    categoryId?: number;
    name?: string;
  };
  const categoryId = Number(b.categoryId);
  if (Number.isNaN(categoryId) || !b.name || !b.name.trim()) {
    return NextResponse.json(
      { error: "categoryId and name are required" },
      { status: 400 },
    );
  }
  const dish = await addMenuDish(categoryId, b.name);
  return NextResponse.json({ ok: true, dish });
}

/** PUT /api/admin/menu/dishes — reorder dishes. Body: { ids: number[] }. */
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const b = (await req.json().catch(() => ({}))) as { ids?: number[] };
  if (!Array.isArray(b.ids)) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }
  await reorderMenuDishes(b.ids.map(Number));
  return NextResponse.json({ ok: true });
}
