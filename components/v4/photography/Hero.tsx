import styles from "@/app/photography/hero.module.css";
import Filmstrip from "./Filmstrip";

/* Section 01 — hero. WIREFRAME ONLY.

   Wireframe type, no real images. The arrangement is what is under review;
   James supplies the real palette and photography. */

export default function Hero() {
  return (
    <div className={styles.hero}>
      <h1 className={styles.wordmark}>Aira Photography</h1>

      <Filmstrip />
    </div>
  );
}
