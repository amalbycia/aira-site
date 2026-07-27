import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import AboutStory from "@/components/about/AboutStory";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "About Us — Aira Photography & Agnitantra Events, Kerala",
  description:
    "Founded in 2018 by Amal Sebastian Kalarickal, Aira Photography & Agnitantra Events & Caterers is a full-service event and wedding-photography team — nine years of weddings and celebrations across Kerala.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us — Aira Photography & Agnitantra Events",
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
      <main style={{ position: "relative", zIndex: 1 }}>
        <PageHero
          eyebrow="our story"
          title="One Team, Every Detail"
          subtitle="Founded in 2018 by Amal Sebastian Kalarickal — bringing creative artistry and full-service event management together under one roof."
        />

        <AboutStory />
      </main>
      <SiteFooter />
    </>
  );
}
