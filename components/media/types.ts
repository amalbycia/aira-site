/**
 * Shared media model for the photography/events portfolio.
 *
 * A page is a list of CLUSTERS. A cluster is a curated group of media items
 * (photos and/or reels) laid out together in an asymmetric editorial block.
 * Photos and reels can be mixed freely inside one cluster — the layout holds
 * both. This shape maps cleanly onto Sanity later:
 *   - a photo item ← a `page.gallery[]` image (src via urlFor(), alt/caption)
 *   - a reel item  ← a `reel` document (src via Bunny, poster via thumbnail)
 *
 * Reels are SELF-HOSTED video (Bunny Storage/Stream), never Instagram embeds.
 * For now `videoSrc` is omitted and only the poster shows; drop a Bunny URL in
 * (getBunnyCdnUrl / getBunnyHlsUrl from lib/bunny.ts) and it plays.
 */

/** Visual footprint of an item within its cluster's grid. */
export type MediaSpan = "tall" | "wide" | "square" | "portrait" | "pano";

export type PhotoItem = {
  kind: "photo";
  /** Poster/image URL — local placeholder now, Sanity urlFor() later. */
  src: string;
  alt: string;
  caption?: string;
  span: MediaSpan;
};

export type ReelItem = {
  kind: "reel";
  /** Poster frame shown before play — local placeholder now, Bunny thumb later. */
  poster: string;
  /** Self-hosted video URL. Omit until Bunny is wired; poster shows alone. */
  videoSrc?: string;
  alt: string;
  caption?: string;
  /** Reels are vertical by nature, but the grid still honors an explicit span. */
  span: MediaSpan;
};

export type MediaItem = PhotoItem | ReelItem;

export type Cluster = {
  /** Stable key for React + ScrollTrigger batching. */
  id: string;
  /** Offset direction for the alternating editorial rhythm. */
  offset: "left" | "right";
  /** Optional cursive note that sits alongside the cluster. */
  note?: string;
  items: MediaItem[];
};

/**
 * Flat gallery photo — used by ColumnDriftGallery, which lays photos into
 * even columns rather than the asymmetric span-based Cluster grid above.
 * Same Sanity mapping: src ← page.gallery[] image via urlFor().
 */
export type GalleryPhoto = {
  src: string;
  alt: string;
  caption?: string;
};
