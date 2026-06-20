import type { Cluster } from "@/components/media/types";

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
