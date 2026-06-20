import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { schemaTypes } from "./schemas";
import { structure, SINGLETON_IDS, SINGLETON_TYPES } from "./structure";

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  name: "aira",
  title: "Aira Photography & Events",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",

  plugins: [
    // Custom left-menu structure (clean, named admin panel for the client).
    structureTool({ structure }),
    // Vision = a raw GROQ query console. Useful for the developer, confusing
    // for the client — only show it while developing locally.
    ...(isDev ? [visionTool()] : []),
  ],

  schema: {
    types: schemaTypes,

    // Hide the singleton page templates from the global "＋ Create" menu so the
    // client can only ever edit the existing Photography/Events/Settings docs,
    // never spawn duplicates. Reels and Reviews remain freely creatable.
    templates: (templates) =>
      templates.filter(
        (template) =>
          !SINGLETON_TYPES.has(template.schemaType) &&
          template.schemaType !== "page",
      ),
  },

  document: {
    // For singleton documents, strip the destructive/duplicating actions so the
    // client sees only Publish/Unpublish — there's always exactly one of each.
    actions: (input, context) =>
      SINGLETON_IDS.includes(context.documentId ?? "") ||
      SINGLETON_TYPES.has(context.schemaType)
        ? input.filter(
            ({ action }) =>
              action !== "delete" &&
              action !== "duplicate" &&
              action !== "unpublish",
          )
        : input,
  },
});
