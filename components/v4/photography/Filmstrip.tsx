import styles from "@/app/photography/filmstrip.module.css";

/* Section 01 — horizontal image strip.

   WIREFRAME: grey placeholder blocks, no real images yet.

   A single row of photos running the full width of the viewport, bleeding off
   both edges. Each tile has its own width, height and vertical offset, so the
   row reads as a scattered strip rather than a tidy grid.

   Seven tiles: the two at the ends are cut by the viewport edge, which is what
   makes the row feel like a slice of something longer. */

const TILES = [1, 2, 3, 4, 5, 6, 7] as const;

export default function Filmstrip() {
  return (
    <div className={styles.strip} aria-hidden="true">
      <div className={styles.track}>
        {TILES.map((n) => (
          <div key={n} className={`${styles.tile} ${styles[`tile${n}`]}`}>
            {String(n).padStart(2, "0")}
          </div>
        ))}
      </div>
    </div>
  );
}
