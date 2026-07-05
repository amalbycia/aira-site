// One-off migration: move reels & reviews off the 3-way scope ("both") to a
// strict per-page model ("photography" | "events"). Wedding/event content that
// was tagged "both" belongs with Events; Photography keeps whatever was already
// its own. After this runs, nothing in the app uses page='both' anymore.
//
//   Reels:   both → events   (the "both" reels are event highlight videos)
//   Reviews: both → events   (they're wedding/event testimonials; Photography's
//                             marquee keeps its tasteful placeholder fallback)
//
// Idempotent — re-running is a no-op once no 'both' rows remain. Prints a
// before/after summary so the change is auditable. Reversible-ish: this only
// flips the page column, so a note of the affected ids is enough to undo.
//
// Run:  node scripts/migrate-scope.mjs
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

async function counts(table) {
  const rows = await sql`
    select page, count(*)::int as n from ${sql.unsafe(table)}
    group by page order by page
  `;
  return rows.map((r) => `${r.page}=${r.n}`).join("  ") || "(none)";
}

async function main() {
  console.log("Scope migration — reels & reviews: both → events\n");

  console.log("Before:");
  console.log("  reels:  ", await counts("reels"));
  console.log("  reviews:", await counts("reviews"));

  // Capture the ids we touch so the change is auditable / reversible.
  const reelIds = (await sql`select id from reels where page = 'both' order by id`).map(
    (r) => r.id,
  );
  const reviewIds = (
    await sql`select id from reviews where page = 'both' order by id`
  ).map((r) => r.id);

  const reelRes = await sql`update reels set page = 'events' where page = 'both'`;
  const reviewRes =
    await sql`update reviews set page = 'events' where page = 'both'`;

  console.log("\nMoved to events:");
  console.log(
    `  reels:   ${reelIds.length}${reelIds.length ? ` (ids: ${reelIds.join(", ")})` : ""}`,
  );
  console.log(
    `  reviews: ${reviewIds.length}${reviewIds.length ? ` (ids: ${reviewIds.join(", ")})` : ""}`,
  );

  console.log("\nAfter:");
  console.log("  reels:  ", await counts("reels"));
  console.log("  reviews:", await counts("reviews"));

  const leftover = (
    await sql`
      select 'reels' as t, count(*)::int as n from reels where page = 'both'
      union all
      select 'reviews', count(*)::int from reviews where page = 'both'
    `
  ).filter((r) => r.n > 0);

  if (leftover.length) {
    console.error("\n⚠ Still have 'both' rows:", leftover);
    process.exit(1);
  }
  console.log("\n✓ Done — no 'both' rows remain.");
  // Touch the update-result vars so linters don't flag them as unused.
  void reelRes;
  void reviewRes;
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
