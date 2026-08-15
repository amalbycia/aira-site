"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import styles from "./Marquee.module.css";

const WORDS = [
  "Weddings",
  "Photography",
  "Cinematography",
  "Stage Decor",
  "Catering",
  "Light & Sound",
  "Makeup",
  "Entertainment",
];

/**
 * Slow horizontal word marquee — the site's one piece of continuous motion,
 * borrowed from the Tuesday Lights reference the client liked.
 *
 * Implementation notes:
 *  - The track is duplicated and wrapped with a modifier, so the loop is
 *    seamless and never "rewinds".
 *  - It's a single transform tween on one element (cheap; no layout thrash).
 *  - Under prefers-reduced-motion it renders as a static, horizontally
 *    scrollable row instead.
 */
export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        track.style.overflowX = "auto";
        return;
      }

      // The track holds the word list twice; travelling exactly half its width
      // lands on an identical frame, so the wrap is invisible.
      const half = track.scrollWidth / 2;
      if (!half) return;

      const loop = gsap.to(track, {
        x: -half,
        duration: 42,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: (x) => `${parseFloat(x) % half}px`,
        },
      });

      return () => {
        loop.kill();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={styles.wrap} aria-hidden="true">
      <div ref={trackRef} className={styles.track}>
        {[...WORDS, ...WORDS].map((w, i) => (
          <span className={styles.item} key={`${w}-${i}`}>
            {w}
            <span className={styles.dot}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
