"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

gsap.registerPlugin(ScrollTrigger);

/**
 * Text-only location block (no map embed — per client scope). Cursive eyebrow,
 * a short written line of where they're based / serve. Quiet scrub fade-in.
 * Sits on cream so it bridges into the fixed footer reveal.
 */
export default function LocationBlock({
  eyebrow = "find us",
  heading,
  lines,
}: {
  eyebrow?: string;
  heading: string;
  lines: string[];
}) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const targets = root.querySelectorAll<HTMLElement>("[data-loc-fade]");
      if (prefersReduced) {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        return;
      }
      const tween = gsap.fromTo(
        targets,
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: root, start: "top 80%", end: "top 50%", scrub: 1 },
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} aria-label="Location" className="location-block">
      <style>{`
        .location-block {
          background-color: var(--color-cream);
          padding: var(--space-xl) var(--space-md) var(--space-2xl);
          text-align: center;
        }
        .location-block__eyebrow {
          font-family: var(--font-script), cursive;
          color: var(--color-primary);
          font-size: clamp(2rem, 4.5vw, 2.8em);
          line-height: 1;
          margin-bottom: 0.1em;
        }
        .location-block__heading {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400;
          font-size: clamp(1.4rem, 3vw, 2.2em);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-ink);
          margin-bottom: 0.7em;
        }
        .location-block__line {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200;
          font-size: clamp(1rem, 1.6vw, 1.15em);
          line-height: 1.8;
          color: var(--color-ink-muted);
          max-width: 40ch;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          .location-block { padding: var(--space-lg) 1em var(--space-xl); }
          .location-block__line { font-size: max(16px, 1rem); line-height: 1.6; }
        }
      `}</style>
      <p className="location-block__eyebrow" data-loc-fade>{eyebrow}</p>
      <h2 className="location-block__heading" data-loc-fade>{heading}</h2>
      {lines.map((line, i) => (
        <p className="location-block__line" data-loc-fade key={i}>{line}</p>
      ))}
    </section>
  );
}
