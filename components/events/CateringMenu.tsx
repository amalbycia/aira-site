"use client";

import { useState } from "react";
import type { MenuCategory } from "@/lib/cms/getContent";
import styles from "./CateringMenu.module.css";

/**
 * Placeholder menu, shown only when the admin menu is empty or the DB is
 * unreachable. Kept identical to the pre-redesign fallback.
 */
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

/**
 * Catering menu — DB-driven (menu_categories / menu_dishes), edited by the
 * owner in /manage → Events → Events Menu.
 *
 * Tabs switch categories. Deliberately no animation on switch: the content is
 * a list of dish names, and animating text reflow is exactly the kind of motion
 * the brief asks us to avoid.
 */
export default function CateringMenu({
  categories,
  eyebrow = "At the table",
  heading = "A menu worth staying for.",
}: {
  /** Live menu from the admin. Falls back to the placeholder when empty. */
  categories?: MenuCategory[];
  eyebrow?: string;
  heading?: string;
} = {}) {
  const MENU =
    categories && categories.length > 0 ? categories : FALLBACK_MENU;

  const [active, setActive] = useState(MENU[0]?.id);
  const activeCat = MENU.find((c) => c.id === active) ?? MENU[0];

  if (!activeCat) return null;

  return (
    <section className="section section--deep">
      <div className="shell">
        <div className={styles.head}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className={`display--lg ${styles.heading}`}>{heading}</h2>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Menu categories">
          {MENU.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === activeCat.id}
              className={styles.tab}
              data-active={c.id === activeCat.id}
              onClick={() => setActive(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <ul className={styles.dishes} role="tabpanel">
          {activeCat.dishes.map((d, i) => (
            <li className={styles.dish} key={`${activeCat.id}-${i}`}>
              <span className={styles.dishDot} aria-hidden="true" />
              {d}
            </li>
          ))}
        </ul>

        <p className={styles.note}>
          Menus are built around your family&apos;s tastes — tell us what you
          have in mind and we&apos;ll shape the spread around it.
        </p>
      </div>
    </section>
  );
}
