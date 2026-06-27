"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

// Placeholder reviews, tasteful and Kerala-wedding in tone. Shape mirrors the
// Sanity `review` schema (reviewerName / rating / reviewText / date). Used as a
// fallback when the page passes no live reviews.
type Review = { reviewerName: string; rating: number; reviewText: string; date: string };

const PLACEHOLDER_REVIEWS: Review[] = [
  {
    reviewerName: "Meera & Arjun",
    rating: 5,
    reviewText:
      "Agnitantra handled our wedding end to end — decor, catering, stage, the works. Not one thing slipped. We actually enjoyed our own day.",
    date: "Mar 2026",
  },
  {
    reviewerName: "Fathima Rasheed",
    rating: 5,
    reviewText:
      "The sadya was the talk of the function. Guests are still messaging me about the food. Warm, professional team throughout.",
    date: "Feb 2026",
  },
  {
    reviewerName: "Tony Mathew",
    rating: 5,
    reviewText:
      "Booked them for stage, light & sound and the dancers for our reception. The production quality was honestly beyond what we expected for the budget.",
    date: "Jan 2026",
  },
  {
    reviewerName: "Anjali Nair",
    rating: 5,
    reviewText:
      "Aira's photography is stunning, but it's the coordination that won us over. Makeup, cars, timeline — every vendor was on the same page.",
    date: "Dec 2025",
  },
  {
    reviewerName: "Rahul Pillai",
    rating: 5,
    reviewText:
      "Nine years of experience really shows. Calm under pressure, nothing rattled them even when the rain started. Highly recommend.",
    date: "Nov 2025",
  },
  {
    reviewerName: "Sreelakshmi V.",
    rating: 5,
    reviewText:
      "From the first meeting to the last guest leaving, completely stress-free. Amal and the team treat your event like their own.",
    date: "Oct 2025",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="tm-card__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M7 0.7L8.8 4.9L13.3 5.2L9.8 8.1L11 12.5L7 10L3 12.5L4.2 8.1L0.7 5.2L5.2 4.9L7 0.7Z"
            fill={i < rating ? "#c9a96e" : "rgba(201,169,110,0.28)"}
          />
        </svg>
      ))}
    </span>
  );
}

function Card({ review }: { review: Review }) {
  return (
    <figure className="tm-card">
      <Stars rating={review.rating} />
      <blockquote className="tm-card__text">{review.reviewText}</blockquote>
      <figcaption className="tm-card__meta">
        <span className="tm-card__name">{review.reviewerName}</span>
        <span className="tm-card__date">{review.date}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Horizontal testimonial marquee. A GSAP loop scrolls a doubled track from
 * right to left, wrapping seamlessly; hovering pauses it. Honors
 * prefers-reduced-motion by rendering a static, horizontally-scrollable wrap
 * instead of an auto-running loop.
 */
export default function TestimonialMarquee({
  reviews,
  eyebrow = "kind words",
  heading = "What Families Say",
  googleRating,
  googleReviewCount,
  googleUrl,
}: {
  /** Live reviews from Sanity; falls back to placeholders when empty/omitted. */
  reviews?: Review[];
  eyebrow?: string;
  heading?: string;
  /** Verified Google aggregate — shows a rating band above the marquee. */
  googleRating?: number;
  googleReviewCount?: number;
  googleUrl?: string;
} = {}) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const data = reviews && reviews.length > 0 ? reviews : PLACEHOLDER_REVIEWS;
  const showBand = Boolean(googleRating && googleReviewCount);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        track.style.overflowX = "auto";
        return;
      }

      // The track contains two copies of the card list; animate one list-width
      // left, then wrap with modifiers for a seamless loop.
      const half = track.scrollWidth / 2;
      const tween = gsap.to(track, {
        x: -half,
        duration: 40,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: (x) => {
            const v = parseFloat(x);
            return `${v % half}px`;
          },
        },
      });

      const pause = () => tween.pause();
      const play = () => tween.play();
      track.addEventListener("mouseenter", pause);
      track.addEventListener("mouseleave", play);
      track.addEventListener("focusin", pause);
      track.addEventListener("focusout", play);

      return () => {
        track.removeEventListener("mouseenter", pause);
        track.removeEventListener("mouseleave", play);
        track.removeEventListener("focusin", pause);
        track.removeEventListener("focusout", play);
        tween.kill();
      };
    },
    { scope: rootRef, dependencies: [data.length] },
  );

  return (
    <section ref={rootRef} aria-label="What our clients say" className="tm">
      <style>{`
        .tm {
          background-color: var(--color-cream);
          padding: var(--space-xl) 0 var(--space-lg);
          overflow: hidden;
        }
        .tm__head { max-width: 84em; margin: 0 auto var(--space-md); padding: 0 var(--space-md); text-align: center; }
        .tm__eyebrow {
          font-family: var(--font-script), cursive;
          color: var(--color-primary);
          font-size: clamp(2rem, 4.5vw, 2.8em); line-height: 1; margin-bottom: 0.1em;
        }
        .tm__heading {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400; font-size: clamp(1.4rem, 3vw, 2.2em);
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink);
        }

        /* Verified Google aggregate band */
        .tm__band {
          display: inline-flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.55em;
          margin-top: 0.9em;
          padding: 0.55em 1.1em;
          border: 1px solid var(--color-cream-dark);
          border-radius: 999px;
          background: var(--color-white);
          box-shadow: 0 10px 30px -18px rgba(122, 31, 31, 0.25);
        }
        .tm__band-rating {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400; font-size: 1.15em; color: var(--color-ink);
        }
        .tm__band-count {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200; font-size: 0.9em; color: var(--color-ink-muted);
        }
        .tm__band-link {
          display: inline-flex; align-items: center; gap: 0.4em;
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400; font-size: 0.82em; letter-spacing: 0.04em;
          text-transform: uppercase; text-decoration: none;
          color: var(--color-primary);
          padding-left: 0.7em; margin-left: 0.2em;
          border-left: 1px solid var(--color-cream-dark);
          transition: color 160ms ease;
        }
        .tm__band-link:hover { color: var(--color-primary-light); }

        .tm__viewport { position: relative; }
        /* Edge fades so cards melt in/out rather than hard-clip */
        .tm__viewport::before,
        .tm__viewport::after {
          content: "";
          position: absolute; top: 0; bottom: 0; width: 6em; z-index: 2;
          pointer-events: none;
        }
        .tm__viewport::before { left: 0; background: linear-gradient(90deg, var(--color-cream), transparent); }
        .tm__viewport::after { right: 0; background: linear-gradient(270deg, var(--color-cream), transparent); }

        .tm__track {
          display: flex;
          gap: 1.4em;
          width: max-content;
          padding: 0.5em var(--space-md);
          will-change: transform;
        }

        .tm-card {
          flex: 0 0 auto;
          width: 24em;
          background-color: var(--color-white);
          border: 1px solid var(--color-cream-dark);
          border-radius: 1.3em;
          padding: 1.8em;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1em;
          min-height: 16em;
          box-shadow: 0 16px 44px rgba(122, 31, 31, 0.05);
        }
        .tm-card__stars { display: inline-flex; gap: 0.2em; }
        .tm-card__text {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200; font-size: 1em; line-height: 1.7;
          color: var(--color-ink); margin: 0;
          /* Clamp long reviews so every card stays a uniform height. Full text
             is preserved in Sanity; this only limits the marquee display. */
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .tm-card__meta { display: flex; justify-content: space-between; align-items: baseline; margin-top: auto; }
        .tm-card__name {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400; font-size: 0.95em; color: var(--color-primary); letter-spacing: 0.02em;
        }
        .tm-card__date {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200; font-size: 0.8em; color: var(--color-ink-muted);
        }

        @media (max-width: 767px) {
          .tm { padding: var(--space-lg) 0; }
          .tm__head { padding: 0 1em; }
          .tm__track { gap: 1em; padding: 0.5em 1em; }
          .tm-card { width: 78vw; max-width: 20em; padding: 1.5em; }
          .tm-card__text { font-size: max(16px, 1em); line-height: 1.6; }
          .tm-card__name { font-size: max(15px, 0.95em); }
          .tm__viewport::before, .tm__viewport::after { width: 2.5em; }
        }
      `}</style>

      <div className="tm__head">
        <p className="tm__eyebrow">{eyebrow}</p>
        <h2 className="tm__heading">{heading}</h2>

        {showBand ? (
          <div className="tm__band">
            <span className="tm__band-rating">{googleRating!.toFixed(1)}</span>
            <Stars rating={Math.round(googleRating!)} />
            <span className="tm__band-count">
              {googleReviewCount}+ Google reviews
            </span>
            {googleUrl ? (
              <a
                className="tm__band-link"
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read on Google
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="tm__viewport">
        {/* Doubled list for the seamless loop */}
        <div ref={trackRef} className="tm__track">
          {[...data, ...data].map((review, i) => (
            <Card key={i} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
