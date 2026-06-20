"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/dist/CustomEase";
import { ScrollTrigger } from "@/lib/gsap";

gsap.registerPlugin(SplitText, CustomEase, ScrollTrigger);
CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");

const HERO_BG = "/images/hero-bg.jpg";

// Carousel imagery. The CENTER image is the real hero background, so when it
// expands it lands seamlessly as the hero. The side tiles are real wedding
// photos, optimized to 800px square WebP (scripts/optimize-hero-tiles.mjs).
const LOADER_IMAGES = [
  "/images/hero-tile-1.webp",
  "/images/hero-tile-2.webp",
  HERO_BG,
  "/images/hero-tile-3.webp",
  "/images/hero-tile-4.webp",
];

const CENTER_INDEX = 2;

const CURVE_FLAT = "M0,120 L0,120 C360,120 1080,120 1440,120 L1440,120 Z";
const CURVE_DEEP = "M0,120 L0,60 C360,0 1080,0 1440,60 L1440,120 Z";

// Set once the carousel/morph has played; checked on every mount so navigating
// back to "/" later in the same tab skips straight to the resting state.
const PLAYED_KEY = "aira-hero-played";

function initButtonCharacterStagger() {
  const offsetIncrement = 0.01;
  const buttons = document.querySelectorAll("[data-button-animate-chars]");
  buttons.forEach((button) => {
    const text = button.textContent ?? "";
    button.innerHTML = "";
    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;
      if (char === " ") span.style.whiteSpace = "pre";
      button.appendChild(span);
    });
  });
}

function ImageGroup({ duplicate }: { duplicate: boolean }) {
  return (
    <div className={`crisp-loader__group ${duplicate ? "is--duplicate" : "is--relative"}`}>
      {LOADER_IMAGES.map((src, i) => {
        const isCenter = !duplicate && i === CENTER_INDEX;
        return (
          <div className="crisp-loader__single" key={i}>
            <div
              className={
                isCenter
                  ? "crisp-loader__media is--scaling is--radius"
                  : "crisp-loader__media"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className={
                  !duplicate && !isCenter
                    ? "crisp-loader__cover-img is--scale-down"
                    : "crisp-loader__cover-img"
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HeroPreloader() {
  const containerRef = useRef<HTMLElement>(null);
  const curvePathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      initButtonCharacterStagger();

      // ── Selectors mirrored 1:1 from the Osmo source ──────────────────────
      const revealImages = container.querySelectorAll(".crisp-loader__group > *");
      const isScaleUp = container.querySelectorAll(".crisp-loader__media");
      const isScaleDown = container.querySelectorAll(".crisp-loader__media .is--scale-down");
      const isRadius = container.querySelectorAll(".crisp-loader__media.is--scaling.is--radius");

      // The REAL hero title gets the same word-mask rise the Osmo heading had.
      const heroTitle = container.querySelectorAll(".hero-title");
      const heroButtons = container.querySelectorAll(".hero-cta-group > *");
      const heroDivider = container.querySelector(".hero-divider");

      // SplitText the actual hero title into words (masked).
      let split: SplitText | undefined;
      if (heroTitle.length) {
        split = new SplitText(heroTitle, { type: "words", mask: "words" });
      }

      // ── Reduced motion: skip the whole loader/morph, show the hero instantly.
      //    (Accessibility — does NOT alter the standard-motion parameters.) ────
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // ── Already played this session: skip straight to the resting state too,
      //    so navigating away from "/" and back doesn't replay the carousel. ──
      let alreadyPlayed = false;
      if (typeof window !== "undefined") {
        try {
          alreadyPlayed = window.sessionStorage.getItem(PLAYED_KEY) === "1";
        } catch {
          // sessionStorage unavailable (private mode, etc.) — fall back to playing.
          alreadyPlayed = false;
        }
      }

      if (prefersReduced || alreadyPlayed) {
        container.classList.remove("is--hidden", "is--loading");
        isRadius.forEach((el) => el.classList.remove("is--radius"));
        gsap.set(isScaleUp, { width: "100vw", height: "100dvh" });
        if (split) gsap.set(split.words, { yPercent: 0 });
        gsap.set([heroDivider, ...heroButtons], { yPercent: 0, autoAlpha: 1 });
        if (curvePathRef.current) {
          gsap.set(curvePathRef.current, { attr: { d: CURVE_FLAT } });
          const curveTween = gsap.to(curvePathRef.current, {
            attr: { d: CURVE_DEEP },
            ease: "power2.out",
            scrollTrigger: { trigger: container, start: "top top", end: "bottom top", scrub: 0.5 },
          });
          return () => {
            curveTween.scrollTrigger?.kill();
            curveTween.kill();
            split?.revert();
          };
        }
        return () => split?.revert();
      }

      const tl = gsap.timeline({
        defaults: { ease: "expo.inOut" },
        onStart: () => {
          container.classList.remove("is--hidden");
          try {
            window.sessionStorage.setItem(PLAYED_KEY, "1");
          } catch {
            // sessionStorage unavailable — nothing to persist, just skip silently.
          }
        },
      });

      // Pre-set the hero content below view (standard-motion path).
      if (split) gsap.set(split.words, { yPercent: 110 });
      gsap.set([heroDivider, ...heroButtons], { yPercent: 150, autoAlpha: 0 });

      // ── Start of Timeline (1:1) ──────────────────────────────────────────
      if (revealImages.length) {
        tl.fromTo(revealImages, { xPercent: 500 }, { xPercent: -500, duration: 2.5, stagger: 0.05 });
      }

      if (isScaleDown.length) {
        tl.to(
          isScaleDown,
          {
            scale: 0.5,
            duration: 2,
            stagger: { each: 0.05, from: "edges", ease: "none" },
            onComplete: () => {
              isRadius.forEach((el) => el.classList.remove("is--radius"));
            },
          },
          "-=0.1",
        );
      }

      if (isScaleUp.length) {
        tl.fromTo(
          isScaleUp,
          { width: "10em", height: "10em" },
          { width: "100vw", height: "100dvh", duration: 2 },
          "< 0.5",
        );
      }

      // ── Structural reveal: drop is--loading so the expanded image stays as
      //    the hero bg and the hero content becomes visible to animate in. ────
      tl.call(
        () => {
          container.classList.remove("is--loading");
        },
        undefined,
        "-=0.95",
      );

      // Hero TITLE words rise in (same feel as the Osmo heading), then buttons.
      if (split && split.words.length) {
        tl.to(
          split.words,
          { yPercent: 0, stagger: 0.075, ease: "expo.out", duration: 1 },
          "-=0.8",
        );
      }

      if (heroDivider) {
        tl.to(heroDivider, { yPercent: 0, autoAlpha: 1, ease: "expo.out", duration: 0.9 }, "< 0.15");
      }

      if (heroButtons.length) {
        tl.to(
          heroButtons,
          { yPercent: 0, autoAlpha: 1, stagger: 0.08, ease: "expo.out", duration: 1 },
          "< 0.1",
        );
      }

      // ── Bottom curve scroll morph (ported from HeroSection) ───────────────
      if (curvePathRef.current) {
        gsap.set(curvePathRef.current, { attr: { d: CURVE_FLAT } });
        const curveTween = gsap.to(curvePathRef.current, {
          attr: { d: CURVE_DEEP },
          ease: "power2.out",
          scrollTrigger: { trigger: container, start: "top top", end: "bottom top", scrub: 0.5 },
        });
        return () => {
          curveTween.scrollTrigger?.kill();
          curveTween.kill();
          tl.kill();
          split?.revert();
        };
      }

      return () => {
        tl.kill();
        split?.revert();
      };
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      aria-label="Hero"
      className="crisp-header is--loading is--hidden"
    >
      <style>{`
        .crisp-header {
          /* Plain cream backdrop — this only shows BEHIND the carousel tiles
             while the preloader plays. The center tile (the red hero-bg image)
             expands to 100vw/100dvh and BECOMES the hero background, fully
             covering this cream by the time the morph ends. */
          background-color: var(--color-cream);
          color: var(--color-ink);
          justify-content: center;
          align-items: center;
          display: flex;
          position: relative;
          overflow: hidden;
          width: 100%;
          min-height: calc(100vh - 2em);
        }

        /* Loading: header invisible until the timeline's onStart unhides it */
        .crisp-header.is--loading.is--hidden { visibility: hidden; }

        /* Loading: hero content + curve hidden until the reveal */
        .crisp-header.is--loading .hero-content,
        .crisp-header.is--loading .hero-curve { visibility: hidden; }

        /* The loader stays mounted before AND after reveal — its center image
           expands to become the hero background, so it must not be removed.
           Only the side fade gradients are dropped when is--loading is gone. */
        .crisp-header:not(.is--loading) .crisp-loader__fade { display: none; }

        /* ── Loader (Osmo crisp) ── */
        .crisp-loader {
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          font-size: 1vw;
          display: flex;
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1;
        }
        .crisp-loader__wrap {
          font-size: var(--size-font);
          justify-content: center;
          align-items: center;
          display: flex;
          position: relative;
        }
        .crisp-loader__groups { position: relative; overflow: hidden; }
        .crisp-loader__group {
          border-radius: 0.5em;
          justify-content: center;
          align-items: center;
          display: flex;
          position: relative;
        }
        .crisp-loader__group.is--relative { position: relative; left: 100%; }
        .crisp-loader__group.is--duplicate { position: absolute; }
        .crisp-loader__single { padding-left: 1em; padding-right: 1em; position: relative; }
        .crisp-loader__media {
          border-radius: 0.5em;
          justify-content: center;
          align-items: center;
          width: 10em;
          height: 10em;
          display: flex;
          position: relative;
        }
        .crisp-loader__media.is--scaling {
          will-change: transform;
          border-radius: 0;
          transition-property: border-radius;
          transition-duration: 0.5s;
          transition-timing-function: cubic-bezier(1, 0, 0, 1);
          display: flex;
        }
        .crisp-loader__media.is--scaling.is--radius { border-radius: 0.5em; }
        .crisp-loader__cover-img {
          object-fit: cover;
          border-radius: inherit;
          width: 100%;
          height: 100%;
          position: absolute;
        }
        .crisp-loader__cover-img.is--scale-down { will-change: transform; }
        .crisp-loader__fade {
          /* Cream to match the plain preloader backdrop — fades the carousel
             edges into the cream while the loader plays (gradient is dropped
             via display:none once is--loading is removed). */
          pointer-events: none;
          background-image: linear-gradient(90deg, var(--color-cream) 20%, transparent);
          width: 5em;
          height: calc(100% + 2px);
          position: absolute;
          top: -1px;
          left: -1px;
        }
        .crisp-loader__fade.is--duplicate { left: auto; right: -1px; transform: scaleX(-1); }

        /* ── Hero content (revealed via class swap, sits over expanded image) ── */
        .hero-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: var(--space-lg) var(--space-md);
          width: 100%;
        }
        .hero-content > * { will-change: transform; }

        .hero-title {
          color: var(--color-cream);
          font-family: var(--font-nohemi), sans-serif;
          font-size: clamp(1.8rem, 4.2vw, 3.6em);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: nowrap;
          margin-bottom: 0.6em;
          text-shadow: 0 2px 24px rgba(26, 10, 10, 0.45);
        }
        .hero-title__sub {
          color: var(--color-cream-dark);
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200;
          font-style: normal;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .btn-animate-chars {
          color: var(--color-ink);
          cursor: pointer;
          font-size: 0.85em;
          font-family: var(--font-dm-sans), sans-serif;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: none;
          background-color: var(--color-gold);
          min-width: 14em;
          border-radius: 999px;
          padding: 0.9em 1.1em 0.65em 3em;
        }
        .btn-animate-chars__text {
          white-space: nowrap;
          line-height: 1.3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6em;
          width: 100%;
        }
        .btn-animate-chars [data-button-animate-chars] {
          overflow: hidden;
          position: relative;
          display: flex;
          justify-content: center;
          text-align: center;
        }
        .btn-animate-chars [data-button-animate-chars] span {
          display: inline-block;
          position: relative;
          text-shadow: 0px 1.3em currentColor;
          transform: translateY(0em) rotate(0.001deg);
          transition: transform 0.6s cubic-bezier(0.625, 0.05, 0, 1);
        }
        .btn-animate-chars:hover [data-button-animate-chars] span {
          transform: translateY(-1.3em) rotate(0.001deg);
        }
        .btn-animate-chars__bg {
          border-radius: 999px;
          background-color: var(--color-gold);
          position: absolute;
          inset: 0;
          transition: background-color 0.6s cubic-bezier(0.625, 0.05, 0, 1),
                      inset 0.6s cubic-bezier(0.625, 0.05, 0, 1);
        }
        .btn-animate-chars:hover .btn-animate-chars__bg {
          background-color: var(--color-gold-light);
          inset: 0.125em;
        }
        .btn-animate-chars:hover { color: var(--color-ink); }

        .hero-curve {
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
          .hero-title {
            font-size: clamp(1.6rem, 7vw, 2.4rem);
            white-space: normal;
            max-width: 26ch;
            margin-left: auto;
            margin-right: auto;
          }
          .btn-animate-chars {
            min-width: 0;
            width: 100%;
            max-width: 22em;
            padding: 0.9em 1.5em;
            font-size: 0.8em;
          }
          .hero-cta-group { width: 100%; padding: 0 1em; }
        }
      `}</style>

      {/* Loader carousel — center image is the real hero bg, expands to fill */}
      <div className="crisp-loader">
        <div className="crisp-loader__wrap">
          <div className="crisp-loader__groups">
            <ImageGroup duplicate />
            <ImageGroup duplicate={false} />
          </div>
          <div className="crisp-loader__fade" />
          <div className="crisp-loader__fade is--duplicate" />
        </div>
      </div>

      {/* Hero content — sits over the expanded image, revealed via class swap */}
      <div className="hero-content">
        <h1 className="hero-title">
          Agnitantra Events{" "}
          <span className="hero-title__sub">&amp; Aira Photography</span>
        </h1>

        <div
          className="hero-divider"
          aria-hidden="true"
          style={{ display: "flex", alignItems: "center", gap: "1em", marginBottom: "var(--space-sm)" }}
        >
          <span style={{ display: "block", width: "4em", height: "1px", backgroundColor: "var(--color-gold)", opacity: 0.6 }} />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z" fill="#c9a96e" opacity="0.8" />
          </svg>
          <span style={{ display: "block", width: "4em", height: "1px", backgroundColor: "var(--color-gold)", opacity: 0.6 }} />
        </div>

        <div
          className="hero-cta-group"
          style={{ display: "flex", flexWrap: "wrap", gap: "1em", justifyContent: "center" }}
        >
          <Link href="/photography" className="btn-animate-chars">
            <div className="btn-animate-chars__bg" />
            <span className="btn-animate-chars__text">
              <span data-button-animate-chars="">Our Photography</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>

          <Link href="/events" className="btn-animate-chars">
            <div className="btn-animate-chars__bg" />
            <span className="btn-animate-chars__text">
              <span data-button-animate-chars="">Events &amp; Catering</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      {/* Curved transition into next section */}
      <svg
        className="hero-curve"
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path ref={curvePathRef} fill="var(--color-cream)" />
      </svg>
    </section>
  );
}
