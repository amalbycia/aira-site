import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import AboutStory from "@/components/about/AboutStory";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings, footerPropsFromSettings } from "@/sanity/lib/getContent";

export const metadata: Metadata = {
  title: "About — Aira Photography & Agnitantra Events",
  description:
    "Founded in 2018 by Amal Sebastian Kalarickal, Aira Photography & Agnitantra Events & Caterers is a full-service event and visual-storytelling team — nine years of weddings and celebrations across Kerala.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <main style={{ position: "relative", zIndex: 1 }}>
        <PageHero
          eyebrow="our story"
          title="One Team, Every Detail"
          subtitle="Founded in 2018 by Amal Sebastian Kalarickal — bringing creative artistry and full-service event management together under one roof."
        />

        <AboutStory />
      </main>
      <SiteFooter {...footerPropsFromSettings(settings)} />
    </>
  );
}
