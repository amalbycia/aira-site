"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/dist/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

const FOOTER_NAV = [
  { label: "Home", href: "/" },
  { label: "Photography", href: "/photography" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/#about" },
];

// Marquee ribbon words — repeated twice in the DOM so the strip can loop
// seamlessly (translate -50% then reset).
const MARQUEE_WORDS = [
  "Weddings",
  "Portraits",
  "Events",
  "Catering",
  "Celebrations",
  "Photography",
];

// Instagram is per-page (Photography vs Events use different handles), so its
// URL comes in as a prop. The others are the same brand-wide.
const INSTAGRAM_DEFAULT =
  "https://www.instagram.com/agnitantra_events_and_caterers";
const YOUTUBE_URL = "https://www.youtube.com/channel/UCJBvYbfXgCFZeEbQ6DOOpmg";
const FACEBOOK_URL = "https://www.facebook.com/AgnitantraEvents/";
const LINKTREE_URL = "https://linktr.ee/AIRAPHOTOGRAPHYTM";

// Footer socials. Each has a paired name (left list) + big button (right grid);
// hovering either one draws the name's underline AND lifts the button, linked
// via the shared `key`. The Instagram href is filled in at render from the
// `instagramUrl` prop (see buildSocials).
const SOCIALS = [
  {
    key: "instagram",
    name: "Instagram",
    href: INSTAGRAM_DEFAULT,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "youtube",
    name: "YouTube",
    href: YOUTUBE_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="2.5" y="6" width="19" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "facebook",
    name: "Facebook",
    href: FACEBOOK_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M14 8h2V5h-2c-2 0-3 1.2-3 3v2H9v3h2v6h3v-6h2.2l.3-3H14V8.6c0-.4.2-.6.7-.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "linktree",
    name: "Linktree",
    href: LINKTREE_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 3v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 8.5L6.5 5.3M12 8.5l5.5-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 8.5L6.5 11.7M12 8.5l5.5 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12.5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

// A 4-point sparkle/star (matches the hero divider star) used as ornamental
// punctuation in the footer corners and nav.
const Sparkle = ({ size = 12, opacity = 0.8 }: { size?: number; opacity?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z"
      fill="#c9a96e"
      opacity={opacity}
    />
  </svg>
);

// Hand-drawn squiggly underline variants (ported 1:1 from Osmo "Draw Random
// Underline"). On hover the path is drawn in with DrawSVGPlugin; on leave it's
// drawn back out and removed. Stroke uses currentColor so we tint via CSS.
const UNDERLINE_VARIANTS = [
  `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 20.9999C26.7762 16.2245 49.5532 11.5572 71.7979 14.6666C84.9553 16.5057 97.0392 21.8432 109.987 24.3888C116.413 25.6523 123.012 25.5143 129.042 22.6388C135.981 19.3303 142.586 15.1422 150.092 13.3333C156.799 11.7168 161.702 14.6225 167.887 16.8333C181.562 21.7212 194.975 22.6234 209.252 21.3888C224.678 20.0548 239.912 17.991 255.42 18.3055C272.027 18.6422 288.409 18.867 305 17.9999" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
  `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 24.2592C26.233 20.2879 47.7083 16.9968 69.135 13.8421C98.0469 9.5853 128.407 4.02322 158.059 5.14674C172.583 5.69708 187.686 8.66104 201.598 11.9696C207.232 13.3093 215.437 14.9471 220.137 18.3619C224.401 21.4596 220.737 25.6575 217.184 27.6168C208.309 32.5097 197.199 34.281 186.698 34.8486C183.159 35.0399 147.197 36.2657 155.105 26.5837C158.11 22.9053 162.993 20.6229 167.764 18.7924C178.386 14.7164 190.115 12.1115 201.624 10.3984C218.367 7.90626 235.528 7.06127 252.521 7.49276C258.455 7.64343 264.389 7.92791 270.295 8.41825C280.321 9.25056 296 10.8932 305 13.0242" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
  `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 29.5014C9.61174 24.4515 12.9521 17.9873 20.9532 17.5292C23.7742 17.3676 27.0987 17.7897 29.6575 19.0014C33.2644 20.7093 35.6481 24.0004 39.4178 25.5014C48.3911 29.0744 55.7503 25.7731 63.3048 21.0292C67.9902 18.0869 73.7668 16.1366 79.3721 17.8903C85.1682 19.7036 88.2173 26.2464 94.4121 27.2514C102.584 28.5771 107.023 25.5064 113.276 20.6125C119.927 15.4067 128.83 12.3333 137.249 15.0014C141.418 16.3225 143.116 18.7528 146.581 21.0014C149.621 22.9736 152.78 23.6197 156.284 24.2514C165.142 25.8479 172.315 17.5185 179.144 13.5014C184.459 10.3746 191.785 8.74853 195.868 14.5292C199.252 19.3205 205.597 22.9057 211.621 22.5014C215.553 22.2374 220.183 17.8356 222.979 15.5569C225.4 13.5845 227.457 11.1105 230.742 10.5292C232.718 10.1794 234.784 12.9691 236.164 14.0014C238.543 15.7801 240.717 18.4775 243.356 19.8903C249.488 23.1729 255.706 21.2551 261.079 18.0014C266.571 14.6754 270.439 11.5202 277.146 13.6125C280.725 14.7289 283.221 17.209 286.393 19.0014C292.321 22.3517 298.255 22.5014 305 22.5014" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
  `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.0039 32.6826C32.2307 32.8412 47.4552 32.8277 62.676 32.8118C67.3044 32.807 96.546 33.0555 104.728 32.0775C113.615 31.0152 104.516 28.3028 102.022 27.2826C89.9573 22.3465 77.3751 19.0254 65.0451 15.0552C57.8987 12.7542 37.2813 8.49399 44.2314 6.10216C50.9667 3.78422 64.2873 5.81914 70.4249 5.96641C105.866 6.81677 141.306 7.58809 176.75 8.59886C217.874 9.77162 258.906 11.0553 300 14.4892" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
  `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.99805 20.9998C65.6267 17.4649 126.268 13.845 187.208 12.8887C226.483 12.2723 265.751 13.2796 304.998 13.9998" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
  `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 29.8857C52.3147 26.9322 99.4329 21.6611 146.503 17.1765C151.753 16.6763 157.115 15.9505 162.415 15.6551C163.28 15.6069 165.074 15.4123 164.383 16.4275C161.704 20.3627 157.134 23.7551 153.95 27.4983C153.209 28.3702 148.194 33.4751 150.669 34.6605C153.638 36.0819 163.621 32.6063 165.039 32.2029C178.55 28.3608 191.49 23.5968 204.869 19.5404C231.903 11.3436 259.347 5.83254 288.793 5.12258C294.094 4.99476 299.722 4.82265 305 5.45025" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
];

// Ornamental gold filigree divider — a symmetric flourish drawn in on scroll.
const FILIGREE = `<svg viewBox="0 0 600 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><path d="M10 20 H230" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M590 20 H370" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M230 20 C250 20 250 8 270 8 C285 8 285 20 300 20 C315 20 315 8 330 8 C350 8 350 20 370 20" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M230 20 C250 20 250 32 270 32 C285 32 285 20 300 20 C315 20 315 32 330 32 C350 32 350 20 370 20" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M300 4 L302.2 12.5 L310 14 L302.2 15.5 L300 24 L297.8 15.5 L290 14 L297.8 12.5 Z" fill="currentColor"/></svg>`;

// Big corner botanical flourish — drawn in on scroll, sits low-opacity in the
// footer corners for ornamental density.
const CORNER_VINE = `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 190 C10 120 40 70 100 50 C150 33 180 20 190 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M100 50 C90 30 95 12 115 8 C108 26 116 40 100 50Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M55 75 C40 60 42 42 62 36 C56 54 66 66 55 75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M148 33 C140 16 146 2 164 0 C156 16 162 26 148 33Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="100" cy="50" r="3.5" fill="currentColor"/><circle cx="55" cy="75" r="3" fill="currentColor"/><circle cx="148" cy="33" r="3" fill="currentColor"/></svg>`;

export default function SiteFooter({
  instagramUrl = INSTAGRAM_DEFAULT,
  facebookUrl,
  youtubeUrl,
  email,
  phone,
  locationText,
}: {
  /** Instagram differs per page (Photography vs Events); the rest are brand-wide. */
  instagramUrl?: string;
  /** Social/contact overrides from Sanity siteSettings; fall back to defaults. */
  facebookUrl?: string;
  youtubeUrl?: string;
  email?: string;
  phone?: string;
  locationText?: string;
}) {
  // Override each social href with a Sanity value when present, else the default.
  const overrides: Record<string, string | undefined> = {
    instagram: instagramUrl,
    facebook: facebookUrl,
    youtube: youtubeUrl,
  };
  const socials = SOCIALS.map((s) =>
    overrides[s.key] ? { ...s, href: overrides[s.key]! } : s,
  );

  // Contact + location, Sanity-driven with sensible fallbacks.
  const contactEmail = email || "hello@agnitantra.com";
  const contactPhone = phone || "+91 00000 00000";
  const telHref = `tel:${contactPhone.replace(/[^\d+]/g, "")}`;
  const mailHref = `mailto:${contactEmail}`;

  const footerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!footerRef.current || !innerRef.current) return;

      // The footer is fixed at the bottom behind <main>. On reload, before the
      // browser restores scroll-to-top and <main> paints over it, the footer
      // can flash into view. It starts `visibility: hidden` (inline style) so
      // it never paints on first frame; we reveal it here, after mount +
      // scroll restoration, then the content fades on scroll as before.
      gsap.set(footerRef.current, { autoAlpha: 1 });

      // Reveal: footer content drifts up + fades in as the footer scrolls
      // into view. Scrubbed to scroll position, eased smoothly.
      const tween = gsap.fromTo(
        innerRef.current,
        { yPercent: 14, autoAlpha: 0.2 },
        {
          yPercent: 0,
          autoAlpha: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "top 30%",
            scrub: 1,
          },
        },
      );

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const tweens: gsap.core.Tween[] = [];
      const cleanups: Array<() => void> = [];

      // ── Layered parallax: roses bg + counter-moving giant wordmark ─────────
      // The bg layer is oversized vertically (CSS: top -12% / height 124%) so it
      // has slack to drift. The wordmark moves the OPPOSITE direction at a
      // smaller amount, so the two planes separate into real depth. Scrubbed to
      // scroll; both skipped for reduced motion (static).
      if (!prefersReduced) {
        if (bgRef.current) {
          tweens.push(
            gsap.fromTo(
              bgRef.current,
              { yPercent: -8 },
              {
                yPercent: 8,
                ease: "none",
                scrollTrigger: {
                  trigger: footerRef.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            ),
          );
        }
        if (wordmarkRef.current) {
          tweens.push(
            gsap.fromTo(
              wordmarkRef.current,
              { yPercent: 12 },
              {
                yPercent: -6,
                ease: "none",
                scrollTrigger: {
                  trigger: footerRef.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.2,
                },
              },
            ),
          );
        }

        // ── Cards stagger-rise as the footer comes in ───────────────────────
        const cards = footerRef.current.querySelectorAll<HTMLElement>(".footer-card");
        if (cards.length) {
          tweens.push(
            gsap.from(cards, {
              yPercent: 16,
              autoAlpha: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: footerRef.current,
                start: "top 80%",
              },
            }),
          );
        }

        // ── Ornaments draw in on scroll (filigree divider + corner vines) ───
        const drawables = footerRef.current.querySelectorAll<SVGPathElement>(
          "[data-draw-ornament] path, [data-draw-ornament] circle",
        );
        if (drawables.length) {
          gsap.set(drawables, { drawSVG: "0%" });
          tweens.push(
            gsap.to(drawables, {
              drawSVG: "100%",
              duration: 1.4,
              stagger: 0.04,
              ease: "power2.inOut",
              scrollTrigger: {
                trigger: footerRef.current,
                start: "top 75%",
              },
            }),
          );
        }

        // ── Marquee ribbon: seamless infinite horizontal loop ───────────────
        const track = footerRef.current.querySelector<HTMLElement>("[data-marquee-track]");
        if (track) {
          const loop = gsap.to(track, {
            xPercent: -50,
            duration: 28,
            ease: "none",
            repeat: -1,
          });
          tweens.push(loop);
        }
      }

      // ── Draw Random Underline on footer nav links (ported from Osmo) ──────
      // Skip entirely for reduced-motion: the links keep their static color
      // hover, no drawing. (Accessibility — see MOBILE-RULES / CLAUDE.md.)
      if (!prefersReduced) {
        let nextIndex: number | null = null;

        const containers =
          footerRef.current.querySelectorAll<HTMLElement>("[data-draw-line]");

        containers.forEach((container) => {
          const box = container.querySelector<HTMLElement>("[data-draw-line-box]");
          if (!box) return;

          let enterTween: gsap.core.Tween | null = null;
          let leaveTween: gsap.core.Tween | null = null;

          const onEnter = () => {
            if (enterTween && enterTween.isActive()) return;
            if (leaveTween && leaveTween.isActive()) leaveTween.kill();

            if (nextIndex === null) {
              nextIndex = Math.floor(Math.random() * UNDERLINE_VARIANTS.length);
            }

            box.innerHTML = UNDERLINE_VARIANTS[nextIndex];
            const svg = box.querySelector("svg");
            if (svg) {
              svg.setAttribute("preserveAspectRatio", "none");
              const path = svg.querySelector("path");
              if (path) {
                gsap.set(path, { drawSVG: "0%" });
                enterTween = gsap.to(path, {
                  duration: 0.5,
                  drawSVG: "100%",
                  ease: "power2.inOut",
                  onComplete: () => {
                    enterTween = null;
                  },
                });
              }
            }

            nextIndex = (nextIndex + 1) % UNDERLINE_VARIANTS.length;
          };

          const onLeave = () => {
            const path = box.querySelector("path");
            if (!path) return;

            const playOut = () => {
              if (leaveTween && leaveTween.isActive()) return;
              leaveTween = gsap.to(path, {
                duration: 0.5,
                drawSVG: "100% 100%",
                ease: "power2.inOut",
                onComplete: () => {
                  leaveTween = null;
                  box.innerHTML = "";
                },
              });
            };

            if (enterTween && enterTween.isActive()) {
              enterTween.eventCallback("onComplete", playOut);
            } else {
              playOut();
            }
          };

          container.addEventListener("mouseenter", onEnter);
          container.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            container.removeEventListener("mouseenter", onEnter);
            container.removeEventListener("mouseleave", onLeave);
          });
        });

        // ── Link socials: name-hover lifts its button; button-hover draws the
        //    paired name's underline. The name already runs draw-underline via
        //    [data-draw-line] above; here we just sync the lift + reverse link. ─
        const footerEl = footerRef.current;
        const pairFor = (key: string) => ({
          name: footerEl.querySelector<HTMLElement>(`[data-social="${key}"]`),
          btn: footerEl.querySelector<HTMLElement>(`[data-social-btn="${key}"]`),
        });

        // Hovering a NAME → lift its button.
        footerEl.querySelectorAll<HTMLElement>("[data-social]").forEach((name) => {
          const key = name.dataset.social!;
          const onEnter = () => pairFor(key).btn?.classList.add("is--lift");
          const onLeave = () => pairFor(key).btn?.classList.remove("is--lift");
          name.addEventListener("mouseenter", onEnter);
          name.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            name.removeEventListener("mouseenter", onEnter);
            name.removeEventListener("mouseleave", onLeave);
          });
        });

        // Hovering a BUTTON → trigger the paired name's draw-underline (by
        // dispatching the same mouse events its [data-draw-line] handler listens
        // for) and flag the name as linked-active for color.
        footerEl.querySelectorAll<HTMLElement>("[data-social-btn]").forEach((btn) => {
          const key = btn.dataset.socialBtn!;
          const onEnter = () => {
            const name = pairFor(key).name;
            name?.classList.add("is--linked");
            name?.dispatchEvent(new MouseEvent("mouseenter"));
          };
          const onLeave = () => {
            const name = pairFor(key).name;
            name?.classList.remove("is--linked");
            name?.dispatchEvent(new MouseEvent("mouseleave"));
          };
          btn.addEventListener("mouseenter", onEnter);
          btn.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            btn.removeEventListener("mouseenter", onEnter);
            btn.removeEventListener("mouseleave", onLeave);
          });
        });
      }

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        tweens.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
        cleanups.forEach((fn) => fn());
      };
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      aria-label="Site footer"
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "var(--color-primary-dark)",
        color: "var(--color-cream)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        visibility: "hidden",
      }}
    >
      <style>{`
        /* ── Pink-roses parallax background ── */
        .footer-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .footer-bg__img {
          position: absolute;
          top: -12%;
          left: 0;
          width: 100%;
          height: 124%;
          object-fit: cover;
          will-change: transform;
          filter: brightness(0.82);
        }
        .footer-bg__scrim {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              120% 90% at 50% 35%,
              rgba(122, 31, 31, 0.28) 0%,
              rgba(90, 22, 22, 0.55) 70%,
              rgba(60, 14, 14, 0.78) 100%
            );
        }

        /* ── Corner ornamental vines (drawn) ── */
        .footer-corner {
          position: absolute;
          width: 13em;
          height: 13em;
          z-index: 1;
          color: var(--color-gold);
          opacity: 0.5;
          pointer-events: none;
        }
        .footer-corner svg { width: 100%; height: 100%; overflow: visible; }
        .footer-corner--tl { top: 1.2em; left: 1.2em; }
        .footer-corner--tr { top: 1.2em; right: 1.2em; transform: scaleX(-1); }
        .footer-corner--bl { bottom: 1.2em; left: 1.2em; transform: scaleY(-1); }
        .footer-corner--br { bottom: 1.2em; right: 1.2em; transform: scale(-1, -1); }

        /* ── Nav row ── */
        .footer-nav-list {
          list-style: none;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: clamp(1.5em, 5vw, 4em);
        }
        .footer-nav-link {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          cursor: pointer;
        }
        .footer-nav-link__text {
          font-size: 1.3em;
          font-weight: 400;
          letter-spacing: 0.04em;
          line-height: 1.1;
          color: #fdfbf7;
          text-shadow: 0 1px 3px rgba(15, 6, 6, 0.45);
          transition: color 180ms ease, text-shadow 180ms ease;
        }
        .footer-nav-link:hover .footer-nav-link__text {
          color: #ffffff;
          text-shadow:
            0 0 8px rgba(255, 250, 240, 0.55),
            0 1px 3px rgba(15, 6, 6, 0.45);
        }
        .footer-nav-link__box {
          color: var(--color-gold);
          position: relative;
          width: 100%;
          height: 0.5em;
          margin-top: 0.05em;
          pointer-events: none;
        }
        .footer-nav-link__box svg {
          width: 100%;
          height: 100%;
          position: absolute;
          overflow: visible !important;
        }

        /* ── Filigree divider ── */
        .footer-filigree {
          color: var(--color-gold);
          width: min(34em, 80%);
          height: 2.2em;
          margin: 1.6em auto 0;
          opacity: 0.85;
        }
        .footer-filigree svg { width: 100%; height: 100%; overflow: visible; }

        /* ── Cards ── */
        .footer-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 1.1em;
          margin-top: 2em;
        }
        .footer-cards-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.1em;
        }
        .footer-card {
          position: relative;
          background-color: rgba(245, 237, 224, 0.96);
          color: var(--color-ink);
          border: 1px solid rgba(201, 169, 110, 0.55);
          border-radius: 1.6em;
          padding: 1.9em 2em;
          overflow: hidden;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.6) inset,
            0 18px 40px -24px rgba(40, 10, 10, 0.55);
          backdrop-filter: blur(2px);
        }
        .footer-card--contact { min-height: 18em; }
        .footer-card--location,
        .footer-card--socials { min-height: 16em; }

        /* ── Location card: text left, squircle map right ── */
        .footer-location {
          display: grid;
          grid-template-columns: 1fr minmax(0, 14em);
          gap: 1.4em;
          align-items: center;
          height: 100%;
        }
        .footer-location__text { min-width: 0; }
        /* Squircle map — clipped so the iframe corners never bleed past it,
           sized to sit inside the card padding with room to spare. */
        .footer-map {
          display: block;
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          max-height: 13em;
          border-radius: 28% / 28%;            /* squircle-ish superellipse */
          overflow: hidden;
          border: 1px solid rgba(201, 169, 110, 0.55);
          box-shadow: 0 10px 24px -16px rgba(40, 10, 10, 0.5);
          background: var(--color-cream-dark);
        }
        .footer-map iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          /* Let the parent <a> own the click so the whole squircle opens Maps. */
          pointer-events: none;
        }
        /* Gentle warm tint so the map reads as part of the cream card, not a
           jarring white rectangle; lifts on hover. */
        .footer-map::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(122, 31, 31, 0.08);
          transition: background 220ms ease;
          pointer-events: none;
        }
        .footer-map:hover::after { background: rgba(122, 31, 31, 0); }

        .footer-card__eyebrow {
          font-size: 0.65em;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-primary);
          font-weight: 400;
          display: inline-flex;
          align-items: center;
          gap: 0.7em;
        }

        .footer-card__heading {
          font-size: clamp(1.6rem, 2.6vw, 2.4rem);
          line-height: 1.1;
          color: var(--color-ink);
          margin: 0.5em 0 0.3em;
        }
        .footer-card__lead {
          color: var(--color-ink-muted);
          font-size: 0.95em;
          line-height: 1.5;
          max-width: 32ch;
        }
        .footer-contact-lines {
          display: flex;
          flex-direction: column;
          gap: 0.35em;
          margin-top: 1.1em;
        }
        .footer-contact-line {
          display: inline-flex;
          align-items: center;
          gap: 0.6em;
          color: var(--color-ink);
          text-decoration: none;
          font-size: 1.05em;
          width: fit-content;
          transition: color 160ms ease;
        }
        .footer-contact-line:hover { color: var(--color-primary); }
        .footer-contact-line svg { color: var(--color-gold); flex-shrink: 0; }

        .footer-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.6em;
          margin-top: 1.4em;
          padding: 0.8em 1.5em;
          border-radius: 999px;
          background-color: var(--color-primary);
          color: var(--color-cream);
          font-size: 0.8em;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background-color 200ms ease, transform 200ms ease;
        }
        .footer-pill:hover {
          background-color: var(--color-primary-light);
          transform: translateY(-2px);
        }

        .footer-meta-line {
          color: var(--color-ink);
          font-size: 1em;
          line-height: 1.6;
        }
        /* ── Socials: side text + 2×2 big-button grid ── */
        .footer-socials {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1.4em;
          align-items: center;
          margin-top: 0.9em;
        }
        .footer-socials__header {
          margin: 0 0 0.7em;
          font-size: clamp(1.4rem, 2vw, 1.9rem);
          line-height: 1.15;
          max-width: 14ch;
        }
        .footer-socials__names {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.25em;
        }
        .footer-social-name {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          width: fit-content;
          text-decoration: none;
          cursor: pointer;
        }
        .footer-social-name__text {
          font-size: 1.1em;
          line-height: 1.15;
          color: var(--color-ink);
          transition: color 160ms ease;
        }
        .footer-social-name:hover .footer-social-name__text,
        .footer-social-name.is--linked .footer-social-name__text {
          color: var(--color-primary);
        }
        /* Underline box — gold draw-random-underline, identical to the nav. */
        .footer-social-name__box {
          color: var(--color-gold);
          position: relative;
          width: 100%;
          height: 0.4em;
          margin-top: 0.02em;
          pointer-events: none;
        }
        .footer-social-name__box svg {
          width: 100%;
          height: 100%;
          position: absolute;
          overflow: visible !important;
        }

        .footer-socials__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.7em;
        }
        .footer-social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 5.6em;
          height: 5.6em;
          border-radius: 1.3em;
          border: 1px solid rgba(201, 169, 110, 0.6);
          background-color: rgba(255, 255, 255, 0.35);
          color: var(--color-primary);
          text-decoration: none;
          /* Smooth, subtle scale-in on hover (no fly-up). */
          transition: background-color 320ms ease, color 320ms ease,
                      transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 420ms ease;
          will-change: transform;
        }
        .footer-social-btn svg { width: 2.4em; height: 2.4em; }
        /* Zoom in gently on direct hover OR when its paired name is hovered. */
        .footer-social-btn:hover,
        .footer-social-btn.is--lift {
          transform: scale(1.07);
          background-color: var(--color-primary);
          color: var(--color-cream);
          box-shadow: 0 12px 30px -14px rgba(40, 10, 10, 0.55);
        }

        /* ── Marquee ribbon ── */
        .footer-marquee {
          position: relative;
          margin-top: 2.2em;
          padding: 0.9em 0;
          border-top: 1px solid rgba(201, 169, 110, 0.35);
          border-bottom: 1px solid rgba(201, 169, 110, 0.35);
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .footer-marquee__track {
          display: flex;
          width: max-content;
          align-items: center;
          will-change: transform;
        }
        .footer-marquee__item {
          display: inline-flex;
          align-items: center;
          gap: 1.4em;
          padding: 0 1.4em;
          color: var(--color-gold);
          font-size: 1em;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* ── Giant wordmark ── */
        .footer-wordmark {
          position: relative;
          z-index: 1;
          width: 100%;
          text-align: center;
          margin-top: 1.4em;
          padding: 0 0.5rem;
          will-change: transform;
        }
        .footer-wordmark__text {
          display: block;
          font-family: var(--font-sometimes-times), serif;
          font-weight: 400;
          font-size: clamp(3.2rem, 15vw, 15rem);
          line-height: 0.9;
          letter-spacing: 0.01em;
          color: #fdfbf7;
          text-shadow:
            0 0 18px rgba(255, 250, 240, 0.22),
            0 2px 6px rgba(15, 6, 6, 0.5);
          white-space: nowrap;
        }
        .footer-colophon {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 0.6em 1.4em;
          align-items: center;
          justify-content: center;
          margin-top: 1.4em;
          color: rgba(245, 237, 224, 0.7);
          font-size: 0.78em;
          letter-spacing: 0.04em;
          text-align: center;
        }

        @media (max-width: 767px) {
          .footer-cards-row { grid-template-columns: 1fr; }
          .footer-nav-list {
            flex-wrap: wrap;
            gap: 0.6em 1.4em;
          }
          .footer-nav-link__text { font-size: 1em !important; }
          .footer-corner { width: 8em; height: 8em; opacity: 0.4; }
          .footer-marquee__item { font-size: 0.85em; letter-spacing: 0.16em; }
          /* Socials: stack the name list above the button grid on mobile. */
          .footer-socials {
            grid-template-columns: 1fr;
            justify-items: start;
          }
          .footer-social-btn { width: 4.8em; height: 4.8em; }
          /* Location: stack the map below the text on narrow screens. */
          .footer-location {
            grid-template-columns: 1fr;
            gap: 1.2em;
          }
          .footer-map { max-height: 14em; max-width: 18em; }
        }
      `}</style>

      {/* Pink-roses background with slight parallax (sits behind all content) */}
      <div className="footer-bg" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bgRef}
          src="/images/footer-roses.webp"
          alt=""
          className="footer-bg__img"
          loading="lazy"
        />
        <div className="footer-bg__scrim" />
      </div>

      {/* Corner botanical flourishes (drawn in on scroll) */}
      <div
        className="footer-corner footer-corner--tl"
        data-draw-ornament=""
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: CORNER_VINE }}
      />
      <div
        className="footer-corner footer-corner--tr"
        data-draw-ornament=""
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: CORNER_VINE }}
      />
      <div
        className="footer-corner footer-corner--bl"
        data-draw-ornament=""
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: CORNER_VINE }}
      />
      <div
        className="footer-corner footer-corner--br"
        data-draw-ornament=""
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: CORNER_VINE }}
      />

      <div
        ref={innerRef}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "var(--space-lg) var(--space-md) var(--space-md)",
          maxWidth: "84em",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ── Nav row, centered with sparkle bookends ── */}
        <nav aria-label="Footer navigation">
          <ul className="footer-nav-list">
            <li aria-hidden="true" style={{ display: "flex" }}>
              <Sparkle size={14} opacity={0.7} />
            </li>
            {FOOTER_NAV.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  data-draw-line=""
                  className="footer-nav-link font-nohemi"
                >
                  <span className="footer-nav-link__text">{label}</span>
                  <span
                    data-draw-line-box=""
                    className="footer-nav-link__box"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
            <li aria-hidden="true" style={{ display: "flex" }}>
              <Sparkle size={14} opacity={0.7} />
            </li>
          </ul>
        </nav>

        {/* ── Filigree divider (drawn) ── */}
        <div
          className="footer-filigree"
          data-draw-ornament=""
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: FILIGREE }}
        />

        {/* ── Cards ── */}
        <div className="footer-cards-stack">
          {/* Contact — the focal card */}
          <div className="footer-card footer-card--contact">
            <span className="footer-card__eyebrow font-nohemi">
              <Sparkle size={10} opacity={0.9} /> Contact
            </span>
            <h3 className="footer-card__heading font-sometimes-times">
              Let&rsquo;s create something timeless.
            </h3>
            <p className="footer-card__lead">
              Tell us about your day — weddings, portraits, celebrations, and
              catering. We&rsquo;d love to hear the story you want to tell.
            </p>
            <div className="footer-contact-lines">
              <a className="footer-contact-line" href={mailHref}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {contactEmail}
              </a>
              <a className="footer-contact-line" href={telHref}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {contactPhone}
              </a>
            </div>
            <Link href="/events" className="footer-pill font-nohemi">
              Enquire
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="footer-cards-row">
            {/* Location */}
            <div className="footer-card footer-card--location">
              <div className="footer-location">
                <div className="footer-location__text">
                  <span className="footer-card__eyebrow font-nohemi">
                    <Sparkle size={10} opacity={0.9} /> Location
                  </span>
                  <h3 className="footer-card__heading font-sometimes-times">Studio</h3>
                  <p className="footer-meta-line">
                    {locationText || "Based in Kerala — available across India."}
                  </p>
                  <p
                    className="footer-meta-line"
                    style={{ marginTop: "0.8em", opacity: 0.8 }}
                  >
                    By appointment · Mon–Sat
                  </p>
                </div>

                {/* Squircle Google Map — contained, never bleeds past the card */}
                <a
                  className="footer-map"
                  href="https://maps.app.goo.gl/?q=AGNITANTRA+EVENTS+%26+CATERERS"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open AGNITANTRA EVENTS & CATERERS on Google Maps"
                >
                  <iframe
                    title="AGNITANTRA EVENTS & CATERERS location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3935.5612784161167!2d76.54826277949365!3d9.459812266433326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0627841d270455%3A0x9114ed10c4ee07e7!2sAGNITANTRA%20EVENTS%20%26%20CATERERS!5e0!3m2!1sen!2sin!4v1782493098587!5m2!1sen!2sin"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </a>
              </div>
            </div>

            {/* Socials */}
            <div className="footer-card footer-card--socials">
              <span className="footer-card__eyebrow font-nohemi">
                <Sparkle size={10} opacity={0.9} /> Socials
              </span>

              <div className="footer-socials">
                {/* Left: header + hoverable name list (reuses draw-underline) */}
                <div className="footer-socials__text">
                  <h3 className="footer-card__heading font-sometimes-times footer-socials__header">
                    Follow and Get in Touch with Us
                  </h3>
                  <ul className="footer-socials__names">
                    {socials.map((s) => (
                      <li key={s.key}>
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-draw-line=""
                          data-social={s.key}
                          className="footer-social-name"
                        >
                          <span className="footer-social-name__text">{s.name}</span>
                          <span
                            data-draw-line-box=""
                            className="footer-social-name__box"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: 2×2 grid of big buttons */}
                <div className="footer-socials__grid">
                  {socials.map((s) => (
                    <a
                      key={s.key}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-social-btn={s.key}
                      className="footer-social-btn"
                      aria-label={s.name}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Marquee ribbon ── */}
        <div className="footer-marquee" aria-hidden="true">
          <div className="footer-marquee__track" data-marquee-track="">
            {[0, 1].map((dup) => (
              <div className="footer-marquee__item" key={dup}>
                {MARQUEE_WORDS.map((w) => (
                  <span
                    key={w}
                    style={{ display: "inline-flex", alignItems: "center", gap: "1.4em" }}
                  >
                    {w}
                    <Sparkle size={9} opacity={0.8} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Giant wordmark (counter-parallax) ── */}
        <div className="footer-wordmark" ref={wordmarkRef}>
          <span className="footer-wordmark__text">Agnitantra</span>
        </div>

        {/* ── Colophon ── */}
        <div className="footer-colophon font-nohemi">
          <span>© {new Date().getFullYear()} Agnitantra Events &amp; Aira Photography</span>
          <span aria-hidden="true">·</span>
          <span>Crafted with care</span>
        </div>
      </div>
    </footer>
  );
}
