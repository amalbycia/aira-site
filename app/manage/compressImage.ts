/**
 * Compress an image file in the browser before upload.
 *
 * Resizes the long edge down to `maxEdge` and re-encodes as WebP via a canvas,
 * so a 40 MB camera original becomes a ~300–600 KB web-quality file BEFORE it
 * ever leaves the browser. This keeps uploads fast and, importantly, well under
 * Vercel's 4.5 MB serverless request limit.
 *
 * Returns a new File (image/webp). Falls back to the original file if the
 * browser can't decode it (very rare formats) so the upload still proceeds.
 */
export async function compressImage(
  file: File,
  { maxEdge = 1600, quality = 0.82 }: { maxEdge?: number; quality?: number } = {},
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const { width, height } = bitmap;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp" });
}
