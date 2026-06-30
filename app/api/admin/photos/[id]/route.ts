import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { deletePhoto } from "@/lib/cms/admin";
import { deleteFromBunnyStorage } from "@/lib/bunny";

export const runtime = "nodejs";

/** DELETE /api/admin/photos/[id] — remove a photo (DB row + Bunny file). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const photoId = Number(id);
  if (Number.isNaN(photoId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const storagePath = await deletePhoto(photoId);
  // Best-effort delete of the underlying file; the DB row is already gone.
  if (storagePath) {
    try {
      await deleteFromBunnyStorage(storagePath);
    } catch {
      /* file cleanup is best-effort */
    }
  }
  return NextResponse.json({ ok: true });
}
