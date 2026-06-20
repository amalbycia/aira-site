"use client";

import MediaCluster from "./MediaCluster";
import type { Cluster } from "./types";

/**
 * Wraps a run of asymmetric media clusters and carries the shared media-system
 * CSS once (clusters themselves are layout + motion only). Section eyebrow is
 * the cursive Alex-Brush accent used across the site.
 */
export default function GallerySection({
  eyebrow,
  heading,
  clusters,
}: {
  eyebrow: string;
  heading: string;
  clusters: Cluster[];
}) {
  return (
    <section aria-label={heading} className="gallery-section">
      <style>{`
        .gallery-section {
          background-color: var(--color-cream);
          padding: var(--space-xl) var(--space-md) var(--space-lg);
          position: relative;
        }

        .gallery-section__head {
          max-width: 84em;
          margin: 0 auto var(--space-lg);
          text-align: center;
        }
        .gallery-section__eyebrow {
          font-family: var(--font-script), cursive;
          color: var(--color-primary);
          font-size: clamp(2rem, 4.5vw, 2.8em);
          line-height: 1;
          margin-bottom: 0.15em;
        }
        .gallery-section__heading {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400;
          font-size: clamp(1.4rem, 3vw, 2.2em);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink);
        }

        /* ── Cluster shell ── */
        .media-cluster {
          max-width: 78em;
          margin: 0 auto;
          padding: var(--space-md) 0;
          position: relative;
        }
        .media-cluster--left  { margin-right: auto; margin-left: max(0px, calc(50% - 39em)); }
        .media-cluster--right { margin-left: auto; margin-right: max(0px, calc(50% - 39em)); }

        .media-cluster__note {
          color: var(--color-primary);
          font-size: clamp(1.6rem, 3vw, 2.2em);
          line-height: 1;
          margin-bottom: 0.4em;
          opacity: 0.85;
        }
        .media-cluster--right .media-cluster__note { text-align: right; }

        /* 12-col asymmetric grid — auto rows so spans read as an editorial wall */
        .media-cluster__grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: 7em;
          gap: 1.1em;
        }

        .media-cluster__cell {
          will-change: transform;
          position: relative;
          overflow: hidden;
          border-radius: 1em;
        }
        /* Spans tuned so photos + reels interlock asymmetrically */
        .media-cluster__cell.is--tall     { grid-column: span 5; grid-row: span 4; }
        .media-cluster__cell.is--wide     { grid-column: span 7; grid-row: span 3; }
        .media-cluster__cell.is--square   { grid-column: span 5; grid-row: span 3; }
        .media-cluster__cell.is--portrait { grid-column: span 4; grid-row: span 4; }
        .media-cluster__cell.is--pano     { grid-column: span 12; grid-row: span 3; }
        /* Reels lean vertical regardless of declared span footprint */
        .media-cluster__cell.is--reel     { grid-column: span 4; grid-row: span 5; }

        /* ── Photo card ── */
        .media-card { position: relative; width: 100%; height: 100%; margin: 0; }
        .media-card__img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.625, 0.05, 0, 1);
        }
        .media-cluster__cell:hover .media-card__img { transform: scale(1.04); }
        .media-card__caption,
        .reel-card__caption {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          padding: 1.4em 1em 0.8em;
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200;
          font-size: 0.8em;
          letter-spacing: 0.03em;
          color: var(--color-cream);
          background: linear-gradient(to top, rgba(26,10,10,0.6), transparent);
          opacity: 0;
          transform: translateY(0.4em);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .media-cluster__cell:hover .media-card__caption,
        .reel-card:hover .reel-card__caption { opacity: 1; transform: translateY(0); }

        /* ── Reel card ── */
        .reel-card {
          position: relative;
          width: 100%; height: 100%;
          cursor: pointer;
          background-color: var(--color-primary-dark);
        }
        .reel-card__media {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }
        .reel-card__play {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 3.2em; height: 3.2em;
          display: flex; align-items: center; justify-content: center;
          border-radius: 999px;
          background-color: rgba(245, 237, 224, 0.92);
          color: var(--color-primary);
          padding-left: 0.15em;
          transition: opacity 0.3s ease, transform 0.3s ease;
          box-shadow: 0 6px 24px rgba(26,10,10,0.35);
        }
        .reel-card:hover .reel-card__play { transform: translate(-50%, -50%) scale(1.08); }
        .reel-card__play[data-playing="true"] { opacity: 0; }
        .reel-card__tag {
          position: absolute;
          top: 0.9em; left: 0.9em;
          font-family: var(--font-nohemi), sans-serif;
          font-size: 0.6em;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-cream);
          background-color: rgba(122, 31, 31, 0.7);
          backdrop-filter: blur(4px);
          padding: 0.4em 0.9em;
          border-radius: 999px;
        }

        /* ── Mobile: collapse every cluster to one stacked column ── */
        @media (max-width: 767px) {
          .gallery-section { padding: var(--space-lg) 1em var(--space-md); }
          .media-cluster,
          .media-cluster--left,
          .media-cluster--right {
            margin-left: auto;
            margin-right: auto;
            padding: var(--space-sm) 0;
          }
          .media-cluster__note,
          .media-cluster--right .media-cluster__note { text-align: center; }
          .media-cluster__grid {
            grid-template-columns: 1fr;
            grid-auto-rows: auto;
            gap: 0.9em;
          }
          .media-cluster__cell,
          .media-cluster__cell.is--tall,
          .media-cluster__cell.is--wide,
          .media-cluster__cell.is--square,
          .media-cluster__cell.is--portrait,
          .media-cluster__cell.is--pano,
          .media-cluster__cell.is--reel {
            grid-column: 1 / -1;
            grid-row: auto;
            aspect-ratio: 4 / 5;
          }
          .media-cluster__cell.is--wide,
          .media-cluster__cell.is--pano { aspect-ratio: 3 / 2; }
          .media-cluster__cell.is--reel { aspect-ratio: 9 / 16; max-width: 22em; margin: 0 auto; }
          /* Captions always visible on touch (no hover) */
          .media-card__caption, .reel-card__caption { opacity: 1; transform: none; }
        }
      `}</style>

      <div className="gallery-section__head">
        <p className="gallery-section__eyebrow">{eyebrow}</p>
        <h2 className="gallery-section__heading">{heading}</h2>
      </div>

      {clusters.map((cluster) => (
        <MediaCluster key={cluster.id} cluster={cluster} />
      ))}
    </section>
  );
}
