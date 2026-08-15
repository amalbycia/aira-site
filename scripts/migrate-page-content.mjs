/**
 * Adds editable page-content columns to the `pages` table.
 *
 * Idempotent and additive only: every column is nullable and added with
 * IF NOT EXISTS, so running this repeatedly is safe and no existing data is
 * touched. When a column is NULL the site falls back to its built-in copy, so
 * the pages look identical until the owner edits something in /manage.
 *
 * Run: node scripts/migrate-page-content.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

function loadEnv() {
  if (process.env.DATABASE_URI) return process.env.DATABASE_URI;
  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const m = env.match(/^DATABASE_URI=(.*)$/m);
    return m?.[1]?.trim().replace(/^["']|["']$/g, "");
  } catch {
    return undefined;
  }
}

const uri = loadEnv();
if (!uri) {
  console.error("DATABASE_URI not set (env or .env.local). Aborting.");
  process.exit(1);
}

const sql = neon(uri);

const COLUMNS = [
  "hero_eyebrow text",
  "hero_title text",
  "hero_subtitle text",
  "intro_eyebrow text",
  "intro_heading text",
  "intro_body text",
  "services_heading text",
  "menu_heading text",
  "gallery_heading text",
  "reels_heading text",
  "cta_label text",
  "cta_href text",
  "stat_1_value text",
  "stat_1_label text",
  "stat_2_value text",
  "stat_2_label text",
  "stat_3_value text",
  "stat_3_label text",
];

console.log("Adding page-content columns to `pages`…");

for (const col of COLUMNS) {
  const name = col.split(" ")[0];
  // Neon's tagged template can't interpolate identifiers, so use sql.query for DDL.
  await sql.query(`alter table pages add column if not exists ${col}`);
  console.log(`  ✓ ${name}`);
}

// Make sure both brand rows exist so the admin always has something to edit.
await sql`
  insert into pages (slug) values ('photography'), ('events')
  on conflict (slug) do nothing
`;

const rows = await sql`select slug, hero_title, intro_heading from pages order by slug`;
console.log("\nCurrent rows:");
rows.forEach((r) =>
  console.log(
    `  ${r.slug}: hero_title=${r.hero_title ?? "(null → falls back)"} intro_heading=${
      r.intro_heading ?? "(null → falls back)"
    }`,
  ),
);

console.log("\nDone. Nullable columns → the site keeps its built-in copy until edited.");
