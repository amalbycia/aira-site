"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, createMatchMedia } from "@/lib/gsap";

gsap.registerPlugin(ScrollTrigger);

// Each box gets a real wedding photo (scripts/optimize-about-tiles.mjs) plus a
// subtle scroll parallax. `depth` is the vertical drift in px across the scroll
// range — varied per box so they don't move in lockstep.
const ABOUT_IMAGES = [
  { src: "/images/about-1.webp", className: "about-image--1", depth: -60 },
  { src: "/images/about-2.webp", className: "about-image--2", depth: 80 },
  { src: "/images/about-3.webp", className: "about-image--3", depth: -90 },
  { src: "/images/about-4.webp", className: "about-image--4", depth: 50 },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return; // keep boxes static — accessibility

      const mm = createMatchMedia();

      // Parallax only on desktop — the boxes are hidden below 1100px anyway.
      mm.add("(min-width: 1101px)", () => {
        ABOUT_IMAGES.forEach(({ className, depth }) => {
          const el = section.querySelector<HTMLElement>(`.${className}`);
          if (!el) return;
          gsap.fromTo(
            el,
            { y: -depth },
            {
              y: depth,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="About us"
      style={{
        backgroundColor: "var(--color-cream)",
        padding: "var(--space-xl) var(--space-md)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        .about-layout {
          position: relative;
          max-width: 84em;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr minmax(0, 36em) 1fr;
          align-items: center;
          gap: var(--space-md);
          min-height: 40em;
        }

        .about-image {
          border: 1px solid var(--color-gold-light);
          border-radius: 1em;
          position: absolute;
          overflow: hidden;
          will-change: transform;
        }

        .about-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .about-image--1 {
          top: 0;
          left: 8%;
          width: 13em;
          height: 13em;
        }

        .about-image--2 {
          bottom: 0;
          left: 0;
          width: 15em;
          height: 17em;
        }

        .about-image--3 {
          top: 2%;
          right: 6%;
          width: 13.5em;
          height: 19em;
        }

        .about-image--4 {
          bottom: 4%;
          right: 0;
          width: 13em;
          height: 9em;
        }

        .about-text {
          grid-column: 2;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 1100px) {
          .about-image { display: none; }
          .about-layout {
            grid-template-columns: 1fr;
            min-height: 0;
          }
          .about-text {
            grid-column: 1;
          }
        }
      `}</style>

      <div className="about-layout">
        {ABOUT_IMAGES.map(({ src, className }) => (
          <div
            key={className}
            className={`about-image ${className}`}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
          </div>
        ))}

        <div className="about-text">
          <p
            className="font-script"
            style={{
              color: "var(--color-primary)",
              fontSize: "3em",
              marginBottom: "0.4em",
            }}
          >
            about us
          </p>

          <h2
            className="font-nohemi"
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.6em)",
              fontWeight: 400,
              lineHeight: 1.2,
              color: "var(--color-ink)",
              marginBottom: "0.9em",
            }}
          >
            Nine years of weddings, told properly.
          </h2>

          <p
            className="font-nohemi"
            style={{
              fontSize: "1em",
              lineHeight: 1.9,
              color: "var(--color-ink-muted)",
              fontWeight: 200,
              marginBottom: "1.6em",
            }}
          >
            Founded in 2018, Aira Photography &amp; Agnitantra Events &amp; Caters
            brings creative artistry and full-service event management together —
            photography, videography, decor, catering, and coordination, handled
            as one team so every family gets our full attention.
          </p>

          <a
            href="#contact"
            className="font-nohemi"
            style={{
              display: "inline-block",
              padding: "0.8em 2.2em",
              borderRadius: "999px",
              border: "1px solid var(--color-primary)",
              color: "var(--color-primary)",
              fontSize: "0.85em",
              fontWeight: 400,
              letterSpacing: "0.04em",
              textDecoration: "none",
            }}
          >
            Discover
          </a>
        </div>
      </div>
    </section>
  );
}
