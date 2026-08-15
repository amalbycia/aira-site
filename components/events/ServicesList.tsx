import Reveal from "@/components/Reveal";
import styles from "./ServicesList.module.css";

/** The client's full service scope, verbatim from the brief. */
const SERVICES = [
  {
    n: "01",
    name: "Stage Decoration",
    blurb:
      "Striking stage and venue transformations that set the tone for the day.",
  },
  {
    n: "02",
    name: "Stage Programs",
    blurb: "Flawlessly run stage programs and event flow, start to finish.",
  },
  {
    n: "03",
    name: "Catering",
    blurb: "Top-tier catering — from traditional sadya to live counters.",
  },
  {
    n: "04",
    name: "Light and Sound",
    blurb:
      "State-of-the-art light and sound systems for any scale of celebration.",
  },
  {
    n: "05",
    name: "Makeup Artistry",
    blurb: "Professional bridal and party makeup, on schedule and on point.",
  },
  {
    n: "06",
    name: "Car Rentals",
    blurb: "Premium cars for elegant arrivals and departures.",
  },
  {
    n: "07",
    name: "Dancers",
    blurb: "Talented dancers and live entertainment to lift the room.",
  },
  {
    n: "08",
    name: "Wedding Photography",
    blurb:
      "Full event shoot coverage by Aira Photography — stills and film.",
  },
];

/**
 * The service scope as a numbered editorial list. Numbered rows (the Tuesday
 * Lights "01–04" device) make a long list scannable without decoration.
 */
export default function ServicesList({
  eyebrow = "What we do",
  heading = "Everything, under one roof.",
}: {
  eyebrow?: string;
  heading?: string;
}) {
  return (
    <section className="section">
      <Reveal className="shell">
        <div className={styles.head}>
          <p className="eyebrow" data-reveal>
            {eyebrow}
          </p>
          <h2 className={`display--lg ${styles.heading}`} data-reveal>
            {heading}
          </h2>
        </div>

        <ul className={styles.list}>
          {SERVICES.map((s) => (
            <li className={styles.row} key={s.n} data-reveal>
              <span className={styles.num}>{s.n}</span>
              <h3 className={styles.name}>{s.name}</h3>
              <p className={styles.blurb}>{s.blurb}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
