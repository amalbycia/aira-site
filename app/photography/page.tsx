import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import GalleryWithLightbox from "@/components/media/GalleryWithLightbox";
import ReelsStrip from "@/components/media/ReelsStrip";
import Testimonials from "@/components/Testimonials";
import LocationBlock from "@/components/LocationBlock";
import SiteFooter from "@/components/SiteFooter";
import { getPage } from "@/lib/cms/getPage";
import { getReviews } from "@/lib/cms/getContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, imageGallerySchema } from "@/lib/structuredData";
import { PHOTOGRAPHY_PHOTOS, PHOTOGRAPHY_REELS } from "./clusters";

export const metadata: Metadata = {
  title: "Wedding Photography in Kerala — Aira Photography",
  description:
    "Aira Photography — timeless wedding and portrait photography and cinematography across Kerala. Nine years capturing weddings in Changanassery, Kottayam, Kochi and beyond.",
  keywords: [
    "wedding photography Kerala",
    "best wedding photographer Kerala",
    "wedding photographer Changanassery",
    "wedding photographer Kottayam",
    "candid wedding photography Kerala",
    "wedding cinematography Kerala",
  ],
  alternates: { canonical: "/photography" },
  openGraph: {
    title: "Wedding Photography in Kerala — Aira Photography",
    description:
      "Timeless wedding and portrait photography and cinematography across Kerala — nine years of craft.",
    url: "/photography",
    type: "website",
  },
};

// Re-fetch at most once a minute, so the client's new uploads appear without a
// redeploy (ISR). Lower for snappier edits, raise to cache harder.
export const revalidate = 60;

export default async function PhotographyPage() {
  // Pull the gallery from Neon; fall back to placeholders until the client has
  // uploaded photos in /manage (or if the DB is unreachable).
  const [page, reviews] = await Promise.all([
    getPage("photography"),
    getReviews("photography"),
  ]);
  const photos = page.gallery.length > 0 ? page.gallery : PHOTOGRAPHY_PHOTOS;
  const reels = page.reels.length > 0 ? page.reels : PHOTOGRAPHY_REELS;

  // Structured data: breadcrumb + an ImageGallery of the portfolio (each photo
  // an ImageObject crediting Aira) — drives Google Images / visual-search reach.
  const schema = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Photography", path: "/photography" },
    ]),
    imageGallerySchema(
      photos.map((p) => ({ src: p.src, alt: p.alt })),
      { name: "Aira Photography — Wedding Portfolio", pagePath: "/photography" },
    ),
  ].filter(Boolean) as Record<string, unknown>[];

  // Location is hardcoded (not admin-managed).
  const locationLines = [
    "Based in Kerala — available across India and beyond.",
    "Destination weddings welcome; we travel for the right story.",
  ];

  return (
    <>
      <JsonLd data={schema} />
      <main>
        <PageHero
          eyebrow="Captured in light"
          title="Aira Photography"
          subtitle="Weddings, portraits and the moments between — told in stills and film, with nine years behind the lens."
          image="/images/about-4.webp"
          imageAlt="A wedding moment captured by Aira Photography"
        />

        <GalleryWithLightbox
          eyebrow="The gallery"
          heading="Stories, frame by frame"
          photos={photos}
        />

        <ReelsStrip eyebrow="In motion" heading="Films and reels" reels={reels} />

        <Testimonials
          reviews={reviews}
          googleRating={4.9}
          googleReviewCount={148}
          googleUrl="https://www.google.com/maps?cid=10454241291312957415"
        />

        <LocationBlock
          eyebrow="Find us"
          heading="Where we shoot"
          lines={locationLines}
        />
      </main>
      <SiteFooter instagramUrl="https://www.instagram.com/aira__photography_" />
    </>
  );
}
