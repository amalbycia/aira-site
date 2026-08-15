import Reveal from "@/components/Reveal";
import ReviewMarquee from "@/components/ReviewMarquee";
import type { ReviewItem } from "@/lib/cms/getContent";
import styles from "./Testimonials.module.css";

/** Shown when a page has no reviews in the DB yet. */
const PLACEHOLDER_REVIEWS: ReviewItem[] = [
  {
    reviewerName: "Anitha & Jose",
    rating: 5,
    reviewText:
      "They handled everything — decor, food, photos — and we actually got to enjoy our own wedding. Not one thing went wrong.",
    date: "",
  },
  {
    reviewerName: "Merin K.",
    rating: 5,
    reviewText:
      "The photographs are beautiful, but what stayed with us is how calm they kept the whole day. Genuinely kind people.",
    date: "",
  },
  {
    reviewerName: "Rahul Menon",
    rating: 5,
    reviewText:
      "Booked them for a family function and they treated it like a wedding. The catering was the talk of the evening.",
    date: "",
  },
];

/**
 * Reviews section. When a Google aggregate is passed (events page), it leads
 * with a prominent rating hero — carried over from the pre-redesign behaviour.
 *
 * Falls back to PLACEHOLDER_REVIEWS when the DB has none for this page, so the
 * section never renders empty.
 */
export default function Testimonials({
  reviews,
  googleRating,
  googleReviewCount,
  googleUrl,
}: {
  reviews: ReviewItem[];
  googleRating?: number;
  googleReviewCount?: number;
  googleUrl?: string;
}) {
  const list = reviews && reviews.length > 0 ? reviews : PLACEHOLDER_REVIEWS;
  const shown = list.slice(0, 12);

  return (
    <section className="section section--forest">
      <Reveal className="shell">
        <div className={styles.head}>
          <p className="eyebrow" data-reveal>
            Kind words
          </p>
          <h2 className={`display--lg ${styles.heading}`} data-reveal>
            From the families <span className="accent">we&apos;ve served.</span>
          </h2>
        </div>

        {googleRating ? (
          <div className={styles.ratingHero} data-reveal>
            <span className={styles.ratingValue}>{googleRating}</span>
            <div className={styles.ratingMeta}>
              <Stars rating={googleRating} />
              <p className={styles.ratingCount}>
                {googleReviewCount ? `${googleReviewCount}+ ` : ""}couples &amp;
                families on Google
              </p>
              {googleUrl ? (
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ratingLink}
                >
                  Read the reviews
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              ) : null}
            </div>
          </div>
        ) : null}


      </Reveal>

      {/* Full-bleed review marquee — outside .shell so cards run edge to edge. */}
      <ReviewMarquee reviews={shown} />
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 1.6l2.5 5.1 5.6.8-4 3.9 1 5.6L10 14.4 5 17l1-5.6-4-3.9 5.6-.8L10 1.6Z"
            fill={i < full ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}
