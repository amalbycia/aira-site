"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, createMatchMedia } from "@/lib/gsap";
import type { GalleryPhoto } from "./types";

gsap.registerPlugin(ScrollTrigger);

/**
 * Column-drift scroll gallery ("Variant 1" — multi-speed column parallax).
 *
 * Photos are laid into N even columns. Each column scrubs to a different
 * vertical drift speed as the grid crosses the viewport (column 0 barely
 * moves, the last column drifts the most), so columns separate and regroup
 * as you scroll instead of moving as one flat block. Inside each photo's
 * clipped frame, the image itself counter-drifts a smaller amount — the
 * frame stays put, the photo breathes inside it.
 *
 * Two-layer structure per item: `.column-drift__frame` clips (overflow
 * hidden, fixed aspect-ratio, radius) while `.column-drift__img` is the
 * free-transforming layer inside it — this is what lets the inner image
 * drift without ever showing outside the rounded card.
 *
 * Desktop runs the full column-speed effect; mobile (single column) only
 * keeps the gentler per-image drift, since column separation needs width to
 * read. Reduced-motion shows every photo in its resting position.
 */
export default function ColumnDriftGallery({
  eyebrow,
  heading,
  photos,
  columns = 4,
}: {
  eyebrow: string;
  heading: string;
  photos: GalleryPhoto[];
  columns?: number;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Distribute photos round-robin into N columns (left to right, like the
  // source grid's literal column markup) so each column is its own DOM track.
  const cols: GalleryPhoto[][] = Array.from({ length: columns }, () => []);
  photos.forEach((photo, i) => cols[i % columns].push(photo));

  useGSAP(
    () => {
      const root = rootRef.current;
      const grid = gridRef.current;
      if (!root || !grid) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const columnEls = grid.querySelectorAll<HTMLElement>("[data-drift-column]");
      const imageEls = grid.querySelectorAll<HTMLElement>("[data-drift-image]");

      if (prefersReduced) {
        gsap.set(columnEls, { yPercent: 0 });
        gsap.set(imageEls, { y: 0 });
        return;
      }

      const mm = createMatchMedia();

      mm.add("isDesktop", () => {
        const tweens: gsap.core.Tween[] = [];

        // Column drift — 1:1 with Codrops Demo 1: each column shifts
        // `yPercent: -1 * pos * 10`, scrubbed across the grid's transit, so
        // columns separate at different speeds as you scroll.
        columnEls.forEach((col, i) => {
          const tween = gsap.to(col, {
            ease: "none",
            yPercent: -1 * i * 10,
            scrollTrigger: {
              trigger: grid,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
          tweens.push(tween);
        });

        // Inner image parallax — 1:1 with Codrops Demo 1: each image drifts
        // `y: 30 → -30` (px) scrubbed to its own item's transit. The image is
        // oversized in CSS so this travel never reveals an edge of the frame.
        imageEls.forEach((img) => {
          const tween = gsap.fromTo(
            img,
            { y: 30 },
            {
              y: -30,
              ease: "none",
              scrollTrigger: {
                trigger: img.closest("[data-drift-frame]") ?? img,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
          tweens.push(tween);
        });

        return () => {
          tweens.forEach((t) => {
            t.scrollTrigger?.kill();
            t.kill();
          });
        };
      });

      mm.add("isMobile", () => {
        const tweens: gsap.core.Tween[] = [];

        // Mobile keeps the SAME multi-column drift + parallax as desktop —
        // 1:1 with Codrops Demo 1, which never collapses to a single column.
        // The grid stays at `columns` tracks (just narrower), so columns still
        // separate at different speeds and each photo still parallaxes.
        columnEls.forEach((col, i) => {
          const tween = gsap.to(col, {
            ease: "none",
            yPercent: -1 * i * 10,
            scrollTrigger: {
              trigger: grid,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
          tweens.push(tween);
        });

        imageEls.forEach((img) => {
          const tween = gsap.fromTo(
            img,
            { y: 30 },
            {
              y: -30,
              ease: "none",
              scrollTrigger: {
                trigger: img.closest("[data-drift-frame]") ?? img,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
          tweens.push(tween);
        });

        return () => {
          tweens.forEach((t) => {
            t.scrollTrigger?.kill();
            t.kill();
          });
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [columns, photos.length] },
  );

  return (
    <section ref={rootRef} aria-label={heading} className="column-drift">
      <style>{`
        .column-drift {
          background-color: var(--color-cream);
          padding: var(--space-xl) var(--space-md) var(--space-lg);
          position: relative;
          overflow: hidden;
        }

        .column-drift__head {
          max-width: 84em;
          margin: 0 auto var(--space-lg);
          text-align: center;
        }
        .column-drift__eyebrow {
          font-family: var(--font-script), cursive;
          color: var(--color-primary);
          font-size: clamp(2rem, 4.5vw, 2.8em);
          line-height: 1;
          margin-bottom: 0.15em;
        }
        .column-drift__heading {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400;
          font-size: clamp(1.4rem, 3vw, 2.2em);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink);
        }

        .column-drift__grid {
          max-width: 86em;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(${columns}, 1fr);
          gap: 1.4em;
          align-items: start;
        }

        .column-drift__column {
          display: grid;
          gap: 1.4em;
          will-change: transform;
        }
        /* Stagger column start heights so the grid reads as offset, not a tidy table */
        .column-drift__column:nth-child(2) { margin-top: 3em; }
        .column-drift__column:nth-child(3) { margin-top: 1em; }
        .column-drift__column:nth-child(4) { margin-top: 4.5em; }

        .column-drift__frame {
          position: relative;
          overflow: hidden;
          border-radius: 0.9em;
          aspect-ratio: 0.78;
          box-shadow: 0 10px 32px rgba(26, 10, 10, 0.18);
        }

        .column-drift__img {
          /* Oversized + offset so the ±30px parallax drift never reveals the
             frame edge (mirrors Codrops' oversized image approach). */
          position: absolute;
          top: -12%;
          left: 0;
          width: 100%;
          height: 124%;
          object-fit: cover;
          will-change: transform;
        }

        .column-drift__caption {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 1.4em 1em 0.8em;
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200;
          font-size: 0.8em;
          letter-spacing: 0.03em;
          color: var(--color-cream);
          background: linear-gradient(to top, rgba(26, 10, 10, 0.6), transparent);
          opacity: 0;
          transform: translateY(0.4em);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .column-drift__frame:hover .column-drift__caption {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 767px) {
          /* 1:1 with Codrops Demo 1 — the grid KEEPS its columns on mobile
             (never collapses to one strip), just narrower with a tighter gap,
             so the column drift + parallax read the same as desktop. */
          .column-drift { padding: var(--space-lg) 0.6em var(--space-md); }
          .column-drift__grid {
            gap: 2vw;
          }
          .column-drift__frame { border-radius: 0.5em; }
          /* Scaled-down offset rhythm — keeps the staggered look at phone width */
          .column-drift__column:nth-child(2) { margin-top: 1.4em; }
          .column-drift__column:nth-child(3) { margin-top: 0.5em; }
          .column-drift__column:nth-child(4) { margin-top: 2em; }
          /* Captions are unreadable over thin mobile columns — hide them
             (Codrops Demo 1 has none either). They return on desktop hover. */
          .column-drift__caption { display: none; }
        }
      `}</style>

      <div className="column-drift__head">
        <p className="column-drift__eyebrow">{eyebrow}</p>
        <h2 className="column-drift__heading">{heading}</h2>
      </div>

      <div ref={gridRef} className="column-drift__grid">
        {cols.map((col, ci) => (
          <div key={ci} data-drift-column="" className="column-drift__column">
            {col.map((photo, pi) => (
              <figure
                key={pi}
                data-drift-frame=""
                className="column-drift__frame"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-drift-image=""
                  className="column-drift__img"
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                />
                {photo.caption ? (
                  <figcaption className="column-drift__caption">{photo.caption}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
