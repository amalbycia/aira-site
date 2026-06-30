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

// The Stream CDN host is the library's generated PULL ZONE hostname (NOT
// `vz-<libraryId>`). Always use the configured pull zone so URLs resolve.
const STREAM_CDN = (CDN_URL || `https://vz-${STREAM_LIBRARY_ID}.b-cdn.net`).replace(
  /\/$/,
  "",
);

// Bunny Storage pull-zone host — serves uploaded images (zone: agnitantra-images).
const STORAGE_CDN = (process.env.NEXT_PUBLIC_BUNNY_STORAGE_CDN_URL ?? "").replace(
  /\/$/,
  "",
);

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
  return `${STREAM_CDN}/${videoId}/playlist.m3u8`;
}

/**
 * Returns the auto-generated thumbnail URL for a Bunny Stream video.
 * Bunny generates this image after upload — no manual upload required.
 *
 * Served from the library pull zone (STREAM_CDN), gated by referrer security.
 */
export function getBunnyThumbnailUrl(videoId: string): string {
  return `${STREAM_CDN}/${videoId}/thumbnail.jpg`;
}

/**
 * Animated hover preview (short looping webp) Bunny generates per video.
 */
export function getBunnyPreviewUrl(videoId: string): string {
  return `${STREAM_CDN}/${videoId}/preview.webp`;
}

/**
 * Direct MP4 URL (Bunny "MP4 fallback") for a given rendition. Use this as the
 * `src` of a plain <video> element — it plays natively without an HLS player.
 * Default 720p balances quality and weight for portrait reels.
 *
 * Access is gated by the library's referrer security: works from a real page
 * (browser sends a Referer), blocked for no-referrer requests. Keep
 * EnableMP4Fallback ON in the Bunny library for these to exist.
 */
export function getBunnyMp4Url(
  videoId: string,
  resolution: "240p" | "360p" | "480p" | "720p" | "1080p" = "720p",
): string {
  return `${STREAM_CDN}/${videoId}/play_${resolution}.mp4`;
}

// ─── Storage / CDN ────────────────────────────────────────────────────────────

/**
 * Builds the public CDN URL for a file stored in Bunny Storage.
 *
 * @param path - The file path within the storage zone (e.g. "gallery/hero.jpg")
 *
 * @example
 *   <img src={getBunnyStorageUrl("gallery/hero.jpg")} alt="Hero" />
 */
export function getBunnyStorageUrl(path: string): string {
  const filePath = path.replace(/^\//, "");
  return `${STORAGE_CDN}/${filePath}`;
}

/** Bunny Storage REST origin (uploads/deletes go here, NOT the CDN pull zone). */
const STORAGE_ORIGIN = "https://storage.bunnycdn.com";

/**
 * Upload a file to Bunny Storage. Server-side only (uses BUNNY_STORAGE_API_KEY).
 *
 * @param fileBytes   - Raw file contents (Buffer / Uint8Array / ArrayBuffer)
 * @param storagePath - Destination path in the zone (e.g. "gallery/abc.webp")
 * @returns the public CDN url + the storage path (store the path for deletes)
 */
export async function uploadToBunnyStorage(
  fileBytes: Buffer | Uint8Array | ArrayBuffer,
  storagePath: string,
): Promise<{ ok: boolean; url: string; path: string }> {
  const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
  const API_KEY = process.env.BUNNY_STORAGE_API_KEY;
  if (!STORAGE_ZONE || !API_KEY) {
    throw new Error("BUNNY_STORAGE_ZONE and BUNNY_STORAGE_API_KEY must be set.");
  }

  const cleanPath = storagePath.replace(/^\//, "");
  const res = await fetch(`${STORAGE_ORIGIN}/${STORAGE_ZONE}/${cleanPath}`, {
    method: "PUT",
    headers: { AccessKey: API_KEY, "Content-Type": "application/octet-stream" },
    body: fileBytes as BodyInit,
  });

  if (!res.ok) {
    throw new Error(
      `Bunny Storage upload failed: ${res.status} ${res.statusText} ${await res.text()}`,
    );
  }
  return { ok: true, url: getBunnyStorageUrl(cleanPath), path: cleanPath };
}

/**
 * Delete a file from Bunny Storage by its storage path. Server-side only.
 * Returns true on success or if the file was already gone (404).
 */
export async function deleteFromBunnyStorage(storagePath: string): Promise<boolean> {
  const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
  const API_KEY = process.env.BUNNY_STORAGE_API_KEY;
  if (!STORAGE_ZONE || !API_KEY) {
    throw new Error("BUNNY_STORAGE_ZONE and BUNNY_STORAGE_API_KEY must be set.");
  }
  const cleanPath = storagePath.replace(/^\//, "");
  const res = await fetch(`${STORAGE_ORIGIN}/${STORAGE_ZONE}/${cleanPath}`, {
    method: "DELETE",
    headers: { AccessKey: API_KEY },
  });
  return res.ok || res.status === 404;
}

/**
 * Delete a video from Bunny Stream by its GUID. Server-side only
 * (uses BUNNY_STREAM_API_KEY). Returns true on success or if already gone.
 */
export async function deleteFromBunnyStream(videoId: string): Promise<boolean> {
  const API_KEY = process.env.BUNNY_STREAM_API_KEY;
  if (!STREAM_LIBRARY_ID || !API_KEY) {
    throw new Error("BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY must be set.");
  }
  const res = await fetch(
    `https://video.bunnycdn.com/library/${STREAM_LIBRARY_ID}/videos/${videoId}`,
    { method: "DELETE", headers: { AccessKey: API_KEY, accept: "application/json" } },
  );
  return res.ok || res.status === 404;
}
