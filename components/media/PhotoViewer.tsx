"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryPhoto } from "./types";

/**
 * Fullscreen photo viewer — one photo centred at a time. Built from scratch with
 * plain React + pointer events (no GSAP loop engine), so it's predictable on both
 * desktop and touch:
 *   - drag / swipe left-right to move between photos (pointer events cover mouse,
 *     touch and pen); a flick past a small threshold advances
 *   - prev / next arrow buttons (large tap targets)
 *   - ← / → keyboard, ESC or backdrop to close
 *   - the active photo is always dead-centre; neighbours peek at the edges,
 *     dimmed, so the middle one is the clear focus
 * Non-looping: at the first/last photo, over-drag rubber-bands and the disabled
 * arrow does nothing. Opened by clicking a gallery photo (openIndex).
 */
export default function PhotoViewer({
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

  // Which photo is centred. Kept in sync with openIndex when (re)opening.
  const [index, setIndex] = useState(0);
  // Live horizontal drag offset in px (0 when settled). Drives the transform so
  // the track follows the finger, then snaps on release.
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  const last = photos.length - 1;

  // Sync the centred photo when the viewer is (re)opened. Guarding on the
  // previous value means we only setState on an actual open, not on every
  // render pass — otherwise this cascades renders while dragging.
  const prevOpenIndex = useRef<number | null>(null);
  useEffect(() => {
    if (openIndex !== null && prevOpenIndex.current !== openIndex) {
      setIndex(openIndex);
      setDrag(0);
    }
    prevOpenIndex.current = openIndex;
  }, [openIndex]);

  const goPrev = useCallback(() => {
    setDrag(0);
    setIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setDrag(0);
    setIndex((i) => Math.min(last, i + 1));
  }, [last]);

  // ── Keyboard + scroll lock while open ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);

    // Lock background scroll. overflow:hidden alone won't hold Lenis back, so
    // stop the shared Lenis instance too (exposed by LenisProvider).
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const lenis = (
      window as Window & { __lenis?: { stop: () => void; start: () => void } }
    ).__lenis;
    lenis?.stop();

    // Hide the site's fixed "Menu" nav button while the viewer is open.
    document.documentElement.classList.add("lb-open");

    rootRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      document.documentElement.classList.remove("lb-open");
    };
  }, [isOpen, onClose, goPrev, goNext]);

  // ── Drag / swipe (pointer events: mouse + touch + pen) ─────────────────────
  const startX = useRef(0);
  const pointerId = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    // Ignore drags starting on a control (arrows / close handle their own click).
    if ((e.target as HTMLElement).closest("[data-viewer-control]")) return;
    pointerId.current = e.pointerId;
    startX.current = e.clientX;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId || !dragging) return;
    let dx = e.clientX - startX.current;
    // Rubber-band at the ends so it feels bounded, not stuck.
    if ((index === 0 && dx > 0) || (index === last && dx < 0)) dx *= 0.35;
    setDrag(dx);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setDragging(false);
    // Advance if dragged past ~12% of viewport width (or a firm 80px), else snap.
    const threshold = Math.min(120, window.innerWidth * 0.12);
    if (drag <= -threshold) goNext();
    else if (drag >= threshold) goPrev();
    else setDrag(0);
  };

  if (!isOpen) return null;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div
      ref={rootRef}
      className="pv"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      tabIndex={-1}
    >
      <style>{`
        .pv {
          position: fixed;
          inset: 0;
          z-index: 200; /* above the site's fixed nav (z-index:100) */
          overflow: hidden;
          outline: none;
          animation: pv-fade 240ms ease both;
          touch-action: none; /* we handle horizontal drag ourselves */
        }
        html.lb-open .sidenav__header { display: none !important; }
        @keyframes pv-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .pv { animation: none; } }

        /* Scrim — near-neutral dark so photos render true colour, faint maroon
           vignette in the corners only. Fully opaque: gallery must not show. */
        .pv__scrim {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(150% 120% at 50% 50%, #34201f 62%, #3d2222 100%);
        }
        /* Click anywhere off the photo to close. */
        .pv__backdrop { position: absolute; inset: 0; z-index: 1; }

        /* ── Track: all slides in a row, translated so the active one centres ── */
        .pv__stage {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          cursor: grab;
        }
        .pv__stage.is-dragging { cursor: grabbing; }
        .pv__track {
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;
          will-change: transform;
        }
        .pv__slide {
          flex: 0 0 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(3.5rem, 8vh, 6rem) clamp(1rem, 4vw, 3rem);
          box-sizing: border-box;
          opacity: 0.35;
          transition: opacity 0.4s ease;
        }
        .pv__slide.is-active { opacity: 1; }
        .pv__img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 0.5em;
          box-shadow: 0 40px 100px -30px rgba(0,0,0,0.9);
          -webkit-user-drag: none;
          user-select: none;
          pointer-events: none; /* let the stage own all drag/click */
        }

        /* ── Step counter (bottom-left) ─────────────────────────────────────── */
        .pv__count {
          position: absolute;
          left: clamp(1.2rem, 4vw, 2.5rem);
          bottom: clamp(1.4rem, 5vh, 3rem);
          z-index: 4;
          display: flex;
          align-items: baseline;
          gap: 0.15em;
          color: var(--color-cream);
          font-family: var(--font-sometimes-times), serif;
          font-size: clamp(2.2em, 4.5vw, 4em);
          line-height: 1;
          pointer-events: none;
          text-shadow: 0 2px 12px rgba(0,0,0,0.6);
        }
        .pv__count-divider {
          width: 2px;
          height: 0.7em;
          background-color: var(--color-gold);
          transform: rotate(15deg);
          margin: 0 0.2em;
          opacity: 0.8;
          align-self: center;
        }
        .pv__count-total { opacity: 0.75; font-size: 0.7em; align-self: flex-end; }

        /* ── Prev / next buttons ────────────────────────────────────────────── */
        .pv__nav {
          position: absolute;
          bottom: clamp(1.4rem, 5vh, 3rem);
          right: clamp(1.4rem, 5vw, 3rem);
          z-index: 4;
          display: flex;
          gap: 1em;
        }
        .pv__btn {
          width: 3.4em;
          height: 3.4em;
          display: grid;
          place-items: center;
          color: var(--color-cream);
          background: rgba(26,10,10,0.4);
          border: 1px solid rgba(201,169,110,0.45);
          border-radius: 0.6em;
          cursor: pointer;
          transition: background 200ms ease, border-color 200ms ease, transform 200ms ease, opacity 200ms ease;
        }
        .pv__btn:hover:not(:disabled) {
          background: var(--color-primary);
          border-color: var(--color-gold);
          transform: translateY(-2px);
        }
        .pv__btn:disabled { opacity: 0.3; cursor: default; }
        .pv__btn svg { width: 1.15em; height: 0.9em; }
        .pv__btn--next svg { transform: rotate(180deg); }

        .pv__close {
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
        .pv__close:hover { background: var(--color-primary); border-color: var(--color-gold); }

        @media (max-width: 991px) {
          .pv__btn { width: 3em; height: 3em; }
          .pv__slide { padding: clamp(3rem, 7vh, 4.5rem) 0.6rem; }
        }
      `}</style>

      <div className="pv__scrim" aria-hidden="true" />
      <div className="pv__backdrop" onClick={onClose} aria-hidden="true" />

      <button
        className="pv__close"
        data-viewer-control=""
        onClick={onClose}
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div
        className={`pv__stage${dragging ? " is-dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="pv__track"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${drag}px))`,
            transition: dragging ? "none" : "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`pv__slide${i === index ? " is-active" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pv__img" src={photo.src} alt={photo.alt} draggable={false} />
            </div>
          ))}
        </div>
      </div>

      <div className="pv__count" aria-hidden="true">
        <span>{pad(index + 1)}</span>
        <span className="pv__count-divider" />
        <span className="pv__count-total">{pad(photos.length)}</span>
      </div>

      <div className="pv__nav">
        <button
          className="pv__btn pv__btn--prev"
          data-viewer-control=""
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous photo"
        >
          <svg viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 1L1 6l5 5M1 6h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className="pv__btn pv__btn--next"
          data-viewer-control=""
          onClick={goNext}
          disabled={index === last}
          aria-label="Next photo"
        >
          <svg viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 1L1 6l5 5M1 6h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
