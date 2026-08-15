import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CateringMenu from "@/components/events/CateringMenu";
import ServicesList from "@/components/events/ServicesList";
import GalleryWithLightbox from "@/components/media/GalleryWithLightbox";
import ReelsStrip from "@/components/media/ReelsStrip";
import Testimonials from "@/components/Testimonials";
import LocationBlock from "@/components/LocationBlock";
import SiteFooter from "@/components/SiteFooter";
import StatStrip from "@/components/StatStrip";
import { getPage } from "@/lib/cms/getPage";
import { getReviews, getMenu } from "@/lib/cms/getContent";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  imageGallerySchema,
  faqSchema,
} from "@/lib/structuredData";
import { EVENTS_PHOTOS } from "./clusters";

export const metadata: Metadata = {
  title: "Event Management and Catering in Kerala — Agnitantra Events",
  description:
    "Agnitantra Events and Caterers — the best event management in Kerala. Decor, stage, catering, light and sound, makeup, cars and entertainment handled as one team. Nine years of weddings and celebrations across Kerala.",
  keywords: [
    "event management Kerala",
    "best event management in Kerala",
    "wedding planner Kerala",
    "catering services Kerala",
    "event management Changanassery",
    "wedding decor Kerala",
  ],
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Event Management and Catering in Kerala — Agnitantra Events",
    description:
      "Full-service event management across Kerala — decor, stage, catering, sound, makeup and more, handled as one team.",
    url: "/events",
    type: "website",
  },
};

// FAQ — targets common local queries and feeds FAQ rich results + AI answers.
const EVENTS_FAQ = [
  {
    q: "What areas in Kerala does Agnitantra Events serve?",
    a: "Agnitantra Events and Caterers is based in Changanassery and serves weddings and events across Kerala — including Kottayam, Kochi, Thiruvananthapuram and Thrissur — and travels for destination events.",
  },
  {
    q: "What services does Agnitantra Events provide?",
    a: "We handle every part of a celebration as one team: wedding photography and cinematography (Aira Photography), stage decoration, catering, light and sound, stage programs, makeup artistry, car rentals and entertainment.",
  },
  {
    q: "How long has Agnitantra Events been operating?",
    a: "Founded in 2018 by Amal Sebastian Kalarickal, the team has nine years of experience delivering weddings and events across Kerala.",
  },
  {
    q: "Does Agnitantra provide both photography and event management?",
    a: "Yes. Aira Photography and Agnitantra Events and Caterers are one team, so photography, videography and full event management are coordinated together under one roof.",
  },
];

// Re-fetch at most once a minute so client edits appear without a redeploy (ISR).
export const revalidate = 60;

export default async function EventsPage() {
  const [page, reviews, menu] = await Promise.all([
    getPage("events"),
    getReviews("events"),
    getMenu(),
  ]);

  // Owner-editable copy from /manage → Events → Page Content. Every value falls
  // back to the built-in wording when the field is blank.
  const c = page.content;

  const photos = page.gallery.length > 0 ? page.gallery : EVENTS_PHOTOS;
  const hasLiveReels = page.reels.length > 0;

  // Structured data: breadcrumb, FAQ (rich results + AI answers), and an
  // ImageGallery of the live event photos when present.
  const schema = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Events", path: "/events" },
    ]),
    faqSchema(EVENTS_FAQ),
    imageGallerySchema(
      photos.map((p) => ({ src: p.src, alt: p.alt })),
      { name: "Agnitantra Events — Celebrations", pagePath: "/events" },
    ),
  ].filter(Boolean) as Record<string, unknown>[];

  // Location is hardcoded (not admin-managed).
  const locationLines = [
    "Based in Kerala — serving weddings and events across the state and beyond.",
    "Tell us your venue; we bring the whole production to you.",
  ];

  return (
    <>
      <JsonLd data={schema} />
      <main>
        <PageHero
          eyebrow={c.heroEyebrow ?? "Every celebration, in full"}
          title={c.heroTitle ?? "Agnitantra Events and Caterers"}
          subtitle={
            c.heroSubtitle ??
            "Decor, stage, catering, sound, makeup and more — one team handling every detail so your family can simply enjoy the day."
          }
          image="/images/hero-tile-1.webp"
          imageAlt="A celebration produced by Agnitantra Events and Caterers"
        />

        {c.stats.length > 0 ? <StatStrip stats={c.stats} /> : null}

        <ServicesList
          eyebrow="What we do"
          heading={c.servicesHeading ?? "Everything, under one roof."}
        />

        <GalleryWithLightbox
          eyebrow="Moments"
          heading={c.galleryHeading ?? "Celebrations we've made"}
          photos={photos}
        />

        {hasLiveReels ? (
          <ReelsStrip
            eyebrow="In motion"
            heading={c.reelsHeading ?? "Films and reels"}
            reels={page.reels}
          />
        ) : null}

        <CateringMenu
          categories={menu}
          heading={c.menuHeading ?? "A menu worth staying for."}
        />

        <Testimonials
          reviews={reviews}
          googleRating={4.9}
          googleReviewCount={148}
          googleUrl="https://www.google.com/maps?cid=10454241291312957415"
        />

        <LocationBlock
          eyebrow="Find us"
          heading="Where we work"
          lines={locationLines}
        />
      </main>
      <SiteFooter instagramUrl="https://www.instagram.com/agnitantra_events_and_caterers" />
    </>
  );
}
