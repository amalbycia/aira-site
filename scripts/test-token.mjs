import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "2udpjtjj",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "sk5yrpamDpQ9Fu4LI1QxECklubUrBiLls79FSrB5QgdSEEp6lYLvAVH9l8wJb7W0Z3goZapf5Cglloq4N4v3PlVHbfVlGJp0cNta6q5YukycVPtPWn4t2wfLJsdIIZ8AOScWNmtwLhw3uSZYrLe1X4YKyIytlL3B3ZffmDB19lUMKpD0cJWq",
  useCdn: false,
});

try {
  const result = await client.fetch('*[_type == "siteSettings"][0]._id');
  console.log("✅ Token works. Query result:", result);
} catch (e) {
  console.error("❌ Error:", e.message);
  console.error("Status:", e.statusCode);
}
