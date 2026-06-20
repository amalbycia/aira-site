"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { createMatchMedia } from "@/lib/gsap";
import ReelCard from "./ReelCard";
import type { Cluster, MediaItem } from "./types";

gsap.registerPlugin(ScrollTrigger);

function PhotoCard({ item }: { item: Extract<MediaItem, { kind: "photo" }> }) {
  return (
    <figure className="media-card media-card--photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="media-card__img" src={item.src} alt={item.alt} loading="lazy" />
      {item.caption ? <figcaption className="media-card__caption">{item.caption}</figcaption> : null}
    </figure>
  );
}

/**
 * One asymmetric editorial cluster of mixed photos + reels.
 *
 * Layout: a 12-column grid where each item claims a column/row span by its
 * `span`, producing an offset, non-uniform composition (not a tidy bento). The
 * whole cluster shifts left or right of center via `offset` so successive
 * clusters read as a rhythm rather than a feed. On mobile (<768px) the grid
 * collapses to a single stacked column per MOBILE-RULES.
 *
 * Motion: items rise + fade in, scrubbed to scroll, isolated per viewport via
 * createMatchMedia. Reduced-motion shows everything in place (no reveal).
 */
export default function MediaCluster({ cluster }: { cluster: Cluster }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const cards = root.querySelectorAll<HTMLElement>("[data-cluster-item]");
      if (prefersReduced) {
        gsap.set(cards, { autoAlpha: 1, yPercent: 0 });
        return;
      }

      const mm = createMatchMedia();

      mm.add("isDesktop", () => {
        const items = root.querySelectorAll<HTMLElement>("[data-cluster-item]");
        const tween = gsap.fromTo(
          items,
          { yPercent: 22, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            ease: "power2.out",
            stagger: 0.12,
            scrollTrigger: { trigger: root, start: "top 82%", end: "top 45%", scrub: 1 },
          },
        );
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      mm.add("isMobile", () => {
        const items = root.querySelectorAll<HTMLElement>("[data-cluster-item]");
        const tween = gsap.fromTo(
          items,
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: { trigger: root, start: "top 88%", end: "top 60%", scrub: 1 },
          },
        );
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={`media-cluster media-cluster--${cluster.offset}`}>
      {cluster.note ? (
        <p className="media-cluster__note font-script" aria-hidden="true">
          {cluster.note}
        </p>
      ) : null}

      <div className="media-cluster__grid">
        {cluster.items.map((item, i) => (
          <div
            key={i}
            data-cluster-item=""
            className={`media-cluster__cell is--${item.span} is--${item.kind}`}
          >
            {item.kind === "photo" ? <PhotoCard item={item} /> : <ReelCard reel={item} />}
          </div>
        ))}
      </div>
    </div>
  );
}
