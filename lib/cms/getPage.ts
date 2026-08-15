import { sql, hasDb } from "@/lib/db";
import {
  getBunnyMp4Url,
  getBunnyThumbnailUrl,
  getBunnyHlsUrl,
} from "@/lib/bunny";
import type { GalleryPhoto, ReelItem } from "@/components/media/types";

/**
 * Owner-editable page copy (from /manage → Page Content). Every field is
 * optional: when it's null in the DB the component keeps its built-in default,
 * so the site never renders blank because a field wasn't filled in.
 */
export type PageContent = {
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  introEyebrow?: string;
  introHeading?: string;
  introBody?: string;
  servicesHeading?: string;
  menuHeading?: string;
  galleryHeading?: string;
  reelsHeading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  stats: { value: string; label: string }[];
};

export type PageData = {
  description?: string;
  locationText?: string;
  /** Owner-editable copy for this page. */
  content: PageContent;
  /** Gallery photos as CDN URLs — ready for the gallery component. */
  gallery: GalleryPhoto[];
  /** Reels mapped to playable Bunny URLs — ready for ReelsStrip / ReelCard. */
  reels: ReelItem[];
};

type PageRow = {
  description: string | null;
  location_text: string | null;
  hero_eyebrow: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  intro_eyebrow: string | null;
  intro_heading: string | null;
  intro_body: string | null;
  services_heading: string | null;
  menu_heading: string | null;
  gallery_heading: string | null;
  reels_heading: string | null;
  cta_label: string | null;
  cta_href: string | null;
  stat_1_value: string | null;
  stat_1_label: string | null;
  stat_2_value: string | null;
  stat_2_label: string | null;
  stat_3_value: string | null;
  stat_3_label: string | null;
};

/** null/empty → undefined, so `??` fallbacks in components work as intended. */
function clean(v: string | null): string | undefined {
  const t = v?.trim();
  return t ? t : undefined;
}
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
  if (!hasDb()) return { gallery: [], reels: [], content: { stats: [] } };

  try {
    const [pageRows, photoRows, reelRows] = (await Promise.all([
      sql`select description, location_text,
                 hero_eyebrow, hero_title, hero_subtitle,
                 intro_eyebrow, intro_heading, intro_body,
                 services_heading, menu_heading, gallery_heading, reels_heading,
                 cta_label, cta_href,
                 stat_1_value, stat_1_label,
                 stat_2_value, stat_2_label,
                 stat_3_value, stat_3_label
          from pages where slug = ${brand}`,
      sql`select url, alt, caption from gallery_photos
          where page = ${brand} order by sort_order asc, id asc`,
      sql`select bunny_video_id, title, thumbnail_url from reels
          where page = ${brand}
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
      hlsSrc: getBunnyHlsUrl(r.bunny_video_id),
      videoSrc: getBunnyMp4Url(r.bunny_video_id, "720p"),
      alt: r.title || "Reel",
      caption: r.title || undefined,
    }));

    // Stats are only shown when BOTH halves of a pair are filled in.
    const stats = (
      [
        [page?.stat_1_value, page?.stat_1_label],
        [page?.stat_2_value, page?.stat_2_label],
        [page?.stat_3_value, page?.stat_3_label],
      ] as const
    )
      .map(([v, l]) => ({ value: clean(v ?? null), label: clean(l ?? null) }))
      .filter((s): s is { value: string; label: string } =>
        Boolean(s.value && s.label),
      );

    return {
      description: page?.description ?? undefined,
      locationText: page?.location_text ?? undefined,
      content: {
        heroEyebrow: clean(page?.hero_eyebrow ?? null),
        heroTitle: clean(page?.hero_title ?? null),
        heroSubtitle: clean(page?.hero_subtitle ?? null),
        introEyebrow: clean(page?.intro_eyebrow ?? null),
        introHeading: clean(page?.intro_heading ?? null),
        introBody: clean(page?.intro_body ?? null),
        servicesHeading: clean(page?.services_heading ?? null),
        menuHeading: clean(page?.menu_heading ?? null),
        galleryHeading: clean(page?.gallery_heading ?? null),
        reelsHeading: clean(page?.reels_heading ?? null),
        ctaLabel: clean(page?.cta_label ?? null),
        ctaHref: clean(page?.cta_href ?? null),
        stats,
      },
      gallery,
      reels,
    };
  } catch (err) {
    console.error("[getPage] query failed:", err);
    return { gallery: [], reels: [], content: { stats: [] } };
  }
}
