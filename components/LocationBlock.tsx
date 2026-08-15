import Reveal from "@/components/Reveal";
import { BUSINESS } from "@/lib/site";
import styles from "./LocationBlock.module.css";

/**
 * Text-only location block. The client's brief is explicit: written location,
 * no map embed. The address matches the Google Business Profile exactly.
 */
export default function LocationBlock({
  eyebrow,
  heading,
  lines,
}: {
  eyebrow?: string;
  heading: string;
  lines: string[];
}) {
  return (
    <section className="section section--deep">
      <Reveal className="shell">
        <div className={styles.grid}>
          <div>
            {eyebrow ? (
              <p className="eyebrow" data-reveal>
                {eyebrow}
              </p>
            ) : null}
            <h2 className="display" data-reveal>
              {heading}
            </h2>
          </div>

          <div className={styles.body}>
            {lines.map((l, i) => (
              <p className={styles.line} key={i} data-reveal>
                {l}
              </p>
            ))}

            <address className={styles.address} data-reveal>
              <span>{BUSINESS.street}</span>
              <span>
                {BUSINESS.locality}, {BUSINESS.region} {BUSINESS.postalCode}
              </span>
              <a
                href={BUSINESS.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapLink}
              >
                View on Google Maps
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </address>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
