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

   priority is off: this sits below the hero fold, so it should not compete
   with the hero for bandwidth. */

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
      />
    </div>
  );
}
