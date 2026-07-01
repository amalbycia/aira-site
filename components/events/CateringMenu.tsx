"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

// Kerala-leaning catering menu. Live data comes from the admin (Neon) via the
// `categories` prop; if that's empty (DB unconfigured/unreachable, or no menu
// entered yet) we fall back to this hardcoded placeholder so the section never
// renders blank.
type MenuCategory = { id: string; label: string; dishes: string[] };

const FALLBACK_MENU: MenuCategory[] = [
  {
    id: "veg",
    label: "Vegetarian",
    dishes: [
      "Kerala Sadya (banana-leaf feast)",
      "Avial & Olan",
      "Paneer Butter Masala",
      "Vegetable Stew with Appam",
      "Ghee Rice & Kadala Curry",
      "Palada Pradhaman",
    ],
  },
  {
    id: "nonveg",
    label: "Non-Vegetarian",
    dishes: [
      "Malabar Chicken Biryani",
      "Karimeen Pollichathu",
      "Beef Ularthiyathu",
      "Nadan Chicken Roast",
      "Fish Moilee",
      "Mutton Stew with Idiyappam",
    ],
  },
  {
    id: "live",
    label: "Live Counters",
    dishes: [
      "Dosa & Appam station",
      "Kerala Porotta counter",
      "Chaat & street-food bar",
      "Grill & barbecue station",
      "Fresh juice & tender coconut",
    ],
  },
  {
    id: "sweets",
    label: "Desserts",
    dishes: [
      "Assorted Payasam bar",
      "Unniyappam & Ela Ada",
      "Tender-coconut pudding",
      "Live ice-cream counter",
      "Festive baked sweets",
    ],
  },
];

export default function CateringMenu({
  categories,
}: {
  /** Live menu from the admin. Falls back to the placeholder when empty. */
  categories?: MenuCategory[];
} = {}) {
  const MENU =
    categories && categories.length > 0 ? categories : FALLBACK_MENU;

  const [active, setActive] = useState(MENU[0].id);
  const listRef = useRef<HTMLUListElement>(null);

  const activeCat = MENU.find((c) => c.id === active) ?? MENU[0];

  // Animate dish list on tab change (skips under reduced-motion).
  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;
      gsap.fromTo(
        list.children,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" },
      );
    },
    { dependencies: [active], scope: listRef },
  );

  return (
    <section aria-label="Catering menu" className="catering">
      <style>{`
        .catering {
          background-color: var(--color-cream);
          padding: var(--space-xl) var(--space-md) var(--space-lg);
        }
        .catering__head { max-width: 84em; margin: 0 auto var(--space-md); text-align: center; }
        .catering__eyebrow {
          font-family: var(--font-script), cursive;
          color: var(--color-primary);
          font-size: clamp(2rem, 4.5vw, 2.8em);
          line-height: 1; margin-bottom: 0.1em;
        }
        .catering__heading {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400; font-size: clamp(1.4rem, 3vw, 2.2em);
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink);
        }
        .catering__intro {
          font-family: var(--font-nohemi), sans-serif; font-weight: 200;
          font-size: 1em; line-height: 1.8; color: var(--color-ink-muted);
          max-width: 52ch; margin: 0.8em auto 0;
        }

        .catering__panel {
          max-width: 60em; margin: var(--space-md) auto 0;
          background-color: var(--color-white);
          border: 1px solid var(--color-cream-dark);
          border-radius: 1.6em;
          padding: clamp(1.4em, 3vw, 2.6em);
          box-shadow: 0 24px 60px rgba(122, 31, 31, 0.06);
        }

        .catering__tabs {
          display: flex; flex-wrap: wrap; gap: 0.6em;
          justify-content: center;
          border-bottom: 1px solid var(--color-cream-dark);
          padding-bottom: 1.4em; margin-bottom: 1.6em;
        }
        .catering__tab {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400; font-size: 0.9em;
          letter-spacing: 0.06em;
          color: var(--color-ink-muted);
          background: transparent;
          border: 1px solid transparent;
          border-radius: 999px;
          padding: 0.6em 1.4em;
          min-height: 44px;
          cursor: pointer;
          transition: color 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
        }
        .catering__tab:hover { color: var(--color-primary); }
        .catering__tab[aria-selected="true"] {
          color: var(--color-cream);
          background-color: var(--color-primary);
          border-color: var(--color-primary);
        }

        .catering__dishes {
          list-style: none;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4em 2.4em;
        }
        .catering__dish {
          display: flex; align-items: baseline; gap: 0.7em;
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200; font-size: 1.05em; line-height: 1.6;
          color: var(--color-ink);
          padding: 0.55em 0;
          border-bottom: 1px solid var(--color-cream);
        }
        .catering__dish::before {
          content: "";
          flex: 0 0 auto;
          width: 0.5em; height: 0.5em;
          transform: rotate(45deg);
          background-color: var(--color-gold);
          margin-top: 0.55em;
        }
        .catering__note {
          font-family: var(--font-nohemi), sans-serif; font-weight: 200;
          font-size: 0.85em; color: var(--color-ink-muted);
          text-align: center; margin-top: 1.6em; font-style: italic;
        }

        @media (max-width: 767px) {
          .catering { padding: var(--space-lg) 1em var(--space-md); }
          .catering__dishes { grid-template-columns: 1fr; gap: 0; }
          .catering__panel { border-radius: 1.2em; padding: 1.4em; }
          /* Floor read-copy at 16px (Osmo rem dips below it on small phones) */
          .catering__intro { font-size: max(16px, 1em); line-height: 1.6; }
          .catering__dish { font-size: max(16px, 1.05em); }
          .catering__tab { font-size: max(15px, 0.9em); }
        }
      `}</style>

      <div className="catering__head">
        <p className="catering__eyebrow">at the table</p>
        <h2 className="catering__heading">Catering</h2>
        <p className="catering__intro">
          From a traditional banana-leaf sadya to live counters that keep the
          celebration going — menus are built around your family, your flavours,
          and the scale of your day.
        </p>
      </div>

      <div className="catering__panel">
        <div className="catering__tabs" role="tablist" aria-label="Menu categories">
          {MENU.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              id={`tab-${cat.id}`}
              aria-selected={active === cat.id}
              aria-controls={`panel-${cat.id}`}
              className="catering__tab"
              onClick={() => setActive(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <ul
          ref={listRef}
          className="catering__dishes"
          role="tabpanel"
          id={`panel-${activeCat.id}`}
          aria-labelledby={`tab-${activeCat.id}`}
        >
          {activeCat.dishes.map((dish) => (
            <li key={dish} className="catering__dish">{dish}</li>
          ))}
        </ul>

        <p className="catering__note">
          A sample selection — full menus are tailored to each event on request.
        </p>
      </div>
    </section>
  );
}
