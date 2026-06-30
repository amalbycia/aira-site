import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { reorderPhotos } from "@/lib/cms/admin";

export const runtime = "nodejs";

/** POST /api/admin/photos/reorder — body { ids: number[] } in desired order. */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { ids } = (await req.json().catch(() => ({}))) as { ids?: number[] };
  if (!Array.isArray(ids) || ids.some((n) => typeof n !== "number")) {
    return NextResponse.json({ error: "ids must be a number[]" }, { status: 400 });
  }
  await reorderPhotos(ids);
  return NextResponse.json({ ok: true });
}
