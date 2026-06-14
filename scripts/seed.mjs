import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env.local manually
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim())),
);

const projectId = env["NEXT_PUBLIC_SANITY_PROJECT_ID"];
const token = env["SANITY_API_TOKEN"];

if (!projectId) {
  console.error("❌  NEXT_PUBLIC_SANITY_PROJECT_ID missing from .env.local");
  process.exit(1);
}
if (!token) {
  console.error(
    "❌  SANITY_API_TOKEN missing from .env.local\n" +
    "    Create one at: https://sanity.io/manage → your project → API → Tokens → Add token (Editor role)\n" +
    "    Then paste it into .env.local as SANITY_API_TOKEN=your_token_here",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset: env["NEXT_PUBLIC_SANITY_DATASET"] ?? "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function seed() {
  console.log(`\n🌱  Seeding Sanity project: ${projectId}\n`);

  // Site Settings (singleton — use a fixed _id so re-running is idempotent)
  const settings = await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    businessName: "Aira",
    tagline: "Capturing moments, crafting memories.",
    yearsOfExperience: "9+",
  });
  console.log("✅  Site Settings created:", settings._id);

  // Photography page
  const existing = await client.fetch(
    `*[_type == "page" && brand == $brand][0]._id`,
    { brand: "photography" },
  );
  if (existing) {
    console.log("ℹ️   Photography page already exists — skipping");
  } else {
    const photo = await client.create({
      _type: "page",
      brand: "photography",
      locationText: "Based in India — available nationwide.",
    });
    console.log("✅  Photography page created:", photo._id);
  }

  // Events page
  const existingEvents = await client.fetch(
    `*[_type == "page" && brand == $brand][0]._id`,
    { brand: "events" },
  );
  if (existingEvents) {
    console.log("ℹ️   Events page already exists — skipping");
  } else {
    const events = await client.create({
      _type: "page",
      brand: "events",
      locationText: "Based in India — available nationwide.",
    });
    console.log("✅  Events & Catering page created:", events._id);
  }

  console.log("\n🎉  Done. Open /studio to verify and fill in remaining fields.\n");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
