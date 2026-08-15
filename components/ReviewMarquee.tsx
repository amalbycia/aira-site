"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { ReviewItem } from "@/lib/cms/getContent";
import styles from "./ReviewMarquee.module.css";

/**
 * Review cards on a slow marquee — boxed quotes drifting across the maroon
 * section, the same seamless wrap loop as the home word marquee (track holds
 * two identical halves; travelling half its width lands on an identical
 * frame). Hover or keyboard focus pauses it so cards can actually be read.
 *
 * Reduced-motion (and no-JS): a native horizontally scrollable row with snap
 * points — every review still reachable.
 */
export default function ReviewMarquee({ reviews }: { reviews: ReviewItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // One half of the track must be wide enough to cover any viewport, or the
  // wrap shows a gap — repeat short lists until there are at least 6 cards.
  const reps = Math.max(1, Math.ceil(6 / Math.max(1, reviews.length)));
  const half: ReviewItem[] = Array.from(
    { length: reps },
    () => reviews,
  ).flat();

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        track.style.overflowX = "auto";
        return;
      }

      const width = () => track.scrollWidth / 2;
      if (!width()) return;

      const loop = gsap.to(track, {
        x: () => -width(),
        duration: Math.max(30, half.length * 9),
        ease: "none",
        repeat: -1,
        modifiers: {
          x: (x) => `${parseFloat(x) % width()}px`,
        },
      });

      const pause = () => loop.pause();
      const play = () => loop.play();
      track.addEventListener("mouseenter", pause);
      track.addEventListener("mouseleave", play);
      track.addEventListener("focusin", pause);
      track.addEventListener("focusout", play);

      return () => {
        track.removeEventListener("mouseenter", pause);
        track.removeEventListener("mouseleave", play);
        track.removeEventListener("focusin", pause);
        track.removeEventListener("focusout", play);
        loop.kill();
      };
    },
    { scope: root, dependencies: [reviews.length] },
  );

  return (
    <div ref={root} className={styles.wrap}>
      <div ref={trackRef} className={styles.track}>
        {[0, 1].map((dup) => (
          <div
            key={dup}
            className={styles.half}
            aria-hidden={dup === 1 || undefined}
          >
            {half.map((r, i) => (
              <figure className={styles.card} key={`${dup}-${i}`}>
                <Stars rating={r.rating} />
                <blockquote className={styles.quote}>{r.reviewText}</blockquote>
                <figcaption className={styles.byline}>
                  <span className={styles.name}>{r.reviewerName}</span>
                  {r.date ? <span className={styles.date}>{r.date}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
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
