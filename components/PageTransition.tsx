"use client";

/**
 * SVG path page transition — a 1:1 port of Codrops Sketch 021
 * "SVG Path Page Transition (Vertical)".
 * Source: https://github.com/codrops/codrops-sketches/tree/main/021-svg-path-page-transition-vertical
 *
 * The original is a single-page open/back demo. Here the same SVG path morph and
 * GSAP timeline drive REAL route changes: the "cover" half (step1) plays before
 * navigating, then the "reveal" half (step2) plays once the new route mounts.
 *
 * The `paths` object and the per-tween durations/eases are kept verbatim from the
 * sketch so the motion matches 1:1.
 */

import { useEffect, useRef, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { gsap } from "@/lib/gsap";

// paths — verbatim from the Codrops sketch (js/index.js).
// edit here: https://yqnn.github.io/svg-path-editor/
const paths = {
  step1: {
    unfilled: "M 0 100 V 100 Q 50 100 100 100 V 100 z",
    inBetween: {
      curve1: "M 0 100 V 50 Q 50 0 100 50 V 100 z",
      curve2: "M 0 100 V 50 Q 50 100 100 50 V 100 z",
    },
    filled: "M 0 100 V 0 Q 50 0 100 0 V 100 z",
  },
  step2: {
    filled: "M 0 0 V 100 Q 50 100 100 100 V 0 z",
    inBetween: {
      curve1: "M 0 0 V 50 Q 50 0 100 50 V 0 z",
      curve2: "M 0 0 V 50 Q 50 100 100 50 V 0 z",
    },
    unfilled: "M 0 0 V 0 Q 50 0 100 0 V 0 z",
  },
};

function PageTransitionInner() {
  const overlayPathRef = useRef<SVGPathElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAnimating = useRef(false);
  // Set when a transition is mid-flight so the next route mount plays the reveal.
  const pendingReveal = useRef(false);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Disable the transition entirely inside the admin console — it has its own
  // navigation, and the overlay must never cover it.
  const inStudio = pathname.startsWith("/manage");

  // ── COVER (step1): unfilled → filled, then run the supplied navigation. ──
  // Mirrors the first half of the sketch's reveal() timeline.
  const cover = useCallback((navigate: () => void) => {
    const overlayPath = overlayPathRef.current;
    if (!overlayPath || isAnimating.current) return;
    isAnimating.current = true;
    pendingReveal.current = true;

    gsap
      .timeline()
      .set(overlayPath, { attr: { d: paths.step1.unfilled } })
      .to(
        overlayPath,
        {
          duration: 0.8,
          ease: "power4.in",
          attr: { d: paths.step1.inBetween.curve1 },
        },
        0,
      )
      .to(overlayPath, {
        duration: 0.2,
        ease: "power1",
        attr: { d: paths.step1.filled },
        onComplete: () => navigate(),
      });
  }, []);

  // ── REVEAL (step2): filled → unfilled. Second half of the sketch timeline. ──
  const reveal = useCallback(() => {
    const overlayPath = overlayPathRef.current;
    if (!overlayPath) return;

    gsap
      .timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      })
      .set(overlayPath, { attr: { d: paths.step2.filled } })
      .to(overlayPath, {
        duration: 0.2,
        ease: "sine.in",
        attr: { d: paths.step2.inBetween.curve1 },
      })
      .to(overlayPath, {
        duration: 1,
        ease: "power4",
        attr: { d: paths.step2.unfilled },
      });
  }, []);

  // After a navigation completes, the route key changes -> play the reveal half.
  useEffect(() => {
    if (inStudio) return;
    if (pendingReveal.current && !prefersReduced) {
      pendingReveal.current = false;
      // Wait a frame so the new page has painted under the filled overlay.
      requestAnimationFrame(() => reveal());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Intercept internal link clicks site-wide and route them through the cover.
  useEffect(() => {
    if (prefersReduced || inStudio) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || target === "_blank") return;
      // Only intercept same-origin, non-hash route changes.
      if (!href.startsWith("/") || href.startsWith("/#")) return;
      // Skip pure in-page anchors and the current path.
      const [hrefPath] = href.split("#");
      if (hrefPath === pathname) return;
      // Let the admin console route load normally.
      if (hrefPath.startsWith("/manage")) return;

      e.preventDefault();
      cover(() => router.push(href));
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [cover, router, pathname, prefersReduced, inStudio]);

  // In Studio: keep the markup identical for SSR/client (no conditional return,
  // which would cause a hydration mismatch) but hide + disable the overlay via a
  // class. The effects above already no-op when inStudio, so it never animates.
  return (
    <svg
      className={`page-transition-overlay${inStudio ? " is--disabled" : ""}`}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={overlayPathRef}
        className="page-transition-overlay__path"
        vectorEffect="non-scaling-stroke"
        d={paths.step1.unfilled}
      />
      <style>{`
        .page-transition-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          width: 100%;
          height: 100%;
        }
        .page-transition-overlay__path {
          fill: var(--color-primary-dark, #5a1616);
        }
        /* Inside Sanity Studio: fully removed from view + interaction. */
        .page-transition-overlay.is--disabled {
          display: none;
        }
      `}</style>
    </svg>
  );
}

export default function PageTransition() {
  // usePathname/useSearchParams need a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <PageTransitionInner />
    </Suspense>
  );
}
