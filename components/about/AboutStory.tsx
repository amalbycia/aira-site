import Image from "next/image";
import Reveal from "@/components/Reveal";
import styles from "./AboutStory.module.css";

/**
 * Founder story + service scope. All copy is carried over verbatim from the
 * client's own brief (see CLIENTRAWDETAILS.md) — do not paraphrase it.
 */
const SERVICES = [
  "Wedding Photography",
  "Videography & Films",
  "Event Shoot Coverage",
  "Stage Decoration",
  "Stage Programs",
  "Catering",
  "Light and Sound",
  "Makeup Artistry",
  "Car Rentals",
  "Dancers and Entertainment",
];

export default function AboutStory() {
  return (
    <>
      {/* ── The story ──────────────────────────────────────────────────── */}
      <section className="section">
        <Reveal className="shell">
          <div className={styles.storyGrid}>
            <figure className={styles.portrait} data-reveal>
              <Image
                src="/images/about-3.webp"
                alt="Aira Photography and Agnitantra Events at work in Kerala"
                width={720}
                height={900}
                sizes="(max-width: 900px) 100vw, 40vw"
                style={{ width: "100%", height: "auto" }}
              />
            </figure>

            <div className={styles.storyText}>
              <p className="eyebrow" data-reveal>
                The story
              </p>
              <h2 className={`display--lg ${styles.heading}`} data-reveal>
                One team, <span className="accent">every detail.</span>
              </h2>

              <p className={styles.body} data-reveal>
                Founded in 2018 by Amal Sebastian Kalarickal, Aira Photography
                and Agnitantra Events and Caterers has established itself as a
                premier, all-inclusive event management solution. The company
                seamlessly integrates creative artistry with logistical
                expertise to bring diverse celebrations to life.
              </p>

              <p className={styles.body} data-reveal>
                At its core, the firm delivers exceptional visual storytelling
                through high-quality photography, videography, and comprehensive
                event shoot coverage. Beyond capturing memories, they transform
                venues with striking stage decorations and organise flawless
                stage programs, ensuring that every event has a captivating and
                professional presence.
              </p>

              <p className={styles.body} data-reveal>
                Driven by a commitment to full-service excellence, the company
                handles every intricate detail of event organisation to provide
                a stress-free experience for its clients — top-tier catering,
                premium car rentals, state-of-the-art light and sound systems,
                professional makeup artistry, and talented dancers. By managing
                everything from technical production to live entertainment, the
                team stands as a trusted partner for creating sophisticated,
                memorable and meticulously coordinated events.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Scope ──────────────────────────────────────────────────────── */}
      <section className="section section--deep">
        <Reveal className="shell">
          <p className="eyebrow" data-reveal>
            The full scope
          </p>
          <h2 className={`display ${styles.scopeHeading}`} data-reveal>
            What we handle
          </h2>

          <ul className={styles.scope}>
            {SERVICES.map((s) => (
              <li className={styles.scopeItem} key={s} data-reveal>
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </>
  );
}
