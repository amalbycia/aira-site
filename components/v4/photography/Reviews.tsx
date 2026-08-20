import { BUSINESS } from "@/lib/site";
import styles from "@/app/photography/reviews.module.css";

/* Section 04 — Kind Words.

   The REAL Google aggregate leads the section: an oversized rating figure,
   the star row, and the review count — all straight from lib/site.ts, never
   retyped. Then one big editorial pull-quote, two staggered smaller ones,
   and a bordered "view on google" button to the live listing.

   QUOTE TEXT IS PLACEHOLDER COPY — the real reviews live in the database and
   return through lib/cms/getContent.ts once James wires them. */

export default function Reviews() {
  return (
    <div className={styles.reviews}>
      <h2 className={styles.heading} data-reveal>
        <span className={styles.headingNum}>[ 04 ]</span> Kind Words
      </h2>

      <div className={styles.ratingBlock} data-reveal>
        <p className={styles.ratingNum}>{BUSINESS.ratingValue}</p>
        <p className={styles.ratingStars} aria-hidden="true">
          ★ ★ ★ ★ ★
        </p>
        <p className={styles.ratingLabel}>
          from {BUSINESS.reviewCount} google reviews
        </p>
      </div>

      <blockquote className={styles.lead} data-reveal>
        <p className={styles.leadText}>
          They were invisible until the photographs arrived — and then we saw
          everything we had missed.
        </p>
        <cite className={styles.cite}>— n &amp; a, wedding · kottayam</cite>
      </blockquote>

      <div className={styles.pair}>
        <blockquote
          className={`${styles.small} ${styles.smallLeft}`}
          data-reveal
        >
          <p className={styles.smallText}>
            Every frame feels like it was made by someone who loves weddings.
          </p>
          <cite className={styles.cite}>— s., portrait session · kochi</cite>
        </blockquote>

        <blockquote
          className={`${styles.small} ${styles.smallRight}`}
          data-reveal
        >
          <p className={styles.smallText}>
            Three years later, the album still makes my mother cry.
          </p>
          <cite className={styles.cite}>— m &amp; r, wedding · thrissur</cite>
        </blockquote>
      </div>

      <p className={styles.googleLine} data-reveal>
        <a
          className={styles.googleBtn}
          href={BUSINESS.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-draw-line
        >
          view on google
          <span className={styles.googleArrow} aria-hidden="true">
            ↗
          </span>
          <span data-draw-line-box aria-hidden="true" />
        </a>
      </p>
    </div>
  );
}
