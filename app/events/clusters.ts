import type { Cluster, GalleryPhoto } from "@/components/media/types";

// Events portfolio placeholders — decor, stage, catering moments. Mixed
// photo+reel clusters, same model as photography. Swap for Sanity/Bunny later.
const P = "/images/placeholders";

export const EVENTS_CLUSTERS: Cluster[] = [
  {
    id: "stage",
    offset: "left",
    note: "the setting",
    items: [
      { kind: "photo", span: "wide", src: `${P}/photo-wide.svg`, alt: "Decorated wedding stage", caption: "Stage & decor" },
      { kind: "reel", span: "portrait", poster: `${P}/reel-4.svg`, alt: "Setup time-lapse reel" },
      { kind: "photo", span: "square", src: `${P}/photo-square.svg`, alt: "Floral mandap detail" },
    ],
  },
  {
    id: "feast",
    offset: "right",
    note: "the feast",
    items: [
      { kind: "reel", span: "portrait", poster: `${P}/reel-5.svg`, alt: "Live counter reel" },
      { kind: "photo", span: "tall", src: `${P}/photo-tall.svg`, alt: "Banana-leaf sadya", caption: "The sadya" },
      { kind: "photo", span: "portrait", src: `${P}/photo-portrait.svg`, alt: "Dessert spread" },
    ],
  },
];

/**
 * Flat gallery fallback for the Events page, used until the owner uploads real
 * event photos in /manage (the events gallery is empty in the DB today, while
 * photography has 40). Uses the real local imagery rather than SVG stand-ins so
 * the page looks finished out of the box.
 */
export const EVENTS_PHOTOS: GalleryPhoto[] = [
  { src: "/images/about-4.webp", alt: "Decorated wedding stage by Agnitantra Events" },
  { src: "/images/about-3.webp", alt: "Celebration set up by Agnitantra Events" },
  { src: "/images/about-1.webp", alt: "Wedding celebration in Kerala" },
  { src: "/images/about-2.webp", alt: "Event moment captured by Aira Photography" },
  { src: "/images/hero-tile-1.webp", alt: "Wedding decor detail" },
  { src: "/images/hero-tile-2.webp", alt: "Celebration guests and family" },
  { src: "/images/hero-tile-3.webp", alt: "Stage and lighting setup" },
  { src: "/images/hero-tile-4.webp", alt: "Catering and dining setup" },
];
