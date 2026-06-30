import { defineField, defineType } from "sanity";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      // Hidden from the client: which page this is, is already determined by
      // which menu item they opened (the document's fixed id). We keep the
      // field only to label the document and for any brand-based filtering.
      name: "brand",
      title: "Which page is this?",
      type: "string",
      options: {
        list: [
          { title: "Aira Photography", value: "photography" },
          { title: "Agnitantra Events & Catering", value: "events" },
        ],
        layout: "radio",
      },
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "description",
      title: "Page Description",
      type: "text",
      description:
        "A short paragraph introducing this page (what this service is about). Shown near the top of the page.",
      rows: 3,
    }),
    defineField({
      name: "locationText",
      title: "Location text",
      type: "string",
      description:
        'A line describing where you work, shown in this page\'s Location section (e.g. "Based in Kottayam, Kerala — available across India").',
    }),
    defineField({
      name: "gallery",
      title: "Photo Gallery",
      type: "array",
      description:
        "Your photos for this page's gallery. Click 'Add item' to upload — drag to reorder. Add as many as you like.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Photo description",
              type: "string",
              description:
                'A few words describing the photo (helps Google and screen-readers), e.g. "Bride and groom at sunset".',
            }),
            defineField({
              name: "caption",
              title: "Caption (optional)",
              type: "string",
              description: "Optional short caption shown with the photo.",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "reels",
      title: "Videos / Reels",
      type: "array",
      description:
        "The reels shown on this page. Click 'Add item' to pick from your uploaded reels (create new ones under 'Reels & Videos' in the left menu). Tip: a reel set to 'Both Pages' shows here automatically.",
      of: [{ type: "reference", to: [{ type: "reel" }] }],
    }),
    defineField({
      name: "googleReviewsEmbedCode",
      title: "Google Reviews — advanced embed (optional, usually leave blank)",
      type: "text",
      description:
        "ADVANCED: only for pasting a third-party Google Reviews widget code. Your site already shows your live Google rating and your best reviews automatically, so you normally do NOT need to touch this.",
      rows: 3,
    }),
    defineField({
      name: "manualReviews",
      title: "Featured Reviews (optional override)",
      type: "array",
      description:
        "OPTIONAL: hand-pick specific reviews to feature on this page. If left empty, the site automatically shows all reviews marked for this page (managed under 'Reviews' in the left menu).",
      of: [{ type: "reference", to: [{ type: "review" }] }],
    }),
  ],
  preview: {
    select: { title: "brand" },
    prepare({ title }) {
      return {
        title:
          title === "photography"
            ? "Aira Photography"
            : "Agnitantra Events & Caterers",
      };
    },
  },
});
