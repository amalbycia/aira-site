"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import styles from "@/app/photography/preloader.module.css";

/* All GSAP motion for /photography, in one client component:

   1. PRELOADER — a maroon sheet over the page: the script wordmark "writes
      in" via a left-to-right clip wipe while a Calypso counter runs 000→100;
      then the sheet lifts and the hero (masthead, then the filmstrip tiles,
      staggered) rises in. Runs on every load for now — gate it behind
      sessionStorage when the design ships if once-per-visit is wanted.

   2. SCROLL REVEALS — every [data-reveal] rises in once as it enters the
      viewport. Driven by IntersectionObserver, NOT ScrollTrigger: on this
      page ScrollTrigger's start positions proved unreliable under the Lenis
      setup and left sections invisible. IO fires straight off the compositor
      and cannot mis-measure. Elements that ALSO carry [data-parallax] fade
      only — their transform belongs to the parallax and must not be fought
      over.

   3. PARALLAX — [data-parallax="<px>"] drifts from +px to −px as it crosses
      the viewport, updated on the shared GSAP ticker from live
      getBoundingClientRect reads (own transform compensated). Values are
      small on purpose.

   4. PETALS — [data-petal] rocks side to side on a slow yoyo loop while
      idle, and falls gently downward as the petal field (About + Selected
      Works, see PetalField.tsx) scrolls past. Fall distance is a fraction
      of the field's height, so it scales with the content.

   Reduced motion: everything is skipped — the overlay is removed instantly
   and the page renders static. (app/v4.css kills CSS animation, but GSAP
   writes inline styles, so it must check on its own.) */

export default function PhotoMotion() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLParagraphElement>(null);
  const countRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const word = wordRef.current;
    const count = countRef.current;
    if (!overlay || !word || !count) return;

    const root = document.documentElement;
    // Clears the preload gate raised by the inline script in page.tsx.
    const openGate = () => root.removeAttribute("data-loading");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      overlay.style.display = "none";
      openGate();
      return;
    }

    type LenisWindow = Window & {
      __lenis?: { stop: () => void; start: () => void };
    };
    const lenis = (window as LenisWindow).__lenis;
    // CSS locks the scrollbar, but Lenis runs its own scroll and ignores it.
    lenis?.stop();

    const ctx = gsap.context(() => {
      /* ── 1. Preloader + hero intro ─────────────────────────────────── */

      gsap.set(word, { clipPath: "inset(0 100% 0 0)" });
      gsap.set("[data-hero-mast]", { autoAlpha: 0, y: 26 });
      gsap.set("[data-hero-tile]", { autoAlpha: 0, y: 60 });

      const progress = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => gsap.set(overlay, { display: "none" }),
      });

      tl.to(progress, {
        v: 100,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          count.textContent = String(Math.round(progress.v)).padStart(3, "0");
        },
      })
        // The wordmark writes in while the counter runs.
        .to(
          word,
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 1.6,
            ease: "power2.inOut",
          },
          0.15,
        )
        // Sheet lifts — the page is revealed and scrolling is handed back at
        // the same moment, so the content is never visible behind the sheet
        // and never scrollable while hidden.
        .to(overlay, {
          yPercent: -100,
          duration: 0.9,
          ease: "power4.inOut",
          onStart: () => {
            openGate();
            lenis?.start();
          },
        })
        // Hero rises in underneath it.
        .to(
          "[data-hero-mast]",
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.35",
        )
        .to(
          "[data-hero-tile]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.07,
          },
          "<0.15",
        );
    });

    /* ── 2. Scroll reveals (IntersectionObserver) ────────────────────── */

    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
          });
        }
      },
      // Fire when the element's top clears the bottom ~12% of the viewport.
      { rootMargin: "0px 0px -12% 0px" },
    );
    revealEls.forEach((el) => {
      const hasParallax = el.hasAttribute("data-parallax");
      // Parallax owns the transform; reveal-only elements also rise.
      gsap.set(el, { autoAlpha: 0, ...(hasParallax ? {} : { y: 28 }) });
      io.observe(el);
    });

    /* ── 3. Parallax drift (GSAP ticker) ─────────────────────────────── */

    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]"),
    )
      .map((el) => ({
        el,
        depth: parseFloat(el.dataset.parallax || "0"),
        cur: 0,
        set: gsap.quickSetter(el, "y", "px") as (v: number) => void,
      }))
      .filter((it) => it.depth !== 0);

    /* ── 4. Petals — idle sway + slow downward scroll drift ──────────────

       Two motions on one element, kept apart so neither overwrites the
       other: GSAP tweens `rotation` (the sway, a yoyo loop) while the ticker
       writes `y` (the drift). They compose into one transform because GSAP
       tracks the properties independently — which is also why the base angle
       comes from a data attribute instead of a CSS rotate(). */

    const petalLayer =
      document.querySelector<HTMLElement>("[data-petal]")?.parentElement ??
      null;

    const petals = Array.from(
      document.querySelectorAll<HTMLElement>("[data-petal]"),
    ).map((el) => {
      const rot = parseFloat(el.dataset.petalRot || "0");
      const sway = parseFloat(el.dataset.petalSway || "0");
      const dur = parseFloat(el.dataset.petalDur || "6");

      gsap.set(el, {
        rotation: rot,
        // Mirror the reused cutouts so repeats do not read as copies. scaleX
        // is part of the same transform GSAP owns, so it is set here too.
        scaleX: el.dataset.petalFlip === "1" ? -1 : 1,
      });

      // Rock gently either side of the rest angle, forever.
      const tween = gsap.to(el, {
        rotation: rot + sway,
        duration: dur,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        startAt: { rotation: rot - sway },
      });

      return {
        el,
        tween,
        // Fraction of the field's height this petal falls end to end.
        fall: parseFloat(el.dataset.petalFall || "0"),
        cur: 0,
        set: gsap.quickSetter(el, "y", "px") as (v: number) => void,
      };
    });

    const onTick = () => {
      const vh = window.innerHeight;

      // Petals fall DOWN as the field scrolls past: progress is measured
      // once across the WHOLE field (About + Selected Works), so a petal
      // keeps falling continuously across the section boundary instead of
      // resetting at it. Each petal's `fall` is a fraction of the field's
      // height, so the distance scales with the content rather than being a
      // fixed pixel value that would look different on every screen.
      if (petalLayer && petals.length) {
        const fr = petalLayer.getBoundingClientRect();
        // 0 when the field's top reaches the viewport top, 1 when its bottom
        // does — i.e. the whole time the field is scrolling through.
        const t = gsap.utils.clamp(0, 1, -fr.top / Math.max(fr.height, 1));
        for (const p of petals) {
          if (!p.fall) continue;
          const y = t * p.fall * fr.height;
          if (Math.abs(y - p.cur) > 0.05) {
            p.cur = y;
            p.set(y);
          }
        }
      }

      for (const it of items) {
        const r = it.el.getBoundingClientRect();
        // Subtract our own translate so the read is the element's resting
        // position — otherwise the output feeds back into the input.
        const centre = r.top - it.cur + r.height / 2;
        // -1 when the element's centre is at the top edge, +1 at the bottom.
        const p = gsap.utils.clamp(
          -1,
          1,
          (centre - vh / 2) / (vh / 2 + r.height / 2),
        );
        const y = p * it.depth;
        if (Math.abs(y - it.cur) > 0.05) {
          it.cur = y;
          it.set(y);
        }
      }
    };
    const needsTicker = items.length > 0 || petals.length > 0;
    if (needsTicker) gsap.ticker.add(onTick);

    return () => {
      // Unmounting mid-preload must never strand the page hidden or locked.
      openGate();
      lenis?.start();
      io.disconnect();
      if (needsTicker) gsap.ticker.remove(onTick);
      petals.forEach((p) => p.tween.kill());
      ctx.revert();
    };
  }, []);

  return (
    <div className={styles.overlay} ref={overlayRef} aria-hidden="true">
      <p className={styles.eyebrow}>[ est. 2018 — changanassery, kerala ]</p>
      <p className={styles.word} ref={wordRef}>
        Aira Photography
      </p>
      <p className={styles.count} ref={countRef}>
        000
      </p>
    </div>
  );
}
