import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { listPhotos, addPhoto, type PageBrand } from "@/lib/cms/admin";
import { uploadToBunnyStorage } from "@/lib/bunny";

export const runtime = "nodejs";
export const maxDuration = 60;

const isBrand = (v: string | null): v is PageBrand =>
  v === "photography" || v === "events";

// Server-side upload limits. The browser compresses to WebP (~300–600 KB)
// before sending, but that is client-side and bypassable, so we re-validate
// here. 8 MB leaves generous headroom under Vercel's 4.5 MB body cap note
// while still rejecting anything that isn't a reasonably-sized image.
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/webp",
  "image/jpeg",
  "image/png",
  "image/avif",
]);

/** Verify the first bytes match a real image format (defense in depth). */
function looksLikeImage(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  // WebP: "RIFF"...."WEBP"
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return true;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  // AVIF / HEIF: "ftyp" box at offset 4 (avif/avis/mif1/heic brands)
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return true;
  return false;
}

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

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image too large (max 8 MB)." },
      { status: 413 },
    );
  }
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload an image." },
      { status: 415 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // Re-check size and magic bytes after reading (declared values are untrusted).
  if (bytes.length > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image too large (max 8 MB)." }, { status: 413 });
  }
  if (!looksLikeImage(bytes)) {
    return NextResponse.json(
      { error: "File does not appear to be a valid image." },
      { status: 415 },
    );
  }
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
