import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import GalleryGrid from "@/components/v4/gallery/GalleryGrid";
import DrawUnderline from "@/components/v4/photography/DrawUnderline";
import { getPage } from "@/lib/cms/getPage";
import { breadcrumbSchema } from "@/lib/structuredData";
import styles from "./gallery.module.css";

/* /gallery — the full photograph archive.

   Every image is served from Bunny Storage via getPage("photography") — the
   same source /photography draws from, so the two can never drift apart and
   nothing is hardcoded. Order follows sort_order in /manage.

   Chrome is gated off this route in components/SiteChrome.tsx (BARE_ROUTES),
   so it inherits the v4 isolation layer rather than the v3 nav and cursor. */

export const metadata: Metadata = {
  title: "Gallery — Aira Photography",
  description:
    "The full archive of wedding and portrait photography by Aira Photography — weddings across Changanassery, Kottayam, Kochi and Kerala.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery — Aira Photography",
    description: "The full archive of wedding and portrait photography by Aira Photography.",
    url: "/gallery",
    type: "website",
  },
};

// Matches /photography: photos added in /manage appear without a redeploy.
export const revalidate = 60;

export default async function GalleryPage() {
  const { gallery } = await getPage("photography");

  const schema = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Photography", path: "/photography" },
      { name: "Gallery", path: "/gallery" },
    ]),
  ].filter(Boolean) as Record<string, unknown>[];

  return (
    <>
      <JsonLd data={schema} />
      <main className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.head}>
            <h1 className={styles.title}>Gallery</h1>
            <Link href="/photography" className={styles.back} data-draw-line>
              ← back
              <span data-draw-line-box aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.count}>
            {gallery.length} photograph{gallery.length === 1 ? "" : "s"}
          </p>

          <GalleryGrid photos={gallery} />
        </div>
      </main>
      <DrawUnderline />
    </>
  );
}
