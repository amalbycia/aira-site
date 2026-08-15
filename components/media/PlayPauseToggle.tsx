"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);

/**
 * Morphing play/pause toggle.
 *
 * Ported from the Osmo demo the client linked:
 * https://www.osmo.supply/demo/morphing-play-pause-toggle
 *
 * Both path strings and the tween config (rotational morph, complexity map,
 * 0.5s, power4.inOut) are taken verbatim from that source. MorphSVGPlugin ships
 * with GSAP 3.15 in node_modules — verified present, not loaded from a CDN.
 *
 * This is a presentational icon: the parent owns play state and click handling,
 * so the toggle simply morphs whenever `playing` changes.
 */
export default function PlayPauseToggle({
  playing,
  size = 26,
  className,
}: {
  playing: boolean;
  size?: number;
  className?: string;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  // Skip the morph on first paint — the icon should just *be* in its state.
  const mounted = useRef(false);

  const PLAY_PATH =
    "M3.5 5L3.50049 3.9468C3.50049 3.177 4.33382 2.69588 5.00049 3.08078L20.0005 11.741C20.6672 12.1259 20.6672 13.0882 20.0005 13.4731L17.2388 15.1412L17.0055 15.2759M3.50049 8L3.50049 21.2673C3.50049 22.0371 4.33382 22.5182 5.00049 22.1333L14.1192 16.9423L14.4074 16.7759";
  const PAUSE_PATH =
    "M15.5004 4.05859V5.0638V5.58691V8.58691V15.5869V19.5869V21.2549M8.5 3.96094V10.3721V17V19L8.5 21";

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const target = playing ? PAUSE_PATH : PLAY_PATH;

    // First render: set the shape directly, no animation.
    if (!mounted.current) {
      mounted.current = true;
      path.setAttribute("d", target);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.setAttribute("d", target);
      return;
    }

    const tween = gsap.to(path, {
      duration: 0.5,
      morphSVG: {
        type: "rotational",
        map: "complexity",
        shape: target,
      },
      ease: "power4.inOut",
    });

    return () => {
      tween.kill();
    };
  }, [playing]);

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 25"
      fill="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d={PLAY_PATH}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="16"
        strokeLinecap="round"
      />
    </svg>
  );
}
