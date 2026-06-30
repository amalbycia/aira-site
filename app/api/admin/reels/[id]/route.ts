import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { deleteReel } from "@/lib/cms/admin";
import { deleteFromBunnyStream } from "@/lib/bunny";

export const runtime = "nodejs";

/** DELETE /api/admin/reels/[id] — remove a reel (DB row + Bunny Stream video). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const reelId = Number(id);
  if (Number.isNaN(reelId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const bunnyVideoId = await deleteReel(reelId);
  if (bunnyVideoId) {
    try {
      await deleteFromBunnyStream(bunnyVideoId);
    } catch {
      /* video cleanup is best-effort */
    }
  }
  return NextResponse.json({ ok: true });
}
