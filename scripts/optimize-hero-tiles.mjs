/**
 * One-off: optimize 4 randomly-chosen wedding photos into local hero-carousel
 * tile images for the homepage preloader (HeroPreloader.tsx).
 *
 * Tiles render small (~10em square, object-fit: cover), so a 800px square crop
 * is crisp on retina while staying tiny. WebP q80, center-cropped to square.
 *
 * Output: public/images/hero-tile-1..4.webp
 */
import sharp from "sharp";
import { join } from "node:path";

const SRC_DIR = "C:/Users/alkes/Downloads/000-20260620T085903Z-3-001/000";
const OUT_DIR =
  "c:/Users/alkes/OneDrive/Websites/Agnitantra Events/aira-site/public/images";

const FILES = ["DSC08033.jpg", "FOX01368.jpg", "ASK03541.jpg", "FOX00734.jpg"];
const SIZE = 800;
const QUALITY = 80;

async function main() {
  for (let i = 0; i < FILES.length; i++) {
    const src = join(SRC_DIR, FILES[i]);
    const out = join(OUT_DIR, `hero-tile-${i + 1}.webp`);
    const info = await sharp(src)
      .rotate() // honor EXIF orientation
      .resize(SIZE, SIZE, { fit: "cover", position: "attention" })
      .webp({ quality: QUALITY })
      .toFile(out);
    console.log(
      `hero-tile-${i + 1}.webp  ← ${FILES[i]}  (${Math.round(info.size / 1024)} KB)`,
    );
  }
  console.log("\nDone. 4 tiles written to public/images/.");
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
