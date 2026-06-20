import type { SanityImageSource } from "@sanity/image-url";
import { client } from "./client";
import { pageByIdQuery, PAGE_IDS } from "./queries";
import { urlFor } from "@/lib/imageUrl";
import type { GalleryPhoto } from "@/components/media/types";

type RawGalleryItem = {
  image: SanityImageSource;
  alt: string | null;
  caption: string | null;
};

type RawReel = {
  _id: string;
  title: string;
  bunnyVideoId: string;
  thumbnail: SanityImageSource | null;
};

type RawPage = {
  brand: "photography" | "events";
  description: string | null;
  locationText: string | null;
  gallery: RawGalleryItem[] | null;
  reels: RawReel[] | null;
} | null;

export type PageData = {
  description?: string;
  locationText?: string;
  /** Gallery photos already mapped to CDN URLs — ready for ColumnDriftGallery. */
  gallery: GalleryPhoto[];
};

/**
 * Server-side fetch of a page document by brand, with its gallery images
 * resolved to optimized Sanity CDN URLs (1200px wide, webp). Returns an empty
 * gallery if the document or its images are missing so callers can fall back
 * to placeholders without throwing.
 *
 * Reels are fetched but not mapped to playable URLs yet (Bunny wiring is later);
 * they're carried through so this query doesn't need changing when reels land.
 */
export async function getPage(
  brand: "photography" | "events",
): Promise<PageData> {
  let page: RawPage = null;

  // If Sanity isn't configured (no project id) or the request fails, fall back
  // gracefully rather than breaking the page/build.
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      page = await client.fetch<RawPage>(pageByIdQuery, { id: PAGE_IDS[brand] });
    } catch {
      page = null;
    }
  }

  const gallery: GalleryPhoto[] = (page?.gallery ?? [])
    .filter((item) => Boolean(item?.image))
    .map((item, i) => ({
      src: urlFor(item.image).width(1200).quality(80).format("webp").url(),
      alt: item.alt ?? `Aira Photography gallery image ${i + 1}`,
      caption: item.caption ?? undefined,
    }));

  return {
    description: page?.description ?? undefined,
    locationText: page?.locationText ?? undefined,
    gallery,
  };
}
