"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import ReelCard from "./ReelCard";
import type { ReelItem } from "./types";

gsap.registerPlugin(ScrollTrigger);

/**
 * A dedicated horizontal rail of portrait reels. Native horizontal scroll/drag
 * (no scrolljack of the vertical page), with a subtle scrub-tied entrance and
 * a slight parallax drift of the rail as the section passes through view.
 * Self-hosted reels only (ReelCard). Reduced-motion → static, just scrollable.
 */
export default function ReelsStrip({
  eyebrow,
  heading,
  reels,
}: {
  eyebrow: string;
  heading: string;
  reels: ReelItem[];
}) {
  const rootRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rail = railRef.current;
      const root = rootRef.current;
      if (!rail || !root) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const cards = rail.querySelectorAll<HTMLElement>(".reels-strip__item");
      const inTween = gsap.fromTo(
        cards,
        { yPercent: 18, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root, start: "top 80%", end: "top 45%", scrub: 1 },
        },
      );

      return () => {
        inTween.scrollTrigger?.kill();
        inTween.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} aria-label={heading} className="reels-strip">
      <style>{`
        .reels-strip {
          background-color: var(--color-primary);
          color: var(--color-cream);
          padding: var(--space-xl) 0;
          position: relative;
          overflow: hidden;
        }
        .reels-strip__head {
          max-width: 84em;
          margin: 0 auto var(--space-md);
          padding: 0 var(--space-md);
        }
        .reels-strip__eyebrow {
          font-family: var(--font-script), cursive;
          color: var(--color-gold-light);
          font-size: clamp(2rem, 4.5vw, 2.8em);
          line-height: 1;
          margin-bottom: 0.1em;
        }
        .reels-strip__heading {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400;
          font-size: clamp(1.4rem, 3vw, 2.2em);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .reels-strip__hint {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200;
          font-size: 0.85em;
          letter-spacing: 0.04em;
          color: var(--color-cream-dark);
          margin-top: 0.6em;
        }

        .reels-strip__rail {
          display: flex;
          gap: 1.2em;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0.5em var(--space-md) 1.5em;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .reels-strip__rail::-webkit-scrollbar { display: none; }

        .reels-strip__item {
          flex: 0 0 auto;
          width: 17em;
          aspect-ratio: 9 / 16;
          border-radius: 1.1em;
          overflow: hidden;
          scroll-snap-align: center;
          will-change: transform;
          box-shadow: 0 12px 40px rgba(26,10,10,0.35);
        }

        @media (max-width: 767px) {
          .reels-strip { padding: var(--space-lg) 0; }
          .reels-strip__head { padding: 0 1em; }
          .reels-strip__rail { padding: 0.5em 1em 1.2em; gap: 0.9em; }
          .reels-strip__item { width: 72vw; max-width: 18em; }
          .reels-strip__hint { font-size: max(14px, 0.85em); }
        }
      `}</style>

      <div className="reels-strip__head">
        <p className="reels-strip__eyebrow">{eyebrow}</p>
        <h2 className="reels-strip__heading">{heading}</h2>
        <p className="reels-strip__hint">Scroll sideways to browse — tap a reel to play.</p>
      </div>

      <div ref={railRef} className="reels-strip__rail">
        {reels.map((reel, i) => (
          <div className="reels-strip__item" key={i}>
            <ReelCard reel={reel} />
          </div>
        ))}
      </div>
    </section>
  );
}
