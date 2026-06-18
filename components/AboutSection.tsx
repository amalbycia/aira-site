export default function AboutSection() {
  return (
    <section
      id="about"
      aria-label="About us"
      style={{
        backgroundColor: "var(--color-cream)",
        padding: "var(--space-xl) var(--space-md)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        .about-layout {
          position: relative;
          max-width: 84em;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr minmax(0, 36em) 1fr;
          align-items: center;
          gap: var(--space-md);
          min-height: 40em;
        }

        .about-image {
          background-color: var(--color-cream-dark);
          border: 1px solid var(--color-gold-light);
          border-radius: 1em;
          position: absolute;
        }

        .about-image--1 {
          top: 0;
          left: 8%;
          width: 13em;
          height: 13em;
        }

        .about-image--2 {
          bottom: 0;
          left: 0;
          width: 15em;
          height: 17em;
        }

        .about-image--3 {
          top: 2%;
          right: 6%;
          width: 13.5em;
          height: 19em;
        }

        .about-image--4 {
          bottom: 4%;
          right: 0;
          width: 13em;
          height: 9em;
        }

        .about-text {
          grid-column: 2;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 1100px) {
          .about-image { display: none; }
          .about-layout {
            grid-template-columns: 1fr;
            min-height: 0;
          }
          .about-text {
            grid-column: 1;
          }
        }
      `}</style>

      <div className="about-layout">
        <div className="about-image about-image--1" aria-hidden="true" />
        <div className="about-image about-image--2" aria-hidden="true" />
        <div className="about-image about-image--3" aria-hidden="true" />
        <div className="about-image about-image--4" aria-hidden="true" />

        <div className="about-text">
          <p
            className="font-script"
            style={{
              color: "var(--color-primary)",
              fontSize: "3em",
              marginBottom: "0.4em",
            }}
          >
            about us
          </p>

          <h2
            className="font-nohemi"
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.6em)",
              fontWeight: 400,
              lineHeight: 1.2,
              color: "var(--color-ink)",
              marginBottom: "0.9em",
            }}
          >
            Nine years of weddings, told properly.
          </h2>

          <p
            className="font-nohemi"
            style={{
              fontSize: "1em",
              lineHeight: 1.9,
              color: "var(--color-ink-muted)",
              fontWeight: 200,
              marginBottom: "1.6em",
            }}
          >
            Founded in 2018, Aira Photography &amp; Agnitantra Events &amp; Caters
            brings creative artistry and full-service event management together —
            photography, videography, decor, catering, and coordination, handled
            as one team so every family gets our full attention.
          </p>

          <a
            href="#contact"
            className="font-nohemi"
            style={{
              display: "inline-block",
              padding: "0.8em 2.2em",
              borderRadius: "999px",
              border: "1px solid var(--color-primary)",
              color: "var(--color-primary)",
              fontSize: "0.85em",
              fontWeight: 400,
              letterSpacing: "0.04em",
              textDecoration: "none",
            }}
          >
            Discover
          </a>
        </div>
      </div>
    </section>
  );
}
