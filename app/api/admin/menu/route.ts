import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import {
  listMenu,
  addMenuCategory,
  reorderMenuCategories,
} from "@/lib/cms/admin";

export const runtime = "nodejs";

/** GET /api/admin/menu — full menu (categories + dishes). */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ menu: await listMenu() });
}

/** POST /api/admin/menu — add a category. Body: { label }. */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const b = (await req.json().catch(() => ({}))) as { label?: string };
  if (!b.label || !b.label.trim()) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }
  const category = await addMenuCategory(b.label);
  return NextResponse.json({ ok: true, category });
}

/** PUT /api/admin/menu — reorder categories. Body: { ids: number[] }. */
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const b = (await req.json().catch(() => ({}))) as { ids?: number[] };
  if (!Array.isArray(b.ids)) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }
  await reorderMenuCategories(b.ids.map(Number));
  return NextResponse.json({ ok: true });
}
