"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      aria-label="Site footer"
      style={{
        backgroundColor: "var(--color-primary-dark)",
        color: "var(--color-cream)",
        padding: "var(--space-xl) var(--space-md) var(--space-md)",
      }}
    >
      <div
        style={{
          maxWidth: "72em",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr",
          gap: "var(--space-lg)",
          paddingBottom: "var(--space-md)",
          borderBottom: "1px solid rgba(245, 237, 224, 0.12)",
        }}
      >
        {/* Column 1 — Brand */}
        <div>
          <p
            className="font-script"
            style={{
              fontSize: "2em",
              color: "var(--color-gold)",
              lineHeight: 1.1,
              marginBottom: "0.3em",
            }}
          >
            Agnitantra Events
          </p>
          <p
            className="font-display"
            style={{
              fontSize: "0.9em",
              fontStyle: "italic",
              color: "var(--color-cream-dark)",
              marginBottom: "1.2em",
              lineHeight: 1.4,
            }}
          >
            &amp; Aira Photography
          </p>
          <p
            className="font-body"
            style={{
              fontSize: "0.82em",
              color: "rgba(245, 237, 224, 0.6)",
              lineHeight: 1.8,
              maxWidth: "28ch",
              fontWeight: 300,
            }}
          >
            Crafting weddings and celebrations across Hyderabad with love,
            care, and a full team behind every detail.
          </p>

          {/* Location */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.6em",
              marginTop: "1.4em",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ marginTop: "0.2em", flexShrink: 0 }}
            >
              <path
                d="M7 1C4.79 1 3 2.79 3 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4Z"
                stroke="#c9a96e"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              <circle cx="7" cy="5" r="1.2" stroke="#c9a96e" strokeWidth="1.1" />
            </svg>
            <span
              className="font-body"
              style={{
                fontSize: "0.8em",
                color: "rgba(245, 237, 224, 0.6)",
                lineHeight: 1.6,
                fontWeight: 300,
              }}
            >
              {/* TODO: Replace with real address */}
              123 Jubilee Hills, Hyderabad,
              <br />
              Telangana — 500033
            </span>
          </div>
        </div>

        {/* Column 2 — Navigation */}
        <div>
          <p
            className="font-body"
            style={{
              fontSize: "0.7em",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              marginBottom: "1.4em",
              fontWeight: 500,
            }}
          >
            Navigate
          </p>
          <nav aria-label="Footer navigation">
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.9em",
              }}
            >
              {[
                { label: "Home", href: "/" },
                { label: "Photography", href: "/photography" },
                { label: "Events & Catering", href: "/events" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-body"
                    style={{
                      fontSize: "0.88em",
                      color: "rgba(245, 237, 224, 0.75)",
                      textDecoration: "none",
                      fontWeight: 300,
                      transition: "color 180ms ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--color-cream)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "rgba(245, 237, 224, 0.75)";
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Column 3 — Contact */}
        <div>
          <p
            className="font-body"
            style={{
              fontSize: "0.7em",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              marginBottom: "1.4em",
              fontWeight: 500,
            }}
          >
            Get in Touch
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1em",
              marginBottom: "1.8em",
            }}
          >
            {/* TODO: Replace with real phone */}
            <a
              href="tel:+919999999999"
              className="font-body"
              style={{
                fontSize: "0.88em",
                color: "rgba(245, 237, 224, 0.75)",
                textDecoration: "none",
                fontWeight: 300,
                display: "flex",
                alignItems: "center",
                gap: "0.6em",
                transition: "color 180ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-cream)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(245, 237, 224, 0.75)";
              }}
            >
              +91 99999 99999
            </a>

            {/* TODO: Replace with real email */}
            <a
              href="mailto:hello@agnitantra.com"
              className="font-body"
              style={{
                fontSize: "0.88em",
                color: "rgba(245, 237, 224, 0.75)",
                textDecoration: "none",
                fontWeight: 300,
                transition: "color 180ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-cream)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(245, 237, 224, 0.75)";
              }}
            >
              hello@agnitantra.com
            </a>

            {/* TODO: Replace with real Instagram */}
            <a
              href="https://instagram.com/agnitantraevents"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body"
              style={{
                fontSize: "0.88em",
                color: "rgba(245, 237, 224, 0.75)",
                textDecoration: "none",
                fontWeight: 300,
                transition: "color 180ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-cream)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(245, 237, 224, 0.75)";
              }}
            >
              @agnitantraevents
            </a>
          </div>

          {/* Contact CTA button */}
          <a
            href="mailto:hello@agnitantra.com"
            className="font-body"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5em",
              padding: "0.7em 1.6em",
              border: "1px solid var(--color-gold)",
              color: "var(--color-gold)",
              fontSize: "0.75em",
              fontWeight: 400,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "background-color 200ms ease, color 200ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "var(--color-gold)";
              (e.currentTarget as HTMLAnchorElement).style.color =
                "var(--color-ink)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color =
                "var(--color-gold)";
            }}
          >
            Send us a message
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: "72em",
          margin: "0 auto",
          paddingTop: "var(--space-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5em",
        }}
      >
        <p
          className="font-body"
          style={{
            fontSize: "0.72em",
            color: "rgba(245, 237, 224, 0.35)",
            fontWeight: 300,
          }}
        >
          © {new Date().getFullYear()} Agnitantra Events &amp; Aira Photography.
          All rights reserved.
        </p>
        <p
          className="font-script"
          style={{
            fontSize: "1.1em",
            color: "rgba(201, 169, 110, 0.4)",
          }}
        >
          made with love
        </p>
      </div>
    </footer>
  );
}
