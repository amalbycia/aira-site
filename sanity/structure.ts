import type { StructureResolver } from "sanity/structure";

/**
 * Custom Studio structure — the left-hand menu the client sees.
 *
 * Instead of the default flat list of document types ("Page", "Reel",
 * "Review", "Site Settings" — confusing for a non-technical user), this
 * presents a clean, named admin panel:
 *
 *   📷  Aira Photography     → opens straight into the one Photography page
 *   🎉  Agnitantra Events    → opens straight into the one Events page
 *   🎬  Reels & Videos       → the list of video reels
 *   ⭐  Reviews              → manual review cards
 *   ⚙️   Site Settings        → the one global settings document
 *
 * The two "page" documents and Site Settings are SINGLETONS — the client
 * edits them directly and can never create duplicates or land on an empty
 * "which document?" list. (Create/delete on those is also disabled in
 * sanity.config.ts so there's always exactly one of each.)
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Aira / Agnitantra")
    .items([
      // ── Photography page (singleton, opens directly into the editor) ──
      S.listItem()
        .title("Aira Photography")
        .id("photographyPage")
        .child(
          S.document()
            .schemaType("page")
            .documentId("photographyPage")
            .title("Aira Photography"),
        ),

      // ── Events page (singleton) ──
      S.listItem()
        .title("Agnitantra Events")
        .id("eventsPage")
        .child(
          S.document()
            .schemaType("page")
            .documentId("eventsPage")
            .title("Agnitantra Events"),
        ),

      S.divider(),

      // ── Reels: a normal list, but titled plainly for the client ──
      S.listItem()
        .title("Reels & Videos")
        .schemaType("reel")
        .child(S.documentTypeList("reel").title("Reels & Videos")),

      // ── Reviews ──
      S.listItem()
        .title("Reviews")
        .schemaType("review")
        .child(S.documentTypeList("review").title("Reviews")),

      S.divider(),

      // ── Site Settings (singleton) ──
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site Settings"),
        ),
    ]);

/** Document ids that are singletons — used to lock create/delete in config. */
export const SINGLETON_IDS = ["photographyPage", "eventsPage", "siteSettings"];

/** Schema types that should not show "create new" in global actions. */
export const SINGLETON_TYPES = new Set(["siteSettings"]);
