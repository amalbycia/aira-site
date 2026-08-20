"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import type { GalleryPhoto } from "@/components/media/types";
import styles from "@/app/gallery/gallery.module.css";

/* /gallery — the full archive, with a switchable grid density.

   GSAP Flip, after the Codrops technique:
   tympanus.net/codrops/2026/01/20/animating-responsive-grid-layout-transitions-with-gsap-flip/

   The mechanism is the tutorial's, unchanged in shape:
     1. Flip.getState() records every tile's current box
     2. the density attribute changes, so CSS re-flows the grid
     3. Flip.from() animates each tile from its old box to its new one

   React makes step 2 a state change rather than a direct attribute write, so
   the state must be captured BEFORE the re-render and the Flip played AFTER
   the DOM is committed. Capturing in the click handler into a ref, then
   animating in an effect keyed on density, is what keeps those in order.

   `absolute: true` matters here: tiles change column span between densities,
   so without it the ones that re-flow to a new row jump instead of travelling.

   Reduced motion: the density still changes, it just changes instantly. */

gsap.registerPlugin(Flip);

const DENSITIES = [
  { id: "airy", label: "large" },
  { id: "regular", label: "medium" },
  { id: "dense", label: "small" },
] as const;

type Density = (typeof DENSITIES)[number]["id"];

export default function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [density, setDensity] = useState<Density>("regular");
  const gridRef = useRef<HTMLDivElement>(null);
  /* The Flip state captured in the click handler, consumed by the effect
     below once React has committed the new layout. */
  const stateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const changeDensity = (next: Density) => {
    if (next === density) return;
    const grid = gridRef.current;
    if (grid) {
      // Capture BEFORE the re-render re-flows the grid.
      stateRef.current = Flip.getState(grid.querySelectorAll(`.${styles.item}`));
    }
    setDensity(next);
  };

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    stateRef.current = null;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    Flip.from(state, {
      duration: 0.8,
      ease: "expo.inOut",
      // Tiles change span between densities; without absolute the re-flowed
      // ones snap to the new row instead of travelling to it.
      absolute: true,
      stagger: { amount: 0.25, from: "random" },
    });
  }, [density]);

  if (photos.length === 0) {
    return (
      <p className={styles.empty}>
        The gallery is being prepared — photographs will appear here shortly.
      </p>
    );
  }

  return (
    <>
      <div className={styles.controls}>
        <span className={styles.controlsLabel}>size</span>
        {DENSITIES.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`${styles.sizeBtn} ${density === d.id ? styles.sizeBtnActive : ""}`}
            onClick={() => changeDensity(d.id)}
            aria-pressed={density === d.id}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className={styles.grid} data-density={density} ref={gridRef}>
        {photos.map((photo, i) => (
          <figure
            key={photo.src}
            className={`${styles.item} ${
              /* Every fourth tile runs wide, giving the grid a rhythm instead
                 of a uniform contact sheet. */
              i % 4 === 3 ? styles.itemWide : ""
            }`}
          >
            <div className={styles.frame}>
              <Image
                className={styles.photo}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 767px) 50vw, 25vw"
                /* The first rows are above the fold on any screen; the rest is
                   a long archive and loads as it is reached. */
                loading={i < 4 ? undefined : "lazy"}
                priority={i < 4}
              />
            </div>
            <figcaption className={styles.num}>( {String(i + 1).padStart(2, "0")} )</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
