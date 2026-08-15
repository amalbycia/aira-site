import Reveal from "@/components/Reveal";
import styles from "./StatStrip.module.css";

/**
 * A row of proof figures. Only rendered when the owner has filled in at least
 * one value/label pair in /manage → Page Content, so it never shows empty.
 */
export default function StatStrip({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  if (!stats.length) return null;

  return (
    <section className={styles.section}>
      <Reveal className="shell">
        <dl className={styles.row}>
          {stats.map((s, i) => (
            <div className={styles.stat} key={i} data-reveal>
              <dt className={styles.value}>{s.value}</dt>
              <dd className={styles.label}>{s.label}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
