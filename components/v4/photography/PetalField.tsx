import Image from "next/image";
import styles from "@/app/photography/petals.module.css";

/* Rose petals falling across sections 02–03 (About → end of Selected Works).

   The field is a positioned wrapper around BOTH sections rather than a child
   of either, so a petal can fall the whole distance instead of being clipped
   at a section boundary. Petals sit behind the content (z-index 0; sections
   raise their own content) and never intercept a pointer.

   Only three source cutouts exist, so each is reused — but no two instances
   share a size, angle, opacity, sway or speed, and repeats are mirrored
   (data-petal-flip), so the reuse does not read as a repeated motif.

   MOTION (PhotoMotion.tsx reads these attributes):
     data-petal-rot    base angle in degrees — the rest position
     data-petal-sway   how far it rocks either side of that angle
     data-petal-fall   how far it falls, as a fraction of the field's height
     data-petal-dur    seconds per sway cycle — all different, so the group
                       never falls into visible lockstep
     data-petal-flip   "1" mirrors the cutout horizontally

   Rotation is NOT in the CSS: GSAP writes a combined transform, so a CSS
   rotate() on the same element would be overwritten.

   Placement is hand-authored, not randomised at runtime: a random scatter
   would differ between server and client and throw a hydration error. */

/* Intrinsic sizes of the three cutouts, so next/image reserves the box. */
const SRC = {
  a: { src: "/images/v4-petal-1.webp", w: 520, h: 322 },
  b: { src: "/images/v4-petal-2.webp", w: 308, h: 318 },
  c: { src: "/images/v4-petal-3.webp", w: 520, h: 422 },
} as const;

/* sway values are the HALF-range: the petal rocks that many degrees either
   side of its rest angle, so the full travel is double. */
const PETALS = [
  { ...SRC.a, cls: "p1", rot: -18, sway: 13, fall: 0.3, dur: 5.5 },
  { ...SRC.b, cls: "p2", rot: 34, sway: 17, fall: 0.18, dur: 4.4 },
  { ...SRC.c, cls: "p3", rot: -52, sway: 11, fall: 0.24, dur: 6.2 },
  { ...SRC.c, cls: "p4", rot: 71, sway: 15, fall: 0.14, dur: 6.8, flip: true },
  { ...SRC.a, cls: "p5", rot: -104, sway: 12, fall: 0.34, dur: 5 },
  { ...SRC.b, cls: "p6", rot: 12, sway: 19, fall: 0.2, dur: 5.7 },
  { ...SRC.a, cls: "p7", rot: 146, sway: 14, fall: 0.12, dur: 6.5 },
  { ...SRC.b, cls: "p8", rot: -67, sway: 16, fall: 0.28, dur: 5.2, flip: true },
  { ...SRC.c, cls: "p9", rot: 98, sway: 12.5, fall: 0.16, dur: 6.6 },
] as const;

export default function PetalField({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.layer} aria-hidden="true">
        {PETALS.map((p) => (
          <Image
            key={p.cls}
            className={`${styles.petal} ${styles[p.cls]}`}
            src={p.src}
            width={p.w}
            height={p.h}
            alt=""
            /* unoptimized: the optimizer re-encodes to JPEG for clients that
               don't advertise webp, and JPEG has no alpha — that would put a
               white box behind each petal. Same reason as RosesDivider. */
            unoptimized
            /* Decorative and below the fold — never block the reveal. The
               cutouts are 17–30KB each, so nine of them still cost less
               than one garland. */
            loading="lazy"
            data-petal
            data-petal-rot={p.rot}
            data-petal-sway={p.sway}
            data-petal-fall={p.fall}
            data-petal-dur={p.dur}
            data-petal-flip={"flip" in p && p.flip ? "1" : undefined}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
