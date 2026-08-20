/**
 * Re-encode the photography gallery on Bunny Storage at full quality.
 *
 * WHY: the live files are 1600px / 46-94KB, but the originals are 8640x5760.
 * Something downsized them by ~5.4x before upload (the admin route caps at
 * 8MB, so oversized files had to be shrunk to get through), and the upload
 * script's `withoutEnlargement` then locked that in — it only ever shrinks.
 * On a 4K display a 1600px image spanning half the viewport is being scaled
 * UP, which is exactly the softness James reported.
 *
 * WHAT: re-encodes each original at MAX_EDGE / q QUALITY and PUTs it back to
 * the SAME storage path, so every URL in the DB stays valid and nothing in
 * the database changes. Purely a file-content swap.
 *
 * Matching is by the storage path's trailing filename ("003-ask03727.webp"
 * → "ASK03727.jpg"), which is how the original uploader named them.
 *
 * Usage:
 *   node scripts/reencode-gallery-hq.mjs --dry     # report only, no writes
 *   node scripts/reencode-gallery-hq.mjs           # re-encode and upload
 */
import sharp from "sharp";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// .env.local, without adding a dotenv dependency to a one-off script.
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const { neon } = await import("@neondatabase/serverless");

const SRC_DIR = "C:/Users/alkes/Downloads/000-20260620T085903Z-3-001/000";
const STORAGE_ORIGIN = "https://storage.bunnycdn.com";
const MAX_EDGE = 2600;
const QUALITY = 86;
const DRY = process.argv.includes("--dry");

const ZONE = process.env.BUNNY_STORAGE_ZONE;
const KEY = process.env.BUNNY_STORAGE_API_KEY;
if (!ZONE || !KEY) {
  console.error("BUNNY_STORAGE_ZONE and BUNNY_STORAGE_API_KEY must be set.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URI);

/** "gallery/photography/003-ask03727.webp" -> "ask03727" */
function stemOf(storagePath) {
  const file = storagePath.split("/").pop() ?? "";
  return file
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+-/, "")
    .toLowerCase();
}

async function main() {
  const rows = await sql`
    select id, storage_path from gallery_photos
    where page = 'photography'
    order by sort_order asc, id asc`;

  const originals = new Map();
  for (const f of readdirSync(SRC_DIR)) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue;
    originals.set(f.replace(/\.[^.]+$/, "").toLowerCase(), f);
  }

  console.log(`${rows.length} gallery rows, ${originals.size} originals in source.\n`);

  let done = 0;
  let missing = 0;
  let beforeTotal = 0;
  let afterTotal = 0;

  for (const row of rows) {
    const stem = stemOf(row.storage_path);
    const original = originals.get(stem);

    if (!original) {
      console.log(`SKIP  ${row.storage_path} — no original named "${stem}"`);
      missing++;
      continue;
    }

    const srcPath = join(SRC_DIR, original);
    const buf = await sharp(srcPath)
      // Honour EXIF orientation, or portraits come back rotated.
      .rotate()
      .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    const meta = await sharp(buf).metadata();
    const beforeKb = statSync(srcPath).size / 1024;
    beforeTotal += beforeKb;
    afterTotal += buf.length / 1024;

    if (DRY) {
      console.log(
        `DRY   ${row.storage_path} <- ${original}  ${meta.width}x${meta.height}  ${(buf.length / 1024).toFixed(0)}KB`,
      );
      done++;
      continue;
    }

    const res = await fetch(`${STORAGE_ORIGIN}/${ZONE}/${row.storage_path}`, {
      method: "PUT",
      headers: { AccessKey: KEY, "Content-Type": "application/octet-stream" },
      body: buf,
    });

    if (!res.ok) {
      console.error(`FAIL  ${row.storage_path} — ${res.status} ${res.statusText}`);
      continue;
    }

    console.log(
      `OK    ${row.storage_path}  ${meta.width}x${meta.height}  ${(buf.length / 1024).toFixed(0)}KB`,
    );
    done++;
  }

  console.log(
    `\n${DRY ? "Would re-encode" : "Re-encoded"} ${done} images` +
      (missing ? `, ${missing} skipped (no original)` : "") +
      `.\nNew total: ${(afterTotal / 1024).toFixed(1)}MB across the gallery.`,
  );
  if (!DRY && done) {
    console.log("Bunny caches at the edge — purge the pull zone to see the change immediately.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
