import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/structuredData";
import styles from "./page.module.css";

/* ─────────────────────────────────────────────────────────────────────────────
   v4 clean slate — Aira Photography.

   Four empty full-height sections. No nav, no cursor, no grain — chrome is
   gated off this route in components/SiteChrome.tsx.

   Metadata and breadcrumb JSON-LD are KEPT: they are design-independent SEO on
   a live domain. The ImageGallery schema was dropped with the gallery and comes
   back when the v4 design says where photos live.

   The v3 page (PageHero / GalleryWithLightbox / ReelsStrip / Testimonials /
   LocationBlock / SiteFooter) is untouched in components/ and on the
   v3-maroon-cinema tag:
     git checkout v3-maroon-cinema -- app/photography/page.tsx
   ───────────────────────────────────────────────────────────────────────── */

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

export default function PhotographyPage() {
  const schema = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Photography", path: "/photography" },
    ]),
  ].filter(Boolean) as Record<string, unknown>[];

  return (
    <>
      <JsonLd data={schema} />
      <main className={styles.slate}>
        <section className={styles.section} id="section-1" />
        <section className={styles.section} id="section-2" />
        <section className={styles.section} id="section-3" />
        <section className={styles.section} id="section-4" />
      </main>
    </>
  );
}
