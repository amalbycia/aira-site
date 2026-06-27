import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ColumnDriftGallery from "@/components/media/ColumnDriftGallery";
import ReelsStrip from "@/components/media/ReelsStrip";
import TestimonialMarquee from "@/components/events/TestimonialMarquee";
import LocationBlock from "@/components/LocationBlock";
import SiteFooter from "@/components/SiteFooter";
import { getPage } from "@/sanity/lib/getPage";
import {
  getReviews,
  getSiteSettings,
  footerPropsFromSettings,
} from "@/sanity/lib/getContent";
import { PHOTOGRAPHY_PHOTOS, PHOTOGRAPHY_REELS } from "./clusters";

export const metadata: Metadata = {
  title: "Aira Photography — Wedding & Portrait Films",
  description:
    "Aira Photography — wedding and portrait storytelling. Photos and films, captured with nine years of craft.",
};

// Re-fetch from Sanity at most once a minute, so the client's new uploads
// appear without a redeploy (ISR). Lower for snappier edits, raise to cache harder.
export const revalidate = 60;

export default async function PhotographyPage() {
  // Pull the gallery from Sanity; fall back to placeholders until the client
  // has uploaded photos in /studio (or if Sanity is unreachable).
  const [page, reviews, settings] = await Promise.all([
    getPage("photography"),
    getReviews("photography"),
    getSiteSettings(),
  ]);
  const photos = page.gallery.length > 0 ? page.gallery : PHOTOGRAPHY_PHOTOS;
  const reels = page.reels.length > 0 ? page.reels : PHOTOGRAPHY_REELS;

  const locationLines = page.locationText
    ? [page.locationText]
    : [
        "Based in Kerala — available across India and beyond.",
        "Destination weddings welcome; we travel for the right story.",
      ];

  return (
    <>
      <main style={{ position: "relative", zIndex: 1 }}>
        <PageHero
          eyebrow="captured in light"
          title="Aira Photography"
          subtitle="Weddings, portraits and the moments between — told in stills and film, with nine years behind the lens."
        />

        <ColumnDriftGallery
          eyebrow="the gallery"
          heading="Stories, Frame by Frame"
          photos={photos}
          columns={4}
        />

        <ReelsStrip
          eyebrow="in motion"
          heading="Films & Reels"
          reels={reels}
        />

        <TestimonialMarquee
          reviews={reviews}
          eyebrow="kind words"
          heading="What Couples Say"
          googleRating={4.9}
          googleReviewCount={148}
          googleUrl="https://www.google.com/maps?cid=10454241291312957415"
        />

        <LocationBlock
          eyebrow="find us"
          heading="Where We Shoot"
          lines={locationLines}
        />
      </main>
      <SiteFooter
        {...footerPropsFromSettings(settings, "photography")}
        instagramUrl="https://www.instagram.com/aira__photography_"
      />
    </>
  );
}
