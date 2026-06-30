import { sql, hasDb } from "@/lib/db";
import { getBunnyMp4Url, getBunnyThumbnailUrl } from "@/lib/bunny";
import type { GalleryPhoto, ReelItem } from "@/components/media/types";

export type PageData = {
  description?: string;
  locationText?: string;
  /** Gallery photos as CDN URLs — ready for ColumnDriftGallery. */
  gallery: GalleryPhoto[];
  /** Reels mapped to playable Bunny URLs — ready for ReelsStrip / ReelCard. */
  reels: ReelItem[];
};

type PageRow = { description: string | null; location_text: string | null };
type PhotoRow = { url: string; alt: string | null; caption: string | null };
type ReelRow = {
  bunny_video_id: string;
  title: string | null;
  thumbnail_url: string | null;
};

/**
 * Server-side fetch of a brand page's content from Neon: its description,
 * location line, gallery photos (Bunny Storage URLs) and reels (mapped to
 * playable Bunny Stream URLs). Returns empty collections if the DB is
 * unconfigured/unreachable so pages fall back to placeholders without throwing.
 *
 * Same shape as the old Sanity getPage(), so page components are unchanged.
 */
export async function getPage(
  brand: "photography" | "events",
): Promise<PageData> {
  if (!hasDb()) return { gallery: [], reels: [] };

  try {
    const [pageRows, photoRows, reelRows] = (await Promise.all([
      sql`select description, location_text from pages where slug = ${brand}`,
      sql`select url, alt, caption from gallery_photos
          where page = ${brand} order by sort_order asc, id asc`,
      sql`select bunny_video_id, title, thumbnail_url from reels
          where page = ${brand} or page = 'both'
          order by sort_order asc, id asc`,
    ])) as [PageRow[], PhotoRow[], ReelRow[]];

    const page = pageRows[0];

    const gallery: GalleryPhoto[] = photoRows.map((p, i) => ({
      src: p.url,
      alt: p.alt ?? `Aira Photography gallery image ${i + 1}`,
      caption: p.caption ?? undefined,
    }));

    const reels: ReelItem[] = reelRows.map((r) => ({
      kind: "reel" as const,
      span: "portrait" as const,
      poster: r.thumbnail_url || getBunnyThumbnailUrl(r.bunny_video_id),
      videoSrc: getBunnyMp4Url(r.bunny_video_id, "720p"),
      alt: r.title || "Reel",
      caption: r.title || undefined,
    }));

    return {
      description: page?.description ?? undefined,
      locationText: page?.location_text ?? undefined,
      gallery,
      reels,
    };
  } catch (err) {
    console.error("[getPage] query failed:", err);
    return { gallery: [], reels: [] };
  }
}
