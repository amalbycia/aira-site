"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import styles from "./Preloader.module.css";

const SESSION_KEY = "aira-preloaded";
/** Hard ceiling — the overlay always leaves by this point, whatever else happens. */
const MAX_MS = 1200;

/**
 * First-visit overlay.
 *
 * Design follows the research (REDESIGN-PLAN.md §3): a preloader is only
 * defensible when it masks real work and never gates content. So this one:
 *   - runs once per session (sessionStorage), only where it's mounted (home)
 *   - is capped at 1200ms and resolves early once fonts + hero image are ready
 *   - sits ON TOP of a fully-rendered page rather than replacing it, so the
 *     content is present for crawlers and for anyone who skips it
 *   - is removed instantly under prefers-reduced-motion
 *
 * The wordmark is a placeholder until the client supplies the real logo.
 */
export default function Preloader() {
  // The decision depends on sessionStorage + prefers-reduced-motion, neither of
  // which exists on the server. Reading them during render would make the first
  // client render disagree with the server HTML (hydration mismatch), so we
  // start as "not showing" and decide in an effect after mount.
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    setActive(true);
  }, []);

  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!active || !root.current) return;

      sessionStorage.setItem(SESSION_KEY, "1");

      // Lenis must not scroll underneath the overlay.
      const lenis = (
        window as Window & { __lenis?: { stop: () => void; start: () => void } }
      ).__lenis;
      lenis?.stop();

      const finish = () => {
        lenis?.start();
        setActive(false);
      };

      const tl = gsap.timeline({ onComplete: finish });

      tl.to(`.${styles.wordmark}`, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      })
        // The rule drawing left→right is the progress signal.
        .to(
          `.${styles.rule}`,
          { scaleX: 1, duration: 0.62, ease: "power2.inOut" },
          0.12,
        )
        .to(
          `.${styles.wordmark}`,
          { opacity: 0, duration: 0.32, ease: "power2.in" },
          "+=0.06",
        )
        // Lift the whole sheet away to reveal the hero already sitting there.
        .to(
          root.current,
          { yPercent: -100, duration: 0.7, ease: "power3.inOut" },
          "-=0.12",
        );

      // Resolve early when the real work is done: fonts settled + hero decoded.
      const ready = Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise<void>((res) => {
          const img = document.querySelector<HTMLImageElement>("[data-hero-img]");
          if (!img) return res();
          if (img.complete) return res();
          img.addEventListener("load", () => res(), { once: true });
          img.addEventListener("error", () => res(), { once: true });
        }),
      ]);

      let settled = false;
      const speedUp = () => {
        if (settled) return;
        settled = true;
        // Don't cut mid-flight — just stop dawdling.
        tl.timeScale(1.6);
      };

      ready.then(speedUp);
      const cap = window.setTimeout(speedUp, MAX_MS);

      return () => {
        window.clearTimeout(cap);
        lenis?.start();
      };
    },
    { scope: root, dependencies: [active] },
  );

  if (!active) return null;

  return (
    <div ref={root} className={styles.root} aria-hidden="true">
      <div className={styles.wordmark}>
        <span className={styles.name}>AIRA</span>
        <span className={styles.rule} />
        <span className={styles.sub}>Photography &amp; Events</span>
      </div>
    </div>
  );
}
