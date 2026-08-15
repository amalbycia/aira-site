"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { GalleryPhoto } from "./types";
import styles from "./EditorialGallery.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Editorial masonry gallery.
 *
 * Replaces the old column-drift parallax grid. Deliberately NOT scroll-scrubbed:
 * continuous scrubbing is the single biggest source of jank on mid-range phones,
 * and the design brief calls for restraint. Instead each photo fades + rises
 * once as it enters, and the visual interest comes from the layout rhythm
 * (alternating tall/short tiles) rather than from movement.
 *
 * Prop contract is identical to the previous gallery, so the Bunny CDN wiring
 * in lib/cms/getPage.ts feeds it unchanged (photo.src is the b-cdn.net URL).
 */
export default function EditorialGallery({
  eyebrow,
  heading,
  photos,
  onPhotoClick,
}: {
  eyebrow?: string;
  heading?: string;
  photos: GalleryPhoto[];
  /** Fired with the photo's index when a frame is clicked. */
  onPhotoClick?: (index: number) => void;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const items = gsap.utils.toArray<HTMLElement>(`.${styles.item}`, el);
      if (!items.length) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }

      // Batch so a fast scroll doesn't fire dozens of individual triggers, and
      // so items entering together animate together.
      ScrollTrigger.batch(items, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.07,
          }),
      });
    },
    { scope: root, dependencies: [photos.length] },
  );

  if (!photos || photos.length === 0) return null;

  return (
    <section ref={root} className={`section ${styles.section}`}>
      {(eyebrow || heading) && (
        <div className={`shell ${styles.head}`}>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          {heading ? <h2 className="display">{heading}</h2> : null}
        </div>
      )}

      <div className={`shell ${styles.grid}`}>
        {photos.map((photo, i) => (
          <figure
            key={`${photo.src}-${i}`}
            className={styles.item}
            /* A repeating 6-tile rhythm gives the grid an editorial cadence
               without needing per-photo metadata. */
            data-shape={SHAPES[i % SHAPES.length]}
          >
            <button
              type="button"
              className={styles.frame}
              onClick={() => onPhotoClick?.(i)}
              aria-label={`View photo: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                quality={80}
                loading={i < 3 ? "eager" : "lazy"}
                style={{ objectFit: "cover" }}
              />
            </button>
            {photo.caption ? (
              <figcaption className={styles.caption}>{photo.caption}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}

/** Tile rhythm: t = tall, s = standard, w = wide. */
const SHAPES = ["t", "s", "s", "w", "t", "s"] as const;
