"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // The admin console (/manage) needs plain native scrolling, not Lenis smooth
  // scroll — it has forms and scrollable lists, no scroll-driven animation.
  const isAdmin = pathname?.startsWith("/manage");

  useEffect(() => {
    if (isAdmin) return;

    // Drive Lenis from GSAP's single ticker instead of its own RAF loop. With
    // two separate RAF loops, ScrollTrigger reads a scroll value that's 1–2
    // frames stale relative to Lenis's smoothed position, which makes scrubbed
    // parallax (notably the footer roses + giant wordmark) visibly jitter.
    // One unified loop keeps every scroll-driven tween in lockstep.
    const lenis = new Lenis({ autoRaf: false });

    // Keep ScrollTrigger in sync on every Lenis scroll frame.
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP ticker passes seconds; Lenis.raf wants milliseconds.
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    // Prevent GSAP from "catching up" with a big jump after a tab refocus,
    // which would otherwise yank the smoothed scroll.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      // Restore default lag smoothing for any non-Lenis routes (e.g. /manage).
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [isAdmin]);

  return <>{children}</>;
}
