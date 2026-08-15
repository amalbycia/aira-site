import Link from "next/link";
import styles from "./SiteFooter.module.css";

/* ── Contact details — carried over verbatim from the previous site ──────── */
const CONTACT_EMAIL = "hello@agnitantra.com";
const CONTACT_PHONE = "+91 80897 03793";
const WHATSAPP_NUMBER = "918089703793";
const WHATSAPP_MESSAGE =
  "Hi Agnitantra, I'd like to enquire about your services.";
const LOCATION_TEXT = "Kurishummood, Chethipuzha Kadavu, Changanassery, Kerala 686104";
const LOCATION_HOURS = "Call us anytime";
const GOOGLE_MAPS_URL = "https://www.google.com/maps?cid=10454241291312957415";

const INSTAGRAM_DEFAULT =
  "https://www.instagram.com/agnitantra_events_and_caterers";
const YOUTUBE_URL = "https://www.youtube.com/channel/UCJBvYbfXgCFZeEbQ6DOOpmg";
const FACEBOOK_URL = "https://www.facebook.com/AgnitantraEvents/";
const LINKTREE_URL = "https://linktr.ee/AIRAPHOTOGRAPHYTM";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/photography", label: "Photography" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
];

/**
 * Site footer.
 *
 * All NAP details match the Google Business Profile exactly (see lib/site.ts) —
 * consistency here is a real local-SEO signal, so don't "tidy" the address.
 *
 * Props let a page override the Instagram handle (photography vs events) and
 * the location line, matching the old footerPropsFromSettings() contract.
 */
export default function SiteFooter({
  instagramUrl,
  email,
  phone,
  locationText,
}: {
  instagramUrl?: string;
  email?: string;
  phone?: string;
  locationText?: string;
}) {
  const ig = instagramUrl || INSTAGRAM_DEFAULT;
  const mail = email || CONTACT_EMAIL;
  const tel = phone || CONTACT_PHONE;
  const location = locationText || LOCATION_TEXT;

  const telHref = `tel:${tel.replace(/[^\d+]/g, "")}`;
  const waHref = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(
    WHATSAPP_MESSAGE,
  )}`;

  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.inner}`}>
        {/* ── Call to action ─────────────────────────────────────────────── */}
        <div className={styles.cta}>
          <p className={styles.ctaEyebrow}>Get in touch</p>
          <h2 className={styles.ctaHeading}>
            Tell us about <span className={styles.accent}>your day.</span>
          </h2>
          <p className={styles.ctaBody}>
            Share your date and what you have in mind — we&apos;ll come back to
            you quickly, and we travel across Kerala and beyond.
          </p>
          <div className={styles.ctaButtons}>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn--light ${styles.ctaBtn}`}
            >
              WhatsApp us
            </a>
            <a href={telHref} className={`btn ${styles.ctaBtn} ${styles.ctaGhost}`}>
              {tel}
            </a>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* ── Columns ────────────────────────────────────────────────────── */}
        <div className={styles.cols}>
          <div className={styles.col}>
            <p className={styles.colHead}>Visit</p>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.colLink}
            >
              {location}
            </a>
            <p className={styles.colMuted}>{LOCATION_HOURS}</p>
          </div>

          <div className={styles.col}>
            <p className={styles.colHead}>Contact</p>
            <a href={telHref} className={styles.colLink}>
              {tel}
            </a>
            <a href={`mailto:${mail}`} className={styles.colLink}>
              {mail}
            </a>
          </div>

          <div className={styles.col}>
            <p className={styles.colHead}>Explore</p>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={styles.colLink}>
                {n.label}
              </Link>
            ))}
          </div>

          <div className={styles.col}>
            <p className={styles.colHead}>Follow</p>
            <a href={ig} target="_blank" rel="noopener noreferrer" className={styles.colLink}>
              Instagram
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.colLink}
            >
              Facebook
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.colLink}
            >
              YouTube
            </a>
            <a
              href={LINKTREE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.colLink}
            >
              Linktree
            </a>
          </div>
        </div>

        {/* ── Wordmark + legal ───────────────────────────────────────────── */}
        <div className={styles.wordmarkRow} aria-hidden="true">
          <span className={styles.wordmark}>AIRA</span>
        </div>

        <div className={styles.legal}>
          <p>
            © {new Date().getFullYear()} Agnitantra Events &amp; Caterers ·
            Changanassery, Kerala
          </p>
          <p className={styles.legalMuted}>
            Aira Photography and Agnitantra Events — one team since 2018.
          </p>
        </div>
      </div>
    </footer>
  );
}
