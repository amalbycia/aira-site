/**
 * One-off: optimize 4 randomly-chosen wedding photos into local images for the
 * homepage "about us" section boxes (AboutSection.tsx).
 *
 * Each box has a different aspect ratio, so each tile is cropped to roughly
 * match its box — minimal further cropping by object-fit: cover at render.
 * WebP q80, smart-crop (position: attention).
 *
 * Output: public/images/about-1..4.webp
 */
import sharp from "sharp";
import { join } from "node:path";

const SRC_DIR = "C:/Users/alkes/Downloads/000-20260620T085903Z-3-001/000";
const OUT_DIR =
  "c:/Users/alkes/OneDrive/Websites/Agnitantra Events/aira-site/public/images";
const QUALITY = 80;

// [source file, width, height] — dims mirror each box's aspect ratio (2x of em
// box size for retina crispness; 13em ≈ 208px → 416px).
const TILES = [
  ["FOX05930.jpg", 520, 520], // box 1: 13 x 13 square
  ["ASW01634.jpg", 600, 680], // box 2: 15 x 17 portrait
  ["DSC08461.jpg", 540, 760], // box 3: 13.5 x 19 tall portrait
  ["FOX00618.jpg", 520, 360], // box 4: 13 x 9 landscape
];

async function main() {
  for (let i = 0; i < TILES.length; i++) {
    const [file, w, h] = TILES[i];
    const out = join(OUT_DIR, `about-${i + 1}.webp`);
    const info = await sharp(join(SRC_DIR, file))
      .rotate() // honor EXIF orientation
      .resize(w, h, { fit: "cover", position: "attention" })
      .webp({ quality: QUALITY })
      .toFile(out);
    console.log(
      `about-${i + 1}.webp  ← ${file}  ${w}x${h}  (${Math.round(info.size / 1024)} KB)`,
    );
  }
  console.log("\nDone. 4 about tiles written to public/images/.");
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
