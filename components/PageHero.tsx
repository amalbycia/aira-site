import Image from "next/image";
import styles from "./PageHero.module.css";

/**
 * Inner-page hero (Photography / Events / About).
 *
 * Same prop contract as the pre-redesign component so the pages pass their
 * existing copy unchanged. Optionally takes a background image; without one it
 * falls back to a clean typographic hero on paper.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
}) {
  const hasImage = Boolean(image);

  return (
    <section className={styles.hero} data-has-image={hasImage}>
      {hasImage ? (
        <div className={styles.media}>
          <Image
            src={image as string}
            alt={imageAlt ?? ""}
            fill
            priority
            sizes="100vw"
            quality={82}
            style={{ objectFit: "cover", objectPosition: "center 40%" }}
          />
          <div className={styles.scrim} aria-hidden="true" />
        </div>
      ) : null}

      <div className={`shell ${styles.content}`}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
    </section>
  );
}
