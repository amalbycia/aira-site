import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CateringMenu from "@/components/events/CateringMenu";
import ServicesList from "@/components/events/ServicesList";
import GallerySection from "@/components/media/GallerySection";
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
import { EVENTS_CLUSTERS } from "./clusters";

export const metadata: Metadata = {
  title: "Agnitantra Events & Catering — Full-Service Celebrations",
  description:
    "Agnitantra Events & Catering — decor, stage, catering, light & sound, makeup, cars and entertainment, handled as one team. Nine years of celebrations across Kerala.",
};

// Re-fetch from Sanity at most once a minute so client uploads appear without a
// redeploy (ISR), matching the Photography page.
export const revalidate = 60;

export default async function EventsPage() {
  const [page, reviews, settings] = await Promise.all([
    getPage("events"),
    getReviews("events"),
    getSiteSettings(),
  ]);

  const hasLiveGallery = page.gallery.length > 0;
  const hasLiveReels = page.reels.length > 0;

  const locationLines = page.locationText
    ? [page.locationText]
    : [
        "Based in Kerala — serving weddings and events across the state and beyond.",
        "Tell us your venue; we bring the whole production to you.",
      ];

  return (
    <>
      <main style={{ position: "relative", zIndex: 1 }}>
        <PageHero
          eyebrow="every celebration, in full"
          title="Agnitantra Events & Catering"
          subtitle="Decor, stage, catering, sound, makeup and more — one team handling every detail so your family can simply enjoy the day."
        />

        <CateringMenu />

        <ServicesList />

        {hasLiveGallery ? (
          <ColumnDriftGallery
            eyebrow="moments"
            heading="Events We've Made"
            photos={page.gallery}
            columns={4}
          />
        ) : (
          <GallerySection
            eyebrow="moments"
            heading="Events We've Made"
            clusters={EVENTS_CLUSTERS}
          />
        )}

        {hasLiveReels ? (
          <ReelsStrip eyebrow="in motion" heading="Films & Reels" reels={page.reels} />
        ) : null}

        <TestimonialMarquee
          reviews={reviews}
          googleRating={4.9}
          googleReviewCount={148}
          googleUrl="https://www.google.com/maps?cid=10454241291312957415"
        />

        <LocationBlock
          eyebrow="find us"
          heading="Where We Work"
          lines={locationLines}
        />
      </main>
      <SiteFooter
        {...footerPropsFromSettings(settings, "events")}
        instagramUrl="https://www.instagram.com/agnitantra_events_and_caterers"
      />
    </>
  );
}
