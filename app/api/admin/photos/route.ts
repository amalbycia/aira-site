import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { listPhotos, addPhoto, type PageBrand } from "@/lib/cms/admin";
import { uploadToBunnyStorage } from "@/lib/bunny";

export const runtime = "nodejs";
export const maxDuration = 60;

const isBrand = (v: string | null): v is PageBrand =>
  v === "photography" || v === "events";

/** GET /api/admin/photos?page=photography — list photos for a page. */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const page = req.nextUrl.searchParams.get("page");
  if (!isBrand(page)) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }
  return NextResponse.json({ photos: await listPhotos(page) });
}

/**
 * POST /api/admin/photos — upload one already-optimized image.
 * multipart/form-data: { file, page, alt?, caption? }. The browser compresses
 * to WebP before sending, so the body stays small (well under Vercel's limit).
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData();
  const file = form.get("file");
  const page = form.get("page");
  const alt = (form.get("alt") as string) || undefined;
  const caption = (form.get("caption") as string) || undefined;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!isBrand(typeof page === "string" ? page : null)) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  const storagePath = `gallery/${page}/${stamp}-${rand}.webp`;

  try {
    const { url } = await uploadToBunnyStorage(bytes, storagePath);
    const photo = await addPhoto({
      page: page as PageBrand,
      url,
      storagePath,
      alt,
      caption,
    });
    return NextResponse.json({ ok: true, photo });
  } catch (err) {
    return NextResponse.json(
      { error: `Upload failed: ${(err as Error).message}` },
      { status: 502 },
    );
  }
}
