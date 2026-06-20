"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

gsap.registerPlugin(ScrollTrigger);

// Real service scope, verbatim from CLIENTRAWDETAILS.md.
const SERVICES = [
  { n: "01", name: "Stage Decoration", blurb: "Striking stage and venue transformations that set the tone for the day." },
  { n: "02", name: "Stage Programs", blurb: "Flawlessly run stage programs and event flow, start to finish." },
  { n: "03", name: "Catering", blurb: "Top-tier catering — from traditional sadya to live counters." },
  { n: "04", name: "Light & Sound", blurb: "State-of-the-art light and sound systems for any scale of celebration." },
  { n: "05", name: "Makeup Artistry", blurb: "Professional bridal and party makeup, on schedule and on point." },
  { n: "06", name: "Car Rentals", blurb: "Premium cars for elegant arrivals and departures." },
  { n: "07", name: "Dancers", blurb: "Talented dancers and live entertainment to lift the room." },
  { n: "08", name: "Photography & Video", blurb: "Full event shoot coverage by Aira Photography — stills and film." },
];

/**
 * Asymmetric row-based services list (deliberately NOT a bento grid). Each row
 * is a large index + name with a supporting line that reveals on the right.
 * Rows slide in from alternating sides on a scrubbed ScrollTrigger; isolated
 * desktop/mobile via createMatchMedia. Reduced-motion shows all in place.
 */
export default function ServicesList() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rows = root.querySelectorAll<HTMLElement>(".services__row");
      if (prefersReduced) {
        gsap.set(rows, { autoAlpha: 1, x: 0 });
        return;
      }
      const tween = gsap.fromTo(
        rows,
        { autoAlpha: 0, x: (i) => (i % 2 === 0 ? -40 : 40) },
        {
          autoAlpha: 1,
          x: 0,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root, start: "top 78%", end: "top 35%", scrub: 1 },
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
    <section ref={rootRef} aria-label="Other services" className="services">
      <style>{`
        .services {
          background-color: var(--color-primary);
          color: var(--color-cream);
          padding: var(--space-xl) var(--space-md) var(--space-xl);
        }
        .services__head { max-width: 78em; margin: 0 auto var(--space-md); }
        .services__eyebrow {
          font-family: var(--font-script), cursive;
          color: var(--color-gold-light);
          font-size: clamp(2rem, 4.5vw, 2.8em);
          line-height: 1; margin-bottom: 0.1em;
        }
        .services__heading {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400; font-size: clamp(1.4rem, 3vw, 2.2em);
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        .services__list { max-width: 78em; margin: 0 auto; }
        .services__row {
          will-change: transform;
          display: grid;
          grid-template-columns: 3.2em 1fr minmax(0, 22em);
          align-items: center;
          gap: 1.4em;
          padding: 1.1em 0.6em;
          border-top: 1px solid rgba(201, 169, 110, 0.28);
          transition: background-color 0.35s ease, padding-left 0.35s ease;
        }
        .services__list .services__row:last-child { border-bottom: 1px solid rgba(201, 169, 110, 0.28); }
        .services__row:hover { background-color: rgba(201, 169, 110, 0.08); padding-left: 1.4em; }

        .services__n {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200; font-size: 0.95em;
          color: var(--color-gold); letter-spacing: 0.08em;
        }
        .services__name {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400; font-size: clamp(1.3rem, 3.4vw, 2.1em);
          letter-spacing: 0.01em; line-height: 1.1;
        }
        .services__blurb {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200; font-size: 0.95em; line-height: 1.6;
          color: var(--color-cream-dark);
        }

        @media (max-width: 767px) {
          .services { padding: var(--space-lg) 1em; }
          .services__row {
            grid-template-columns: 2.4em 1fr;
            grid-template-areas: "n name" "blurb blurb";
            gap: 0.4em 1em;
            padding: 1em 0.4em;
          }
          .services__row:hover { padding-left: 0.4em; }
          .services__n { grid-area: n; }
          .services__name { grid-area: name; }
          .services__blurb { grid-area: blurb; margin-top: 0.3em; font-size: max(16px, 0.95em); line-height: 1.55; }
        }
      `}</style>

      <div className="services__head">
        <p className="services__eyebrow">beyond the day</p>
        <h2 className="services__heading">Other Services</h2>
      </div>

      <div className="services__list">
        {SERVICES.map((s) => (
          <div className="services__row" key={s.n}>
            <span className="services__n">{s.n}</span>
            <span className="services__name">{s.name}</span>
            <span className="services__blurb">{s.blurb}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
