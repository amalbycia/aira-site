"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { GalleryPhoto } from "./types";
import styles from "./FilmstripGallery.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Filmstrip gallery — the v3 showpiece.
 *
 * Desktop (≥1024px, motion allowed): the section pins and the strip of photos
 * tracks horizontally with scroll, like pulling a contact sheet through a
 * loupe. One transform on one element — the cheapest scrub there is — and the
 * frames use fixed aspect-ratios, so the track's width is known before a
 * single image loads and the pin distance never recalculates mid-scroll.
 *
 * Mobile and reduced-motion: a plain vertical grid with the standard one-shot
 * batch reveal. Scrubbed motion never ships to touch — that's where jank
 * lives, and the brief is zero jank.
 *
 * Prop contract matches the v2 gallery, so GalleryWithLightbox and the Bunny
 * CDN wiring in lib/cms/getPage.ts feed it unchanged.
 */
export default function FilmstripGallery({
  eyebrow,
  heading,
  photos,
  onPhotoClick,
}: {
  eyebrow?: string;
  heading?: string;
  photos: GalleryPhoto[];
  onPhotoClick?: (index: number) => void;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      // ── Desktop: pin + horizontal scrub ─────────────────────────────────
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const track = el.querySelector<HTMLElement>(`.${styles.track}`);
          const stage = el.querySelector<HTMLElement>(`.${styles.stage}`);
          const bar = el.querySelector<HTMLElement>(`.${styles.progress}`);
          if (!track || !stage) return;

          const distance = () =>
            Math.max(0, track.scrollWidth - stage.clientWidth);

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          tl.to(track, { x: () => -distance(), ease: "none" }, 0);
          if (bar) tl.to(bar, { scaleX: 1, ease: "none" }, 0);
        },
      );

      // ── Mobile / reduced motion: one-shot batch reveal ──────────────────
      mm.add(
        "(max-width: 1023px), (prefers-reduced-motion: reduce)",
        (ctx) => {
          const items = gsap.utils.toArray<HTMLElement>(
            `.${styles.frame}`,
            el,
          );
          if (!items.length) return;

          if (
            (ctx.conditions as { [k: string]: boolean } | undefined)?.[
              "(prefers-reduced-motion: reduce)"
            ] ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ) {
            gsap.set(items, { opacity: 1, y: 0 });
            return;
          }

          gsap.set(items, { opacity: 0, y: 26 });
          ScrollTrigger.batch(items, {
            start: "top 92%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.07,
              }),
          });
        },
      );

      return () => mm.revert();
    },
    { scope: root, dependencies: [photos.length] },
  );

  if (!photos || photos.length === 0) return null;

  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <section ref={root} className={styles.section}>
      <div className={styles.stage}>
        {(eyebrow || heading) && (
          <div className={`shell ${styles.head}`}>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {heading ? <h2 className="display">{heading}</h2> : null}
            <span className={styles.count} aria-hidden="true">
              {String(photos.length).padStart(2, "0")} frames
            </span>
          </div>
        )}

        <div className={styles.trackWrap}>
          <ul className={styles.track}>
            {photos.map((photo, i) => (
              <li
                key={`${photo.src}-${i}`}
                className={styles.frame}
                data-shape={SHAPES[i % SHAPES.length]}
              >
                <button
                  type="button"
                  className={styles.frameBtn}
                  onClick={() => onPhotoClick?.(i)}
                  aria-label={`View photo ${i + 1} of ${photos.length}: ${photo.alt}`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 1023px) 92vw, 40vw"
                    quality={80}
                    loading={i < 3 ? "eager" : "lazy"}
                    style={{ objectFit: "cover" }}
                  />
                </button>
                <span className={styles.frameIndex} aria-hidden="true">
                  {pad(i)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.progressRail} aria-hidden="true">
          <span className={styles.progress} />
        </div>
      </div>
    </section>
  );
}

/** Frame rhythm: portrait / landscape / square, repeating. */
const SHAPES = ["p", "l", "p", "s", "l", "p"] as const;
