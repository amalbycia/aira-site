"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { horizontalLoop, type LoopTimeline } from "@/lib/horizontalLoop";
import type { GalleryPhoto } from "./types";

// Register the plugins the loop helper needs (idempotent).
gsap.registerPlugin(Draggable, InertiaPlugin);

/**
 * Full-screen photo lightbox — a faithful reproduction of Osmo's "Draggable
 * Infinite Slider (GSAP Draggable)" demo mechanics:
 *   - engine: GreenSock `horizontalLoop` (lib/horizontalLoop.ts), draggable
 *     with InertiaPlugin momentum + snap
 *   - `center: true` keeps the active slide centered
 *   - active slide distinguished by OPACITY (0.2 inactive → 1 active) with a
 *     `transition: opacity .4s`, exactly like the demo
 *   - prev/next framed-corner buttons + a rolling NN / total step counter
 * Slides keep the demo's 3:2 landscape proportion. Chrome is recoloured to the
 * site palette (maroon/cream/gold). Opened by clicking a gallery photo.
 */
export default function PhotoLightbox({
  photos,
  openIndex,
  onClose,
}: {
  photos: GalleryPhoto[];
  /** Index to open at, or null when closed. */
  openIndex: number | null;
  onClose: () => void;
}) {
  const isOpen = openIndex !== null;
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stepColRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<LoopTimeline | null>(null);
  const [total] = useState(photos.length);

  // Build / tear down the slider whenever it opens (mirrors
  // initDraggableInfiniteGSAPSlider from the demo).
  useEffect(() => {
    if (!isOpen || !trackRef.current) return;

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const slides = gsap.utils.toArray<HTMLElement>(
      trackRef.current.querySelectorAll('[data-slider="slide"]'),
    );
    if (!slides.length) return;

    // Rolling step counter: the column holds one number per slide, translated
    // vertically by -100% * index (demo's `allSteps` / `gsap.to(...y...)`).
    const stepEls = stepColRef.current
      ? gsap.utils.toArray<HTMLElement>(
          stepColRef.current.querySelectorAll("[data-step]"),
        )
      : [];

    const applyActive = (index: number, animate: boolean) => {
      slides.forEach((s, i) => s.classList.toggle("active", i === index));
      if (stepEls.length) {
        if (animate) {
          gsap.to(stepEls, { y: `${-100 * index}%`, ease: "power3", duration: 0.45 });
        } else {
          gsap.set(stepEls, { y: `${-100 * index}%` });
        }
      }
    };

    const loop = horizontalLoop(slides, {
      paused: true,
      draggable: !prefersReduced, // momentum drag; skip for reduced-motion
      center: true,
      speed: 1,
      onChange: (_el, index) => applyActive(index, true),
    });
    loopRef.current = loop;

    // Open on the clicked photo, no animation.
    loop.toIndex(openIndex!, { duration: 0 });
    applyActive(loop.current(), false);

    // Click a non-active slide → bring it to center (demo: loop.toIndex(i)).
    const clickHandlers: Array<() => void> = [];
    slides.forEach((slide, i) => {
      const h = () => {
        if (slide.classList.contains("active")) return;
        loop.toIndex(i, { ease: "power3", duration: 0.725 });
      };
      slide.addEventListener("click", h);
      clickHandlers.push(() => slide.removeEventListener("click", h));
    });

    return () => {
      clickHandlers.forEach((fn) => fn());
      loop.draggable?.kill();
      loop.kill();
      loopRef.current = null;
    };
    // Rebuild only on open/close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Keyboard: ESC closes, arrows page. Body scroll lock while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft")
        loopRef.current?.previous({ ease: "power3", duration: 0.725 });
      else if (e.key === "ArrowRight")
        loopRef.current?.next({ ease: "power3", duration: 0.725 });
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    rootRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const prev = () => loopRef.current?.previous({ ease: "power3", duration: 0.725 });
  const next = () => loopRef.current?.next({ ease: "power3", duration: 0.725 });
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div
      ref={rootRef}
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      tabIndex={-1}
    >
      <style>{`
        .lb {
          position: fixed;
          inset: 0;
          z-index: 100;
          overflow: hidden;
          outline: none;
          animation: lb-fade 260ms ease both;
        }
        @keyframes lb-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .lb { animation: none; } }

        /* Scrim behind the slides so photos render true-colour. */
        .lb__scrim {
          position: absolute;
          inset: 0;
          z-index: 0;
          /* Near-neutral dark so the centered photo renders true-colour; the
             maroon only tints the corners as a faint vignette, never the middle. */
          background:
            radial-gradient(130% 100% at 50% 50%, transparent 55%, rgba(90,22,22,0.35) 100%),
            rgba(14, 10, 10, 0.96);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .lb__backdrop { position: absolute; inset: 0; z-index: 1; }

        /* ── Slider (Osmo structure) ─────────────────────────────────────── */
        .lb__wrap {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .lb__list {
          display: flex;
          flex-flow: row;
          align-items: stretch;
          position: relative;
          cursor: grab;
        }
        .lb__list:active { cursor: grabbing; }

        /* Demo values: aspect-ratio 3/2, width 36vw, 1.25em side padding,
           transition: opacity .4s. */
        .lb__slide {
          flex: none;
          width: 36vw;
          aspect-ratio: 3 / 2;
          padding-left: 1.25em;
          padding-right: 1.25em;
          position: relative;
          opacity: 0.2;
          transition: opacity 0.4s;
          cursor: pointer;
        }
        .lb__slide.active { opacity: 1; cursor: default; }
        .lb__slide-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 0.5em;
          overflow: hidden;
          box-shadow: 0 30px 80px -34px rgba(0,0,0,0.85);
        }
        .lb__slide.active .lb__slide-inner {
          box-shadow:
            0 40px 100px -30px rgba(0,0,0,0.9),
            0 0 0 1px rgba(201,169,110,0.4);
        }
        .lb__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          -webkit-user-drag: none;
          user-select: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .lb__slide { transition: opacity 200ms ease; }
        }

        /* ── Overlay: step counter (left) ─────────────────────────────────── */
        .lb__overlay {
          position: absolute;
          inset: 0 auto 0 0;
          z-index: 3;
          display: flex;
          align-items: center;
          width: 36vw;
          padding-left: 2em;
          color: var(--color-cream);
          pointer-events: none;
          background-image: linear-gradient(90deg, rgba(20,8,8,0.9) 60%, rgba(20,8,8,0));
        }
        .lb__count {
          display: flex;
          align-items: center;
          gap: 0.2em;
          font-family: var(--font-nohemi), sans-serif;
          font-size: clamp(2.4em, 4.5vw, 4.5em);
          font-weight: 700;
          line-height: 1;
        }
        .lb__count-col { height: 1em; overflow: hidden; }
        .lb__count-roll { display: flex; flex-direction: column; }
        .lb__count-num {
          width: 2ch;
          height: 1em;
          line-height: 1;
          font-weight: 400;
        }
        .lb__count-divider {
          width: 2px;
          height: 0.75em;
          background-color: var(--color-gold);
          transform: rotate(15deg);
          margin: 0 0.15em;
          opacity: 0.8;
        }
        .lb__count-total { font-weight: 400; }

        /* ── Framed-corner prev/next buttons (Osmo treatment) ─────────────── */
        .lb__nav {
          position: absolute;
          bottom: clamp(1.4rem, 5vh, 3rem);
          right: clamp(1.4rem, 5vw, 3rem);
          z-index: 4;
          display: flex;
          gap: 1.2em;
        }
        .lb__btn {
          position: relative;
          width: 4em;
          height: 4em;
          display: grid;
          place-items: center;
          color: var(--color-cream);
          background: transparent;
          border: 1px solid rgba(245,237,224,0.25);
          border-radius: 0.4em;
          cursor: pointer;
          transition:
            transform 0.475s cubic-bezier(0.625,0.05,0,1),
            opacity 0.475s cubic-bezier(0.625,0.05,0,1);
        }
        .lb__btn-corners { position: absolute; inset: -1px; z-index: 2;
          transition: transform 0.475s cubic-bezier(0.625,0.05,0,1); }
        .lb__btn-corner {
          position: absolute;
          width: 1em; height: 1em;
          border-top: 1px solid var(--color-gold);
          border-left: 1px solid var(--color-gold);
          border-top-left-radius: 0.4em;
        }
        .lb__btn-corner.tr { inset: 0 0 auto auto; transform: rotate(90deg); }
        .lb__btn-corner.br { inset: auto 0 0 auto; transform: rotate(180deg); }
        .lb__btn-corner.bl { inset: auto auto 0 0; transform: rotate(-90deg); }
        .lb__nav:hover .lb__btn { opacity: 0.4; }
        .lb__btn:hover { transform: scale(0.85); opacity: 1 !important; }
        .lb__btn:hover .lb__btn-corners { transform: scale(1.4); }
        .lb__btn svg { width: 1em; height: 0.75em; }
        .lb__btn--next svg { transform: rotate(180deg); }

        .lb__close {
          position: absolute;
          top: clamp(1rem, 3vw, 1.6rem);
          right: clamp(1rem, 3vw, 1.6rem);
          z-index: 5;
          width: 3rem; height: 3rem;
          border-radius: 999px;
          border: 1px solid rgba(201,169,110,0.5);
          background: rgba(26,10,10,0.35);
          color: var(--color-cream);
          display: grid; place-items: center;
          cursor: pointer;
          transition: background 180ms ease, border-color 180ms ease;
        }
        .lb__close:hover { background: var(--color-primary); border-color: var(--color-gold); }

        @media (max-width: 991px) {
          .lb__slide { width: 78vw; }
          .lb__overlay { width: 78vw; padding-left: 1.2em;
            background-image: linear-gradient(90deg, rgba(20,8,8,0.85) 40%, rgba(20,8,8,0)); }
          .lb__count { font-size: clamp(2em, 9vw, 3.2em); }
          .lb__btn { width: 3.2em; height: 3.2em; }
        }
      `}</style>

      <div className="lb__scrim" aria-hidden="true" />
      <div className="lb__backdrop" onClick={onClose} aria-hidden="true" />

      <button className="lb__close" onClick={onClose} aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="lb__wrap">
        <div ref={trackRef} className="lb__list" data-slider="list">
          {photos.map((photo, i) => (
            <figure key={i} data-slider="slide" className="lb__slide">
              <div className="lb__slide-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="lb__img" src={photo.src} alt={photo.alt} draggable={false} />
              </div>
            </figure>
          ))}
        </div>
      </div>

      {/* Step counter overlay (NN / total), left side — like the demo. */}
      <div className="lb__overlay" aria-hidden="true">
        <div className="lb__count">
          <div className="lb__count-col">
            <div ref={stepColRef} className="lb__count-roll">
              {photos.map((_, i) => (
                <span key={i} data-step="" className="lb__count-num">
                  {pad(i + 1)}
                </span>
              ))}
            </div>
          </div>
          <span className="lb__count-divider" />
          <span className="lb__count-total">{pad(total)}</span>
        </div>
      </div>

      <div className="lb__nav">
        <button className="lb__btn lb__btn--prev" onClick={prev} aria-label="Previous photo">
          <svg viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 1L1 6l5 5M1 6h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="lb__btn-corners">
            <span className="lb__btn-corner" />
            <span className="lb__btn-corner tr" />
            <span className="lb__btn-corner br" />
            <span className="lb__btn-corner bl" />
          </span>
        </button>
        <button className="lb__btn lb__btn--next" onClick={next} aria-label="Next photo">
          <svg viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 1L1 6l5 5M1 6h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="lb__btn-corners">
            <span className="lb__btn-corner" />
            <span className="lb__btn-corner tr" />
            <span className="lb__btn-corner br" />
            <span className="lb__btn-corner bl" />
          </span>
        </button>
      </div>
    </div>
  );
}
