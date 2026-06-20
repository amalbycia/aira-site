/**
 * One-off: optimize the wedding photos and upload them into the Sanity
 * `photographyPage` gallery, in filename order.
 *
 * Pipeline per image: sharp → auto-rotate (honor EXIF) → resize to max 2000px
 * long edge → WebP q82 → upload as a Sanity image asset → collect into a
 * gallery[] array → patch photographyPage.gallery in one atomic set.
 *
 * Idempotent: re-running re-uploads and REPLACES the gallery (set, not append)
 * so you never get duplicates. Writes a manifest to scripts/.upload-manifest.json.
 *
 * Usage:
 *   node scripts/upload-photography-gallery.mjs            # first LIMIT images
 *   LIMIT=40 node scripts/upload-photography-gallery.mjs
 */
import { createClient } from "@sanity/client";
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const SRC_DIR =
  "C:/Users/alkes/Downloads/000-20260620T085903Z-3-001/000";
const LIMIT = Number(process.env.LIMIT ?? 40);
const MAX_EDGE = 2000;
const WEBP_QUALITY = 82;
const PAGE_ID = "photographyPage";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

if (!process.env.SANITY_API_TOKEN) {
  console.error("Missing SANITY_API_TOKEN in .env.local");
  process.exit(1);
}

// Turn "DSC06074.jpg" into a tidy alt fallback. Real captions can be edited in
// Studio later; this just gives accessible, non-empty alt text now.
function altFromFilename(name) {
  return `Aira Photography — ${name.replace(/\.[^.]+$/, "")}`;
}

async function main() {
  const all = readdirSync(SRC_DIR)
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const selected = all.slice(0, LIMIT);
  console.log(
    `Found ${all.length} images; uploading first ${selected.length} in order.\n`,
  );

  const galleryItems = [];
  const manifest = { uploaded: [], skipped: [], all: all };

  for (let i = 0; i < selected.length; i++) {
    const filename = selected[i];
    const srcPath = join(SRC_DIR, filename);
    const label = `[${String(i + 1).padStart(2, "0")}/${selected.length}] ${filename}`;

    try {
      const buf = await sharp(srcPath)
        .rotate() // honor EXIF orientation
        .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      const asset = await client.assets.upload("image", buf, {
        filename: filename.replace(/\.[^.]+$/, ".webp"),
        contentType: "image/webp",
      });

      galleryItems.push({
        _type: "image",
        _key: `g${i}_${asset._id.slice(-6)}`,
        asset: { _type: "reference", _ref: asset._id },
        alt: altFromFilename(filename),
      });

      const kb = Math.round(buf.length / 1024);
      console.log(`${label} → ${asset._id} (${kb} KB)`);
      manifest.uploaded.push({ order: i + 1, filename, assetId: asset._id, sizeKB: kb });
    } catch (err) {
      console.error(`${label} → FAILED: ${err.message}`);
      manifest.skipped.push({ order: i + 1, filename, error: err.message });
    }
  }

  // Record which of the full set were NOT uploaded (beyond LIMIT).
  manifest.notUploaded = all.slice(selected.length).map((filename, idx) => ({
    order: selected.length + idx + 1,
    filename,
  }));

  // Atomic: replace the whole gallery so re-runs don't duplicate.
  await client
    .patch(PAGE_ID)
    .set({ gallery: galleryItems })
    .commit();

  writeFileSync(
    "scripts/.upload-manifest.json",
    JSON.stringify(manifest, null, 2),
  );

  console.log(
    `\nDone. ${manifest.uploaded.length} uploaded, ${manifest.skipped.length} failed, ` +
      `${manifest.notUploaded.length} left for later.`,
  );
  console.log("Gallery set on photographyPage. Manifest → scripts/.upload-manifest.json");
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
