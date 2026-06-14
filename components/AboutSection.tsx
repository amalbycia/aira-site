export default function AboutSection() {
  return (
    <section
      id="about"
      aria-label="About us"
      style={{
        backgroundColor: "var(--color-cream)",
        padding: "var(--space-xl) var(--space-md)",
      }}
    >
      <div
        style={{
          maxWidth: "52em",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Script label */}
        <p
          className="font-script"
          style={{
            color: "var(--color-primary)",
            fontSize: "2em",
            marginBottom: "0.3em",
          }}
        >
          our story
        </p>

        {/* Heading */}
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(2rem, 4vw, 3.2em)",
            fontWeight: 400,
            lineHeight: 1.2,
            color: "var(--color-ink)",
            marginBottom: "0.8em",
          }}
        >
          We don&apos;t just cover weddings.{" "}
          <span style={{ fontStyle: "italic", color: "var(--color-primary)" }}>
            We live them with you.
          </span>
        </h2>

        {/* Divider */}
        <div
          aria-hidden="true"
          style={{
            width: "3em",
            height: "2px",
            backgroundColor: "var(--color-gold)",
            margin: "0 auto 1.8em",
          }}
        />

        {/* Body */}
        <p
          className="font-body"
          style={{
            fontSize: "1em",
            lineHeight: 1.9,
            color: "var(--color-ink-muted)",
            fontWeight: 300,
            marginBottom: "1.4em",
          }}
        >
          Over nine years, we&apos;ve been part of hundreds of weddings and
          celebrations across Hyderabad — photographing real moments, managing
          every detail, and making sure you actually get to enjoy your own
          wedding. Agnitantra Events handles the decor, catering, and
          coordination. Aira Photography makes sure you have something beautiful
          to hold onto long after the day is over.
        </p>

        <p
          className="font-body"
          style={{
            fontSize: "1em",
            lineHeight: 1.9,
            color: "var(--color-ink-muted)",
            fontWeight: 300,
          }}
        >
          Two brands, one team — and we take on a limited number of events each
          season so every family gets our full attention.
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(2em, 6vw, 5em)",
            marginTop: "3em",
            paddingTop: "2em",
            borderTop: "1px solid var(--color-cream-dark)",
            flexWrap: "wrap",
          }}
        >
          {[
            { number: "500+", label: "Events" },
            { number: "9+", label: "Years" },
            { number: "2", label: "Brands" },
          ].map(({ number, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p
                className="font-display"
                style={{
                  fontSize: "2.8em",
                  fontWeight: 400,
                  color: "var(--color-primary)",
                  lineHeight: 1,
                }}
              >
                {number}
              </p>
              <p
                className="font-body"
                style={{
                  fontSize: "0.72em",
                  color: "var(--color-ink-muted)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginTop: "0.4em",
                  fontWeight: 400,
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
