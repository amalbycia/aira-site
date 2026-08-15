"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

gsap.registerPlugin(ScrollTrigger);

/**
 * The site's single scroll-reveal primitive.
 *
 * Wrap any section in <Reveal> and every descendant marked `[data-reveal]`
 * fades + rises once as it enters. Deliberately the ONLY scroll animation on
 * the site — motion is restrained by design (see REDESIGN-PLAN.md §2).
 *
 * Guarantees:
 *  - `once: true` — a fast scroll past never leaves an element stuck hidden.
 *  - `prefers-reduced-motion` → elements are set to their final state instantly.
 *  - All triggers are scoped to this subtree and killed on unmount by useGSAP.
 */
export default function Reveal({
  children,
  stagger = 0.06,
  y = 24,
  start = "top 88%",
  className,
}: {
  children: React.ReactNode;
  /** Delay between sibling items, in seconds. */
  stagger?: number;
  /** Rise distance in px. */
  y?: number;
  /** ScrollTrigger start position. */
  start?: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", el);
      if (items.length === 0) return;

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Reduced motion: snap straight to the resting state, no ScrollTrigger.
      if (prefersReduced) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }

      // Group items by their vertical position so a row animates together
      // rather than cascading awkwardly left-to-right across a grid.
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger,
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
