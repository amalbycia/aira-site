import { BUSINESS } from "@/lib/site";
import styles from "@/app/photography/footer.module.css";

/* Contact / footer — the page's one dark move.

   Deep maroon band closing the cream sheet. Structure: eyebrow, script
   wordmark, tagline, CTA row — WhatsApp is deliberately the loudest element
   (solid cream fill; the others are outlined) — then four editorial columns
   and a legal line. All NAP data comes from lib/site.ts — never retyped.

   Every text link carries the drawn squiggle underline (data-draw-line,
   see DrawUnderline.tsx) instead of a generic hover. */

const SOCIALS = [
  { tag: "ig", label: "Instagram", href: BUSINESS.sameAs[0] },
  { tag: "fb", label: "Facebook", href: BUSINESS.sameAs[2] },
  { tag: "yt", label: "YouTube", href: BUSINESS.sameAs[3] },
] as const;

function DrawBox() {
  return <span data-draw-line-box aria-hidden="true" />;
}

export default function Footer() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.inner}>
        <p className={styles.eyebrow} data-reveal>
          [ contact ]
        </p>
        <p className={styles.script} data-reveal>
          Aira Photography
        </p>
        <p className={styles.tagline} data-reveal>
          weddings, portraits &amp; the days worth keeping — tell us about
          yours
        </p>

        <div className={styles.ctaRow} data-reveal>
          <a
            className={`${styles.cta} ${styles.ctaPrimary}`}
            href={`https://wa.me/${BUSINESS.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            data-draw-line
          >
            whatsapp us
            <DrawBox />
          </a>
          <a className={styles.cta} href={`tel:${BUSINESS.phone}`} data-draw-line>
            call the studio
            <DrawBox />
          </a>
          <a
            className={styles.cta}
            href={`mailto:${BUSINESS.email}`}
            data-draw-line
          >
            write to us
            <DrawBox />
          </a>
        </div>

        <div className={styles.rule} aria-hidden="true" />

        <div className={styles.columns}>
          <div className={styles.col}>
            <h3 className={styles.colTitle}>the studio</h3>
            <p className={styles.line}>
              {BUSINESS.street}
              <br />
              {BUSINESS.locality}, {BUSINESS.region} {BUSINESS.postalCode}
            </p>
            <a
              className={styles.lineLink}
              href={BUSINESS.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-draw-line
            >
              find us on google maps
              <DrawBox />
            </a>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>enquiries</h3>
            <a
              className={styles.lineLink}
              href={`tel:${BUSINESS.phone}`}
              data-draw-line
            >
              {BUSINESS.phoneDisplay}
              <DrawBox />
            </a>
            <a
              className={styles.lineLink}
              href={`mailto:${BUSINESS.email}`}
              data-draw-line
            >
              {BUSINESS.email}
              <DrawBox />
            </a>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>elsewhere</h3>
            <div className={styles.socialRow}>
              {SOCIALS.map((s) => (
                <a
                  key={s.tag}
                  className={styles.social}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  {s.tag}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>navigate</h3>
            <a className={styles.lineLink} href="#about" data-draw-line>
              about
              <DrawBox />
            </a>
            <a className={styles.lineLink} href="#works" data-draw-line>
              works
              <DrawBox />
            </a>
            <a className={styles.lineLink} href="#" data-draw-line>
              back to top
              <DrawBox />
            </a>
          </div>
        </div>

        <div className={styles.legal}>
          <span>
            © {new Date().getFullYear()} {BUSINESS.legalName}
          </span>
          <span>changanassery · kottayam · kochi</span>
        </div>
      </div>
    </footer>
  );
}
