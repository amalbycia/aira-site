import styles from "@/app/photography/hero.module.css";
import Filmstrip from "./Filmstrip";

/* Section 01 — hero. WIREFRAME ONLY.

   Wireframe type, no real images. The arrangement is what is under review;
   James supplies the real palette and photography. */

export default function Hero() {
  return (
    <div className={styles.hero}>
      <header className={styles.masthead} data-hero-mast>
        <nav className={styles.nav} aria-label="Primary">
          <span className={styles.navGroup}>
            <a href="#about" className={styles.navLink} data-draw-line>
              about
              <span data-draw-line-box aria-hidden="true" />
            </a>
            <a href="#works" className={styles.navLink} data-draw-line>
              works
              <span data-draw-line-box aria-hidden="true" />
            </a>
          </span>
          <span className={styles.navGroup}>
            <a href="#contact" className={styles.navLink} data-draw-line>
              contact
              <span data-draw-line-box aria-hidden="true" />
            </a>
          </span>
        </nav>
        <h1 className={styles.wordmark}>Aira Photography</h1>
      </header>

      <Filmstrip />
    </div>
  );
}
