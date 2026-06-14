import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim())),
);

const client = createClient({
  projectId: env["NEXT_PUBLIC_SANITY_PROJECT_ID"],
  dataset: env["NEXT_PUBLIC_SANITY_DATASET"] ?? "production",
  apiVersion: "2024-01-01",
  token: env["SANITY_API_TOKEN"],
  useCdn: false,
});

// Fix the events page title in Sanity
const eventsId = await client.fetch(`*[_type == "page" && brand == "events"][0]._id`);
if (eventsId) {
  await client.patch(eventsId).set({ locationText: "Based in India — available nationwide." }).commit();
  console.log("✅ Events page updated");
} else {
  console.log("❌ Events page not found");
}

console.log("🎉 Done — brand names are controlled by the schema labels, not the document data.");
console.log('   The "Aira Events & Catering" label in the Studio will update after the schema fix.');
