import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { listReels, addReel, type ContentScope } from "@/lib/cms/admin";

export const runtime = "nodejs";

const isScope = (v: unknown): v is ContentScope =>
  v === "photography" || v === "events" || v === "both";

/** GET /api/admin/reels — list all reels. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ reels: await listReels() });
}

/**
 * POST /api/admin/reels — record a reel after its video is uploaded to Bunny
 * Stream (via /api/upload-reel, which returns the guid). Body:
 * { bunnyVideoId, title?, page }.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as {
    bunnyVideoId?: string;
    title?: string;
    page?: string;
  };
  if (!body.bunnyVideoId) {
    return NextResponse.json({ error: "bunnyVideoId is required" }, { status: 400 });
  }
  const page: ContentScope = isScope(body.page) ? body.page : "both";
  const reel = await addReel({
    page,
    bunnyVideoId: body.bunnyVideoId,
    title: body.title,
  });
  return NextResponse.json({ ok: true, reel });
}
