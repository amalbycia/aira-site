"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import styles from "./Cursor.module.css";

/**
 * Custom cursor — one gold ring with a centre dot, easing after the pointer
 * (gsap.quickTo lerp) and swelling over anything interactive.
 *
 * Deliberately quiet: no blend modes, no trails, no text inside it. The native
 * cursor stays VISIBLE (we never set `cursor: none`) so this can never break
 * usability — it's an accent riding along, not a replacement.
 *
 * Mounted only on precision pointers (`pointer: fine` + no reduced-motion);
 * touch devices never render it. Listeners are passive; the ring is a fixed,
 * transform-only element so it costs nothing in layout.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine && !reduced) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const ring = ringRef.current;
    if (!ring) return;

    // quickTo = one persistent tween per axis, retargeted every move — the
    // cheapest way to lerp; no per-event tween allocation.
    const xTo = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

    let seen = false;
    const onMove = (e: PointerEvent) => {
      if (!seen) {
        // First move: jump straight to the pointer (no swoop from 0,0).
        seen = true;
        gsap.set(ring, { x: e.clientX, y: e.clientY, opacity: 1 });
        return;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    // Swell over interactive targets. Delegated — survives route changes and
    // dynamically-rendered content without re-binding.
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element &&
      Boolean(t.closest("a, button, [role='button'], input, textarea, select, [data-cursor]"));

    const onOver = (e: PointerEvent) => {
      ring.dataset.hover = isInteractive(e.target) ? "true" : "false";
    };

    const onLeave = () => {
      gsap.set(ring, { opacity: 0 });
      seen = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={ringRef} className={styles.ring} aria-hidden="true">
      <span className={styles.dot} />
    </div>
  );
}
