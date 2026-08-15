import Link from "next/link";
import Reveal from "@/components/Reveal";
import styles from "./Intro.module.css";

/**
 * The "who we are" block. Copy is carried over verbatim from the previous site
 * (which came from the client brief), including the 9+ years figure the client
 * specifically asked to feature.
 */
export default function Intro() {
  return (
    <section className="section">
      <Reveal className="shell">
        <div className={styles.grid}>
          <div className={styles.left}>
            <p className="eyebrow" data-reveal>
              About us
            </p>
            <h2 className={`display--lg ${styles.heading}`} data-reveal>
              Nine years of weddings, <span className="accent">told properly.</span>
            </h2>
          </div>

          <div className={styles.right}>
            <p className="lede" data-reveal>
              Founded in 2018, Aira Photography and Agnitantra Events and
              Caterers brings creative artistry and full-service event
              management together — photography, videography, decor, catering,
              and coordination, handled as one team so every family gets our
              full attention.
            </p>

            <div className={styles.stats} data-reveal>
              <Stat value="9+" label="Years of experience" />
              <Stat value="4.9" label="Rated on Google" />
              <Stat value="148+" label="Families served" />
            </div>

            <Link href="/about" className={`btn btn--ghost ${styles.cta}`} data-reveal>
              Our story
              <svg
                className="btn__arrow"
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
