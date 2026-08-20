import Image from "next/image";
import type { GalleryPhoto } from "@/components/media/types";
import styles from "@/app/photography/about.module.css";

/* Section 02 — About Us.

   Editorial, after the FLAMENCO reference: a bracket-numbered heading, a
   bracketed subline, body copy set as STAGGERED indented blocks (no two
   paragraphs share a left edge), and a captioned image stack on the right.

   The photographs drift inside their frames on scroll (data-parallax on the
   Image, not the figure) — the stack holds its position and only the crop
   moves. The two figures take real photographs from the DB (Bunny Storage URLs) via
   getPage("photography"); they fall back to the grey wireframe blocks when
   the gallery is empty, so the stack never collapses.

   The falling rose petals are NOT here: they live in PetalField, which wraps
   this section and Selected Works together so a petal can fall across both.
   See components/v4/photography/PetalField.tsx. */

export default function About({ photos }: { photos: GalleryPhoto[] }) {
  const [main, small] = photos;
  return (
    <div className={styles.about}>
      <h2 className={styles.heading} data-reveal>
        <span className={styles.headingNum}>[ 02 ]</span> About Us
      </h2>
      <p className={styles.subline} data-reveal>
        [ est. 2018 — changanassery, kerala ]
      </p>

      <div className={styles.body}>
        <div className={styles.copy}>
          <p className={`${styles.para} ${styles.para1}`} data-reveal>
            Aira began in 2018 in Changanassery, with one camera and one conviction — that a wedding
            is not an event to be staged, but a story already unfolding.
          </p>
          <p className={`${styles.para} ${styles.para2}`} data-reveal>
            Nine years on, we photograph weddings and portraits across Kerala — Kottayam, Kochi,
            Thiruvananthapuram — the same way we did the first: quietly, patiently, close enough to
            feel it.
          </p>
          <p className={`${styles.para} ${styles.para3}`} data-reveal>
            Founded by Amal Sebastian Kalarickal, the studio works in film and digital, in colour
            and in silver — whatever the moment asks for.
          </p>
        </div>

        <div className={styles.figures}>
          <figure className={styles.figureMain} data-reveal>
            <div className={styles.frame}>
              {main ? (
                <Image
                  className={styles.photo}
                  src={main.src}
                  alt={main.alt}
                  fill
                  sizes="(max-width: 767px) 70vw, 30vw"
                  quality={82}
                  loading="lazy"
                  data-parallax={18}
                />
              ) : (
                <span aria-hidden="true">portrait — image</span>
              )}
            </div>
            <figcaption className={styles.caption}>
              ( i ) — the studio, chethipuzha kadavu
            </figcaption>
          </figure>
          <figure className={styles.figureSmall} data-reveal>
            <div className={styles.frame}>
              {small ? (
                <Image
                  className={styles.photo}
                  src={small.src}
                  alt={small.alt}
                  fill
                  sizes="(max-width: 767px) 40vw, 17vw"
                  quality={82}
                  loading="lazy"
                  data-parallax={-24}
                />
              ) : (
                <span aria-hidden="true">detail — image</span>
              )}
            </div>
            <figcaption className={styles.caption}>( ii ) — on film</figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
