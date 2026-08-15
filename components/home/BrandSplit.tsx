import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import styles from "./BrandSplit.module.css";

const BRANDS = [
  {
    href: "/photography",
    eyebrow: "Aira Photography",
    title: "Visual storytelling",
    blurb:
      "Candid, cinematic wedding photography and films — the breath between vows, kept for good.",
    img: "/images/about-2.webp",
    alt: "Wedding photography by Aira Photography",
  },
  {
    href: "/events",
    eyebrow: "Agnitantra Events",
    title: "The whole celebration",
    blurb:
      "Decor, stage, catering, light and sound, makeup and transport — one team, every detail.",
    img: "/images/hero-tile-4.webp",
    alt: "An event produced by Agnitantra Events and Caterers",
  },
];

/**
 * The two sub-brands, side by side. This is the site's primary wayfinding
 * moment — the client's brief asks for two clear paths and nothing confusing,
 * so each card is one photo, one line, one link.
 */
export default function BrandSplit() {
  return (
    <section className="section section--deep">
      <Reveal className="shell">
        <div className={styles.head}>
          <p className="eyebrow eyebrow--center" data-reveal>
            What we do
          </p>
          <h2 className={`display--lg ${styles.heading}`} data-reveal>
            Two halves of the <span className="accent">same day.</span>
          </h2>
        </div>

        <div className={styles.grid}>
          {BRANDS.map((b) => (
            <Link key={b.href} href={b.href} className={styles.card} data-reveal>
              <div className={styles.media}>
                <Image
                  src={b.img}
                  alt={b.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className={styles.body}>
                <p className={styles.cardEyebrow}>{b.eyebrow}</p>
                <h3 className={styles.cardTitle}>{b.title}</h3>
                <p className={styles.cardBlurb}>{b.blurb}</p>
                <span className={styles.cardLink}>
                  Explore
                  <svg
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
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
