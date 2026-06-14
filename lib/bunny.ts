/**
 * Bunny.net helper utilities.
 *
 * Bunny Stream: hosts and transcodes video (replaces YouTube/Vimeo).
 * Bunny Storage: stores and serves static assets (images, files) via CDN.
 *
 * Required env vars — see .env.local.example for details.
 */

const STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID ?? "";
const CDN_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_URL ?? "";

// ─── Stream ───────────────────────────────────────────────────────────────────

/**
 * Returns the iframe embed URL for a Bunny Stream video.
 * Drop the returned string into an <iframe src={...}> element.
 *
 * @example
 *   <iframe
 *     src={getBunnyEmbedUrl("a1b2c3d4-xxxx-xxxx-xxxx-ef1234567890")}
 *     allow="autoplay"
 *     allowFullScreen
 *   />
 */
export function getBunnyEmbedUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${STREAM_LIBRARY_ID}/${videoId}`;
}

/**
 * Returns the HLS (.m3u8) stream URL for a Bunny Stream video.
 * Use with a custom player like Plyr or Video.js for more control.
 */
export function getBunnyHlsUrl(videoId: string): string {
  return `https://vz-${STREAM_LIBRARY_ID}.b-cdn.net/${videoId}/playlist.m3u8`;
}

/**
 * Returns the auto-generated thumbnail URL for a Bunny Stream video.
 * Bunny generates this image after upload — no manual upload required.
 */
export function getBunnyThumbnailUrl(videoId: string): string {
  return `https://vz-${STREAM_LIBRARY_ID}.b-cdn.net/${videoId}/thumbnail.jpg`;
}

// ─── Storage / CDN ────────────────────────────────────────────────────────────

/**
 * Builds a CDN URL for a file stored in Bunny Storage.
 *
 * @param path - The file path within your storage zone (e.g. "images/hero.jpg")
 *
 * @example
 *   <img src={getBunnyCdnUrl("images/hero.jpg")} alt="Hero" />
 */
export function getBunnyCdnUrl(path: string): string {
  const base = CDN_URL.replace(/\/$/, "");
  const filePath = path.replace(/^\//, "");
  return `${base}/${filePath}`;
}

/**
 * Reference implementation: upload a file to Bunny Storage via the REST API.
 *
 * This is a server-side helper (uses BUNNY_STORAGE_API_KEY — never expose to client).
 * Wire this to an API route or Server Action when you need programmatic uploads.
 *
 * @param fileBuffer - Raw file contents as an ArrayBuffer (convert Uint8Array via `.buffer`)
 * @param storagePath - Destination path in the storage zone (e.g. "images/hero.jpg")
 *
 * Docs: https://docs.bunny.net/reference/put_-storagezonename-path-filename
 */
export async function uploadToBunnyStorage(
  fileBuffer: ArrayBuffer,
  storagePath: string,
): Promise<{ ok: boolean; url: string }> {
  const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
  const API_KEY = process.env.BUNNY_STORAGE_API_KEY;

  if (!STORAGE_ZONE || !API_KEY) {
    throw new Error(
      "BUNNY_STORAGE_ZONE and BUNNY_STORAGE_API_KEY must be set in environment variables.",
    );
  }

  const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${storagePath}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: API_KEY,
      "Content-Type": "application/octet-stream",
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    throw new Error(
      `Bunny Storage upload failed: ${response.status} ${response.statusText}`,
    );
  }

  return { ok: true, url: getBunnyCdnUrl(storagePath) };
}
