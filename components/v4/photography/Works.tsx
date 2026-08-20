import Image from "next/image";
import type { GalleryPhoto } from "@/components/media/types";
import styles from "@/app/photography/works.module.css";

/* Section 03 — Selected Works.

   An asymmetric editorial collage — five captioned frames at different sizes
   and offsets, like the clustered detail photographs in the FLAMENCO
   reference. Deliberately NOT a uniform grid.

   data-parallax: each figure drifts vertically a few px against the scroll
   (PhotoMotion.tsx) — the value is the drift depth in px, alternating sign so
   neighbours move against each other. Subtle by design.

   Photographs come from the DB (Bunny Storage URLs) via getPage("photography").
   Each frame keeps its own aspect-ratio and the image is cropped to it, so
   real photos of any shape leave the collage's proportions untouched. Frames
   fall back to the grey wireframe blocks when the gallery is empty.

   The button is still a styled placeholder — no destination yet. */

/* `sizes` per slot mirrors the grid spans in works.module.css — without it
   Next serves a full-width source into a 3-column frame. */
const WORKS = [
  {
    num: "01",
    label: "wedding · kottayam",
    cls: "w1",
    drift: 22,
    sizes: "(max-width: 767px) 82vw, 48vw",
  },
  {
    num: "02",
    label: "portrait · kochi",
    cls: "w2",
    drift: -30,
    sizes: "(max-width: 767px) 62vw, 32vw",
  },
  {
    num: "03",
    label: "haldi · changanassery",
    cls: "w3",
    drift: 16,
    sizes: "(max-width: 767px) 52vw, 24vw",
  },
  {
    num: "04",
    label: "reception · thrissur",
    cls: "w4",
    drift: -20,
    sizes: "(max-width: 767px) 58vw, 24vw",
  },
  {
    num: "05",
    label: "couple · varkala",
    cls: "w5",
    drift: 26,
    sizes: "(max-width: 767px) 76vw, 32vw",
  },
] as const;

export default function Works({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className={styles.works}>
      <h2 className={styles.heading} data-reveal>
        <span className={styles.headingNum}>[ 03 ]</span> Selected Works
      </h2>
      <p className={styles.subline} data-reveal>
        [ weddings &amp; portraits, 2018 — ]
      </p>

      <div className={styles.collage}>
        {WORKS.map((w, i) => {
          const photo = photos[i];
          return (
            <figure
              key={w.num}
              className={`${styles.piece} ${styles[w.cls]}`}
              data-reveal
              data-parallax={w.drift}
            >
              <div className={styles.frame}>
                {photo ? (
                  <Image
                    className={styles.photo}
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes={w.sizes}
                    loading="lazy"
                  />
                ) : (
                  <span aria-hidden="true">image — {w.num}</span>
                )}
              </div>
              <figcaption className={styles.caption}>
                ( {w.num} ) — {w.label}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* Destination not wired yet — becomes a link when James places the
          full gallery. */}
      <p className={styles.moreLine} data-reveal>
        <button type="button" className={styles.moreBtn} data-draw-line>
          view the full gallery
          <span className={styles.moreArrow} aria-hidden="true">
            →
          </span>
          <span data-draw-line-box aria-hidden="true" />
        </button>
      </p>
    </div>
  );
}
