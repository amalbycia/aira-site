import type { Cluster, GalleryPhoto, ReelItem } from "@/components/media/types";

// Placeholder portfolio content. Mixed photo+reel clusters demonstrate the
// layout holding both together. Swap `src`/`poster` for Sanity urlFor() images
// and add `videoSrc` (Bunny) to reels when real media lands — shape is stable.

const P = "/images/placeholders";

// Flat photo list for the column-drift gallery (Variant 1). Round-robins
// across columns inside ColumnDriftGallery — order here is left-to-right,
// top-to-bottom reading order. Swap `src` for Sanity urlFor() output later.
export const PHOTOGRAPHY_PHOTOS: GalleryPhoto[] = [
  { src: `${P}/photo-tall.svg`, alt: "Couple at the altar", caption: "First light, first vow" },
  { src: `${P}/photo-wide.svg`, alt: "Reception dancing", caption: "Into the night" },
  { src: `${P}/photo-square.svg`, alt: "Exchange of rings", caption: "The exchange" },
  { src: `${P}/photo-portrait.svg`, alt: "Portrait of the bride" },
  { src: `${P}/photo-pano.svg`, alt: "The venue at dusk", caption: "The whole story, in one frame" },
  { src: `${P}/photo-square.svg`, alt: "Family portrait" },
  { src: `${P}/photo-portrait.svg`, alt: "Detail of the dress", caption: "Details" },
  { src: `${P}/photo-tall.svg`, alt: "Walking down the aisle" },
  { src: `${P}/photo-wide.svg`, alt: "Mehndi celebration", caption: "Color and joy" },
  { src: `${P}/photo-square.svg`, alt: "First dance" },
  { src: `${P}/photo-portrait.svg`, alt: "Candid laughter" },
  { src: `${P}/photo-pano.svg`, alt: "Backwater sunset", caption: "By the backwaters" },
];

export const PHOTOGRAPHY_CLUSTERS: Cluster[] = [
  {
    id: "vows",
    offset: "left",
    note: "the vows",
    items: [
      { kind: "photo", span: "tall", src: `${P}/photo-tall.svg`, alt: "Couple at the altar", caption: "First light, first vow" },
      { kind: "reel", span: "portrait", poster: `${P}/reel-1.svg`, alt: "Ceremony reel" },
      { kind: "photo", span: "square", src: `${P}/photo-square.svg`, alt: "Exchange of rings", caption: "The exchange" },
    ],
  },
  {
    id: "celebration",
    offset: "right",
    note: "the celebration",
    items: [
      { kind: "photo", span: "wide", src: `${P}/photo-wide.svg`, alt: "Reception dancing", caption: "Into the night" },
      { kind: "photo", span: "portrait", src: `${P}/photo-portrait.svg`, alt: "Portrait of the bride" },
      { kind: "reel", span: "portrait", poster: `${P}/reel-2.svg`, alt: "Highlights reel" },
    ],
  },
  {
    id: "stillness",
    offset: "left",
    note: "the quiet moments",
    items: [
      { kind: "reel", span: "portrait", poster: `${P}/reel-3.svg`, alt: "Getting-ready reel" },
      { kind: "photo", span: "tall", src: `${P}/photo-portrait.svg`, alt: "Detail of the dress", caption: "Details" },
      { kind: "photo", span: "square", src: `${P}/photo-square.svg`, alt: "Family portrait" },
    ],
  },
  {
    id: "panorama",
    offset: "right",
    items: [
      { kind: "photo", span: "pano", src: `${P}/photo-pano.svg`, alt: "The venue at dusk", caption: "The whole story, in one frame" },
    ],
  },
];

export const PHOTOGRAPHY_REELS: ReelItem[] = [
  { kind: "reel", span: "portrait", poster: `${P}/reel-1.svg`, alt: "Wedding film teaser", caption: "Aanya & Rohan" },
  { kind: "reel", span: "portrait", poster: `${P}/reel-4.svg`, alt: "Engagement reel", caption: "The proposal" },
  { kind: "reel", span: "portrait", poster: `${P}/reel-2.svg`, alt: "Sangeet highlights", caption: "Sangeet night" },
  { kind: "reel", span: "portrait", poster: `${P}/reel-5.svg`, alt: "Pre-wedding shoot", caption: "By the backwaters" },
  { kind: "reel", span: "portrait", poster: `${P}/reel-3.svg`, alt: "Reception film", caption: "The reception" },
  { kind: "reel", span: "portrait", poster: `${P}/reel-6.svg`, alt: "Candid moments reel", caption: "Candids" },
];
