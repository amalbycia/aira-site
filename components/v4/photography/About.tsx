import styles from "@/app/photography/about.module.css";

/* Section 02 — About Us.

   Editorial, after the FLAMENCO reference: a bracket-numbered heading, a
   bracketed subline, body copy set as STAGGERED indented blocks (no two
   paragraphs share a left edge), and a captioned image stack on the right.

   Grey boxes are wireframe placeholders — James supplies the photography.

   The falling rose petals are NOT here: they live in PetalField, which wraps
   this section and Selected Works together so a petal can fall across both.
   See components/v4/photography/PetalField.tsx. */

export default function About() {
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
            Aira began in 2018 in Changanassery, with one camera and one
            conviction — that a wedding is not an event to be staged, but a
            story already unfolding.
          </p>
          <p className={`${styles.para} ${styles.para2}`} data-reveal>
            Nine years on, we photograph weddings and portraits across Kerala —
            Kottayam, Kochi, Thiruvananthapuram — the same way we did the
            first: quietly, patiently, close enough to feel it.
          </p>
          <p className={`${styles.para} ${styles.para3}`} data-reveal>
            Founded by Amal Sebastian Kalarickal, the studio works in film and
            digital, in colour and in silver — whatever the moment asks for.
          </p>
        </div>

        <div className={styles.figures}>
          <figure className={styles.figureMain} data-reveal>
            <div className={styles.frame} aria-hidden="true">
              portrait — image
            </div>
            <figcaption className={styles.caption}>
              ( i ) — the studio, chethipuzha kadavu
            </figcaption>
          </figure>
          <figure className={styles.figureSmall} data-reveal>
            <div className={styles.frame} aria-hidden="true">
              detail — image
            </div>
            <figcaption className={styles.caption}>
              ( ii ) — on film
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
