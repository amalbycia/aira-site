import styles from "@/app/photography/works.module.css";

/* Section 03 — Selected Works.

   An asymmetric editorial collage — five captioned frames at different sizes
   and offsets, like the clustered detail photographs in the FLAMENCO
   reference. Deliberately NOT a uniform grid.

   data-parallax: each figure drifts vertically a few px against the scroll
   (PhotoMotion.tsx) — the value is the drift depth in px, alternating sign so
   neighbours move against each other. Subtle by design.

   Grey boxes are wireframe placeholders; the real gallery returns through
   lib/cms/getPage.ts once James places the photography. The button is a
   styled placeholder — no destination yet. */

const WORKS = [
  { num: "01", label: "wedding · kottayam", cls: "w1", drift: 22 },
  { num: "02", label: "portrait · kochi", cls: "w2", drift: -30 },
  { num: "03", label: "haldi · changanassery", cls: "w3", drift: 16 },
  { num: "04", label: "reception · thrissur", cls: "w4", drift: -20 },
  { num: "05", label: "couple · varkala", cls: "w5", drift: 26 },
] as const;

export default function Works() {
  return (
    <div className={styles.works}>
      <h2 className={styles.heading} data-reveal>
        <span className={styles.headingNum}>[ 03 ]</span> Selected Works
      </h2>
      <p className={styles.subline} data-reveal>
        [ weddings &amp; portraits, 2018 — ]
      </p>

      <div className={styles.collage}>
        {WORKS.map((w) => (
          <figure
            key={w.num}
            className={`${styles.piece} ${styles[w.cls]}`}
            data-reveal
            data-parallax={w.drift}
          >
            <div className={styles.frame} aria-hidden="true">
              image — {w.num}
            </div>
            <figcaption className={styles.caption}>
              ( {w.num} ) — {w.label}
            </figcaption>
          </figure>
        ))}
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
