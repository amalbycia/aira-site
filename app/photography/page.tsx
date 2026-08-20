import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/v4/photography/Hero";
import RosesDivider from "@/components/v4/photography/RosesDivider";
import About from "@/components/v4/photography/About";
import PetalField from "@/components/v4/photography/PetalField";
import Works from "@/components/v4/photography/Works";
import Reviews from "@/components/v4/photography/Reviews";
import FooterRoses from "@/components/v4/photography/FooterRoses";
import Footer from "@/components/v4/photography/Footer";
import PhotoMotion from "@/components/v4/photography/PhotoMotion";
import DrawUnderline from "@/components/v4/photography/DrawUnderline";
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
      {/* Raise the preload gate BEFORE first paint, so the page never shows
          through the preloader — not even for one frame on a slow connection
          where hydration lags the HTML. app/v4.css hides <main> and locks
          scroll while the flag is set; PhotoMotion clears it as the sheet
          lifts.

          The failsafe timer is the important half: if JS fails to load, the
          bundle errors, or PhotoMotion never mounts, the flag would leave
          the page permanently blank. Clearing it after 6s guarantees the
          content always appears. Reduced motion skips the gate entirely. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var d=document.documentElement;d.setAttribute('data-loading','true');
setTimeout(function(){d.removeAttribute('data-loading')},6000);
}catch(e){}})();`,
        }}
      />
      {/* The paper texture is a CSS background on every section, so the
          browser only discovers it after the stylesheet resolves. Preloading
          it during the preloader's ~3s means the sheet is already textured
          when it is revealed, instead of flashing flat beige first. */}
      <link
        rel="preload"
        as="image"
        href="/images/v4-paper.webp"
        type="image/webp"
      />
      <JsonLd data={schema} />
      <main className={styles.slate}>
        <section className={styles.section} id="section-1">
          <div
            className={`${styles.paper} ${styles.paper1}`}
            aria-hidden="true"
          />
          <Hero />
        </section>

        <RosesDivider />

        {/* Petals fall across BOTH of these sections, so the field wraps the
            pair — inside either one they would be clipped at its boundary. */}
        <PetalField>
          <section className={styles.section} id="about">
            <div
              className={`${styles.paper} ${styles.paper2}`}
              aria-hidden="true"
            />
            <About />
          </section>

          <section className={styles.section} id="works">
            <div
              className={`${styles.paper} ${styles.paper3}`}
              aria-hidden="true"
            />
            <Works />
          </section>
        </PetalField>

        <section className={styles.section} id="reviews">
          <div
            className={`${styles.paper} ${styles.paper4}`}
            aria-hidden="true"
          />
          <Reviews />
        </section>

        {/* Garland border above the footer. In normal flow — it takes its own
            height so it can never cover the footer's contact details. */}
        <FooterRoses />
        <Footer />
      </main>

      {/* Client-side motion layer: preloader + reveals + parallax, and the
          drawn hover underlines. All of it degrades to the static page
          without JS or with reduced motion. */}
      <PhotoMotion />
      <DrawUnderline />
    </>
  );
}
