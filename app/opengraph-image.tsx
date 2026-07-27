import { ImageResponse } from "next/og";

// Dynamic Open Graph image (1200×630) — the share/preview card for links to the
// site (social, WhatsApp, AI answer engines). On-brand maroon + gold + cream,
// rendered at the edge so there's no binary asset to maintain. Used as the
// default OG image for every route via Next's file convention.
export const runtime = "edge";
export const alt =
  "Aira Photography & Agnitantra Events — Weddings & Celebrations in Kerala";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px",
          background:
            "radial-gradient(120% 120% at 50% 0%, #7a1f1f 0%, #5a1616 100%)",
          color: "#f5ede0",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#c9a96e",
            marginBottom: 28,
          }}
        >
          Kerala · since 2018
        </div>
        <div style={{ fontSize: 82, lineHeight: 1.05, fontWeight: 400 }}>
          Aira Photography
        </div>
        <div
          style={{
            fontSize: 82,
            lineHeight: 1.05,
            fontWeight: 400,
            marginBottom: 34,
          }}
        >
          &amp; Agnitantra Events
        </div>
        <div style={{ fontSize: 34, color: "#e8d9c4", maxWidth: 900 }}>
          Wedding photography &amp; full-service event management across Kerala
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 40,
            fontSize: 30,
            color: "#dfc090",
          }}
        >
          {/* Inline SVG star — the default OG font has no ★ glyph (renders tofu). */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#dfc090">
            <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7.3L12 17.8 5.8 21.5l1.6-7.3L2 9.5l7.1-.6z" />
          </svg>
          4.9 · 148+ Google reviews
        </div>
      </div>
    ),
    { ...size },
  );
}
