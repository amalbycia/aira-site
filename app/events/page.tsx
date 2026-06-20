import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CateringMenu from "@/components/events/CateringMenu";
import ServicesList from "@/components/events/ServicesList";
import GallerySection from "@/components/media/GallerySection";
import TestimonialMarquee from "@/components/events/TestimonialMarquee";
import LocationBlock from "@/components/LocationBlock";
import SiteFooter from "@/components/SiteFooter";
import { EVENTS_CLUSTERS } from "./clusters";

export const metadata: Metadata = {
  title: "Agnitantra Events & Catering — Full-Service Celebrations",
  description:
    "Agnitantra Events & Catering — decor, stage, catering, light & sound, makeup, cars and entertainment, handled as one team. Nine years of celebrations across Kerala.",
};

export default function EventsPage() {
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

        <GallerySection
          eyebrow="moments"
          heading="Events We've Made"
          clusters={EVENTS_CLUSTERS}
        />

        <TestimonialMarquee />

        <LocationBlock
          eyebrow="find us"
          heading="Where We Work"
          lines={[
            "Based in Kerala — serving weddings and events across the state and beyond.",
            "Tell us your venue; we bring the whole production to you.",
          ]}
        />
      </main>
      <SiteFooter />
    </>
  );
}
