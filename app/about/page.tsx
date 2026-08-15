import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import AboutStory from "@/components/about/AboutStory";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "About Us — Aira Photography and Agnitantra Events, Kerala",
  description:
    "Founded in 2018 by Amal Sebastian Kalarickal, Aira Photography and Agnitantra Events and Caterers is a full-service event and wedding-photography team — nine years of weddings and celebrations across Kerala.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us — Aira Photography and Agnitantra Events",
    description:
      "A full-service wedding photography and event management team in Kerala, founded in 2018 by Amal Sebastian Kalarickal.",
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <main>
        <PageHero
          eyebrow="Our story"
          title="One team, every detail"
          subtitle="Founded in 2018 by Amal Sebastian Kalarickal — bringing creative artistry and full-service event management together under one roof."
          image="/images/hero-tile-3.webp"
          imageAlt="The Aira Photography and Agnitantra Events team at work"
        />

        <AboutStory />
      </main>
      <SiteFooter />
    </>
  );
}
