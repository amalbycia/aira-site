"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import styles from "./Preloader.module.css";

const SESSION_KEY = "aira-preloaded";
/** Hard ceiling — the curtain always lifts by here, whatever else happens. */
const MAX_MS = 1500;

/**
 * First-visit overlay: a maroon curtain with the wordmark and a 000→100
 * counter, then the whole sheet lifts to reveal the hero.
 *
 * Same discipline as the v2 research established (see REDESIGN-PLAN.md §3):
 *  - once per session (sessionStorage), only where mounted (home)
 *  - capped at 1500ms; resolves early once fonts + the hero image are ready —
 *    the counter is tied to real readiness, not fiction: it runs to ~90 on a
 *    timer and only completes to 100 when the page actually is ready
 *  - sits ON TOP of fully-rendered content (never gates it)
 *  - decided in an effect after mount — reading sessionStorage during render
 *    caused a hydration mismatch in v2, fixed then, kept fixed here
 *  - reduced-motion → never shown at all
 */
export default function Preloader() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    setActive(true);
  }, []);

  const root = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!active || !root.current) return;

      sessionStorage.setItem(SESSION_KEY, "1");

      const lenis = (
        window as Window & { __lenis?: { stop: () => void; start: () => void } }
      ).__lenis;
      lenis?.stop();

      const finish = () => {
        lenis?.start();
        setActive(false);
      };

      const counter = { v: 0 };
      const setText = () => {
        if (counterRef.current)
          counterRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
      };

      // Phase 1 — run to 90 on a fixed clock (the "believable" part).
      const toNinety = gsap.to(counter, {
        v: 90,
        duration: 0.85,
        ease: "power2.out",
        onUpdate: setText,
      });

      // Phase 2 — the last 10 points are earned: they only run when fonts have
      // settled and the hero image has loaded (or the hard cap fires).
      let completed = false;
      const complete = () => {
        if (completed) return;
        completed = true;

        gsap
          .timeline({ onComplete: finish })
          .to(counter, {
            v: 100,
            duration: 0.3,
            ease: "power1.inOut",
            onUpdate: setText,
          })
          .to(
            `.${styles.inner}`,
            { opacity: 0, y: -16, duration: 0.34, ease: "power2.in" },
            "+=0.08",
          )
          .to(
            root.current,
            { yPercent: -100, duration: 0.75, ease: "power3.inOut" },
            "-=0.1",
          );
      };

      const ready = Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise<void>((res) => {
          const img = document.querySelector<HTMLImageElement>("[data-hero-img]");
          if (!img || img.complete) return res();
          img.addEventListener("load", () => res(), { once: true });
          img.addEventListener("error", () => res(), { once: true });
        }),
      ]);

      // Never complete before phase 1 lands — the count must not jump backwards.
      ready.then(() => {
        if (toNinety.progress() === 1) complete();
        else toNinety.eventCallback("onComplete", complete);
      });
      const cap = window.setTimeout(() => {
        toNinety.progress(1);
        complete();
      }, MAX_MS);

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
      <div className={styles.inner}>
        <span className={styles.name}>AIRA</span>
        <span className={styles.sub}>Photography &amp; Events</span>
      </div>
      <span ref={counterRef} className={styles.counter}>
        000
      </span>
      <span className={styles.foot}>Changanassery · Kerala</span>
    </div>
  );
}
