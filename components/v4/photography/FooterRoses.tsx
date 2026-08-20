import Image from "next/image";
import styles from "@/app/photography/footer-roses.module.css";

/* Roses garland — the border directly above the footer.

   James's second artwork, same treatment as the hero divider: transparent
   PNG converted to webp, spanning the viewport end to end.

   Unlike the hero divider this one is NOT pulled up onto the section above
   with a negative margin — it is a band in normal flow that the footer sits
   under, so it can never cover the footer's contact details. The only
   overlap is a 1px pull DOWN onto the maroon, which hides the hairline seam
   that sub-pixel rounding can leave between the two.

   unoptimized: the optimizer re-encodes to JPEG for clients that do not
   advertise webp, and JPEG has no alpha — that would put a solid box behind
   the garland. Same reason as RosesDivider.

   loading="lazy": this sits at the very bottom of a long page, so it must
   not compete for bandwidth with anything above the fold. */

export default function FooterRoses() {
  return (
    <div className={styles.band} aria-hidden="true">
      <Image
        className={styles.image}
        src="/images/v4-roses-footer.webp"
        alt=""
        width={2400}
        height={653}
        sizes="100vw"
        unoptimized
        loading="lazy"
      />
    </div>
  );
}
