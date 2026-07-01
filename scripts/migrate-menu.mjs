// One-off migration: creates the catering-menu tables (categories + dishes)
// and seeds them from the previously-hardcoded CateringMenu defaults so the
// events page looks identical the moment this ships. Idempotent — safe to
// re-run (uses IF NOT EXISTS and only seeds when the tables are empty).
//
// Run:  node scripts/migrate-menu.mjs
// Reads DATABASE_URI from .env.local (or the environment).

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

// Minimal .env.local loader (no dotenv dependency needed).
function loadEnv() {
  if (process.env.DATABASE_URI) return process.env.DATABASE_URI;
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*DATABASE_URI\s*=\s*(.+)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return null;
}

const connectionString = loadEnv();
if (!connectionString) {
  console.error("DATABASE_URI not found (.env.local or env). Aborting.");
  process.exit(1);
}
const sql = neon(connectionString);

// The prior hardcoded menu — seeded so nothing visually changes at launch.
const SEED = [
  {
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

async function main() {
  console.log("Creating menu tables…");
  await sql`
    create table if not exists menu_categories (
      id          serial primary key,
      label       text not null,
      sort_order  integer not null default 0,
      created_at  timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists menu_dishes (
      id           serial primary key,
      category_id  integer not null references menu_categories(id) on delete cascade,
      name         text not null,
      sort_order   integer not null default 0,
      created_at   timestamptz not null default now()
    )
  `;
  await sql`create index if not exists idx_menu_dishes_category on menu_dishes(category_id)`;

  const [{ n }] = await sql`select count(*)::int as n from menu_categories`;
  if (n > 0) {
    console.log(`menu_categories already has ${n} rows — skipping seed.`);
    console.log("Done.");
    return;
  }

  console.log("Seeding default Kerala menu…");
  for (let ci = 0; ci < SEED.length; ci++) {
    const cat = SEED[ci];
    const [row] = await sql`
      insert into menu_categories (label, sort_order)
      values (${cat.label}, ${ci})
      returning id
    `;
    for (let di = 0; di < cat.dishes.length; di++) {
      await sql`
        insert into menu_dishes (category_id, name, sort_order)
        values (${row.id}, ${cat.dishes[di]}, ${di})
      `;
    }
  }
  console.log(`Seeded ${SEED.length} categories.`);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
