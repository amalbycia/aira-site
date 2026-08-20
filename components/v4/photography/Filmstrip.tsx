import Image from "next/image";
import type { GalleryPhoto } from "@/components/media/types";
import styles from "@/app/photography/filmstrip.module.css";

/* Section 01 — horizontal image strip.

   A single row of photos running the full width of the viewport, bleeding off
   both edges. Each tile has its own width, height and vertical offset, so the
   row reads as a scattered strip rather than a tidy grid.

   Seven tiles: the two at the ends are cut by the viewport edge, which is what
   makes the row feel like a slice of something longer.

   Photos come from the DB (Bunny Storage URLs) via getPage("photography").
   When the DB is empty or unreachable the tiles fall back to the numbered
   wireframe blocks, so the layout is never blank.

   Loading: the strip is the first thing revealed when the preloader lifts, so
   the tiles are `priority` — the preloader's ~3s of covered time is exactly
   what they need to arrive before the sheet comes up. */

const TILES = [1, 2, 3, 4, 5, 6, 7] as const;

/* Rough on-screen width of each tile, from filmstrip.module.css. Passing real
   sizes stops Next serving a 2000px-wide source into a 9vw slot. */
const TILE_SIZES: Record<number, string> = {
  1: "(max-width: 767px) 21vw, 15vw",
  2: "(max-width: 767px) 13vw, 9vw",
  3: "(max-width: 767px) 26vw, 19vw",
  4: "(max-width: 767px) 34vw, 25vw",
  5: "(max-width: 767px) 36vw, 26vw",
  6: "(max-width: 767px) 15vw, 11vw",
  7: "(max-width: 767px) 22vw, 16vw",
};

export default function Filmstrip({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className={styles.strip} aria-hidden="true">
      <div className={styles.track}>
        {TILES.map((n) => {
          const photo = photos[n - 1];
          return (
            <div key={n} className={`${styles.tile} ${styles[`tile${n}`]}`} data-hero-tile>
              {photo ? (
                <Image
                  className={styles.photo}
                  src={photo.src}
                  alt=""
                  fill
                  sizes={TILE_SIZES[n]}
                  quality={82}
                  priority
                />
              ) : (
                String(n).padStart(2, "0")
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
