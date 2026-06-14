"use client";

import Link from "next/link";
import { useEffect } from "react";

function initButtonCharacterStagger() {
  const offsetIncrement = 0.01;
  const buttons = document.querySelectorAll("[data-button-animate-chars]");

  buttons.forEach((button) => {
    const text = button.textContent ?? "";
    button.innerHTML = "";

    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;
      if (char === " ") span.style.whiteSpace = "pre";
      button.appendChild(span);
    });
  });
}

export default function HeroSection() {
  useEffect(() => {
    initButtonCharacterStagger();
  }, []);

  return (
    <>
      <style>{`
        .btn-animate-chars {
          color: var(--color-ink);
          cursor: pointer;
          flex-grow: 0;
          justify-content: center;
          align-items: center;
          padding: 0.75em 2em;
          font-size: 0.85em;
          font-family: var(--font-dm-sans), sans-serif;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          position: relative;
          border: none;
          background-color: var(--color-gold);
          min-width: 14em;
          border-radius: 0.4em;
          padding: 0.9em 1.2em 0.65em 2.8em;
          justify-content: center;
        }

        .btn-animate-chars__text {
          white-space: nowrap;
          line-height: 1.3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6em;
          width: 100%;
        }

        .btn-animate-chars [data-button-animate-chars] {
          overflow: hidden;
          position: relative;
          display: flex;
          justify-content: center;
          text-align: center;
        }

        .btn-animate-chars [data-button-animate-chars] span {
          display: inline-block;
          position: relative;
          text-shadow: 0px 1.3em currentColor;
          transform: translateY(0em) rotate(0.001deg);
          transition: transform 0.6s cubic-bezier(0.625, 0.05, 0, 1);
        }

        .btn-animate-chars:hover [data-button-animate-chars] span {
          transform: translateY(-1.3em) rotate(0.001deg);
        }

        .btn-animate-chars__bg {
          border-radius: 0.4em;
          background-color: var(--color-gold);
          position: absolute;
          inset: 0;
          transition: background-color 0.6s cubic-bezier(0.625, 0.05, 0, 1),
                      inset 0.6s cubic-bezier(0.625, 0.05, 0, 1);
        }

        .btn-animate-chars:hover .btn-animate-chars__bg {
          background-color: var(--color-gold-light);
          inset: 0.125em;
        }

        .btn-animate-chars:hover {
          color: var(--color-ink);
        }
      `}</style>

      <section
        aria-label="Hero"
        style={{
          backgroundColor: "var(--color-primary)",
          minHeight: "calc(100vh - 2em)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "var(--space-lg) var(--space-md)",
          position: "relative",
        }}
      >
        {/* Script accent line */}
        <p
          className="font-script"
          style={{
            color: "var(--color-gold)",
            fontSize: "2.2em",
            lineHeight: 1.2,
            marginBottom: "0.4em",
            letterSpacing: "0.02em",
          }}
        >
          crafting memories, one celebration at a time
        </p>

        {/* Main title */}
        <h1
          className="font-display"
          style={{
            color: "var(--color-cream)",
            fontSize: "clamp(2.8rem, 6vw, 6em)",
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            maxWidth: "18ch",
            marginBottom: "0.6em",
          }}
        >
          Agnitantra Events
          <br />
          <span
            style={{
              color: "var(--color-cream-dark)",
              fontSize: "0.75em",
              fontWeight: 400,
              fontStyle: "italic",
              textTransform: "none",
              letterSpacing: "0.06em",
            }}
          >
            &amp; Aira Photography
          </span>
        </h1>

        {/* Divider ornament */}
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1em",
            marginBottom: "var(--space-md)",
          }}
        >
          <span
            style={{
              display: "block",
              width: "4em",
              height: "1px",
              backgroundColor: "var(--color-gold)",
              opacity: 0.6,
            }}
          />
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z"
              fill="#c9a96e"
              opacity="0.8"
            />
          </svg>
          <span
            style={{
              display: "block",
              width: "4em",
              height: "1px",
              backgroundColor: "var(--color-gold)",
              opacity: 0.6,
            }}
          />
        </div>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1em",
            justifyContent: "center",
          }}
        >
          <Link href="/photography" className="btn-animate-chars">
            <div className="btn-animate-chars__bg" />
            <span className="btn-animate-chars__text">
              <span data-button-animate-chars="">Our Photography</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M1 7h12M8 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>

          <Link href="/events" className="btn-animate-chars">
            <div className="btn-animate-chars__bg" />
            <span className="btn-animate-chars__text">
              <span data-button-animate-chars="">Events &amp; Catering</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M1 7h12M8 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>

        {/* Scroll cue */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "2em",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4em",
            opacity: 0.5,
          }}
        >
          <span
            className="font-body"
            style={{
              color: "var(--color-cream)",
              fontSize: "0.65em",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <svg
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="1"
              width="14"
              height="22"
              rx="7"
              stroke="#f5ede0"
              strokeWidth="1"
            />
            <circle cx="8" cy="7" r="2" fill="#f5ede0" />
          </svg>
        </div>
      </section>
    </>
  );
}
