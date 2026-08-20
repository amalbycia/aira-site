import Image from "next/image";
import styles from "@/app/photography/roses-divider.module.css";

/* Roses garland — the seam between sections 01 and 02.

   James's artwork, a transparent PNG converted to webp. The garland runs the
   full width of the source (content reaches both edges), so it spans the
   viewport end to end with no gap at either side.

   unoptimized: the file is already a hand-tuned 326KB webp, and the optimizer
   re-encodes to JPEG for any client that does not advertise webp — JPEG has no
   alpha channel, which would put a solid box behind the garland. Serving the
   webp as-is keeps the transparency guaranteed rather than negotiated.

   priority: this is the first artwork the visitor sees when the preloader
   lifts, and the preloader gives it ~3s of covered time to arrive. Without
   priority it is discovered late and can pop in after the reveal. Nothing
   above it competes — the hero is type and placeholder boxes, no images. */

export default function RosesDivider() {
  return (
    <div className={styles.divider} aria-hidden="true">
      <Image
        className={styles.image}
        src="/images/v4-roses-divider.webp"
        alt=""
        width={2400}
        height={856}
        sizes="100vw"
        unoptimized
        priority
      />
    </div>
  );
}
