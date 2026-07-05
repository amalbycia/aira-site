// One-off seed: give the Photography page its own reviews by copying the current
// Events reviews into photography-tagged rows. After this, the owner edits the two
// sets independently in /manage (Photography → Reviews vs Events → Reviews).
//
// Idempotent: if photography already has any reviews, it does nothing (so a
// re-run never duplicates). To force a fresh copy, delete photography reviews
// first in the admin.
//
// Run:  node scripts/seed-photography-reviews.mjs
// Reads DATABASE_URI from .env.local (or the environment).

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

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

async function main() {
  const existing = (
    await sql`select count(*)::int as n from reviews where page = 'photography'`
  )[0].n;

  if (existing > 0) {
    console.log(
      `Photography already has ${existing} review(s) — nothing to do (idempotent).`,
    );
    return;
  }

  const inserted = await sql`
    insert into reviews (page, reviewer_name, rating, review_text, review_date, sort_order)
    select 'photography', reviewer_name, rating, review_text, review_date, sort_order
    from reviews where page = 'events'
    returning id
  `;

  console.log(
    `✓ Seeded ${inserted.length} photography review(s) from the events set.`,
  );
  console.log(
    "  They're now editable in /manage → Photography → Reviews, separate from Events.",
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
