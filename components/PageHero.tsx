"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "@/lib/gsap";

gsap.registerPlugin(SplitText, ScrollTrigger);

// Same curve language as the homepage hero — a flat bottom edge that the
// burgundy band carries into the cream body. Sub-brand pages reuse it so each
// page opens with the homepage's rhythm without re-running the preloader morph.
const CURVE_FLAT = "M0,120 L0,120 C360,120 1080,120 1440,120 L1440,120 Z";
const CURVE_DEEP = "M0,120 L0,60 C360,0 1080,0 1440,60 L1440,120 Z";

type PageHeroProps = {
  /** Cursive Alex-Brush eyebrow above the title (e.g. "the gallery"). */
  eyebrow: string;
  /** Main Nohemi title. Split into words and risen in, like the homepage hero. */
  title: string;
  /** Lighter-weight trailing line under the title. */
  subtitle?: string;
};

/**
 * Shared sub-brand page hero: a burgundy band with a script eyebrow, a
 * word-rise Nohemi title (SplitText), the gold sparkle divider, and the bottom
 * curve morph on scroll. Mirrors HeroPreloader's entrance feel and its
 * prefers-reduced-motion early-return, but without the loader carousel.
 */
export default function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const curvePathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const eyebrowEl = root.querySelector(".page-hero__eyebrow");
      const dividerEl = root.querySelector(".page-hero__divider");
      const subtitleEl = root.querySelector(".page-hero__subtitle");
      const titleEl = root.querySelector(".page-hero__title");

      let split: SplitText | undefined;
      if (titleEl) split = new SplitText(titleEl, { type: "words", mask: "words" });

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Curve scroll-morph is shared between both motion paths.
      const wireCurve = () => {
        if (!curvePathRef.current) return undefined;
        gsap.set(curvePathRef.current, { attr: { d: CURVE_FLAT } });
        const curveTween = gsap.to(curvePathRef.current, {
          attr: { d: CURVE_DEEP },
          ease: "power2.out",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.5 },
        });
        return curveTween;
      };

      if (prefersReduced) {
        if (split) gsap.set(split.words, { yPercent: 0 });
        gsap.set([eyebrowEl, dividerEl, subtitleEl], { autoAlpha: 1, yPercent: 0 });
        const curveTween = wireCurve();
        return () => {
          curveTween?.scrollTrigger?.kill();
          curveTween?.kill();
          split?.revert();
        };
      }

      gsap.set(eyebrowEl, { autoAlpha: 0, yPercent: 40 });
      if (split) gsap.set(split.words, { yPercent: 110 });
      gsap.set([dividerEl, subtitleEl], { autoAlpha: 0, yPercent: 80 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(eyebrowEl, { autoAlpha: 1, yPercent: 0, duration: 1 }, 0.1);
      if (split && split.words.length) {
        tl.to(split.words, { yPercent: 0, stagger: 0.06, duration: 1 }, "-=0.7");
      }
      tl.to(dividerEl, { autoAlpha: 1, yPercent: 0, duration: 0.9 }, "-=0.75");
      if (subtitleEl) {
        tl.to(subtitleEl, { autoAlpha: 1, yPercent: 0, duration: 0.9 }, "-=0.7");
      }

      const curveTween = wireCurve();
      return () => {
        tl.kill();
        curveTween?.scrollTrigger?.kill();
        curveTween?.kill();
        split?.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} aria-label={title} className="page-hero">
      <style>{`
        .page-hero {
          position: relative;
          background-color: var(--color-primary-dark);
          color: var(--color-cream);
          min-height: clamp(60vh, 66vh, 78vh);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--space-2xl) var(--space-md) var(--space-xl);
          overflow: hidden;
        }
        /* Maroon-fleur damask background — same image as the homepage hero, so
           every page opens on the same backdrop. A scrim keeps the title legible. */
        .page-hero__bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: url("/images/hero-bg.jpg");
          background-size: cover;
          background-position: center;
        }
        .page-hero__bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              120% 100% at 50% 40%,
              rgba(90, 22, 22, 0.35) 0%,
              rgba(90, 22, 22, 0.62) 70%,
              rgba(60, 14, 14, 0.78) 100%
            );
        }
        .page-hero > *:not(.page-hero__bg) { position: relative; z-index: 1; will-change: transform; }

        .page-hero__eyebrow {
          font-family: var(--font-script), cursive;
          color: var(--color-gold-light);
          font-size: clamp(2rem, 5.5vw, 3.4em);
          line-height: 1;
          margin-bottom: 0.1em;
        }

        .page-hero__title {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400;
          font-size: clamp(2rem, 6vw, 4.6em);
          line-height: 1.04;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          max-width: 16ch;
          text-shadow: 0 2px 28px rgba(26, 10, 10, 0.4);
        }

        .page-hero__divider {
          display: flex;
          align-items: center;
          gap: 1em;
          margin-top: 1.1em;
        }
        .page-hero__divider span {
          display: block;
          width: 4.5em;
          height: 1px;
          background-color: var(--color-gold);
          opacity: 0.55;
        }

        .page-hero__subtitle {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200;
          font-size: clamp(0.95rem, 1.6vw, 1.05em);
          line-height: 1.7;
          letter-spacing: 0.04em;
          color: var(--color-cream-dark);
          max-width: 46ch;
          margin-top: 1.4em;
        }

        .page-hero__curve {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 8vw;
          min-height: 60px;
          max-height: 120px;
          display: block;
          z-index: 4;
        }

        @media (max-width: 767px) {
          .page-hero {
            min-height: 56vh;
            padding: calc(var(--space-2xl) + 2em) var(--space-md) var(--space-lg);
          }
          .page-hero__title { font-size: clamp(1.7rem, 9vw, 2.6rem); max-width: 18ch; }
          .page-hero__subtitle { font-size: max(16px, 1rem); line-height: 1.6; }
        }
      `}</style>

      <div className="page-hero__bg" aria-hidden="true" />

      <p className="page-hero__eyebrow">{eyebrow}</p>

      <h1 className="page-hero__title">{title}</h1>

      <div className="page-hero__divider" aria-hidden="true">
        <span />
        <svg width="13" height="13" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z" fill="#c9a96e" opacity="0.85" />
        </svg>
        <span />
      </div>

      {subtitle ? <p className="page-hero__subtitle">{subtitle}</p> : null}

      <svg
        className="page-hero__curve"
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path ref={curvePathRef} fill="var(--color-cream)" />
      </svg>
    </section>
  );
}
