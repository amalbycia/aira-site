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
        "A short description shown on this page (e.g. what the service is about).",
      rows: 3,
    }),
    defineField({
      name: "locationText",
      title: "Location",
      type: "string",
      description:
        'Written location text displayed on the page (e.g. "Based in Mumbai, serving all of India").',
    }),
    defineField({
      name: "gallery",
      title: "Photo Gallery",
      type: "array",
      description: "Upload photos to display in the gallery section.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              description:
                'Describe the photo for accessibility and SEO (e.g. "Bride and groom at sunset").',
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              description: "Optional caption shown below the photo.",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "reels",
      title: "Videos / Reels",
      type: "array",
      description: "Link video reels to display on this page.",
      of: [{ type: "reference", to: [{ type: "reel" }] }],
    }),
    defineField({
      name: "googleReviewsEmbedCode",
      title: "Google Reviews Embed Code",
      type: "text",
      description:
        "Paste the full embed code from your Google Reviews widget here. Leave blank if using manually entered reviews instead.",
      rows: 4,
    }),
    defineField({
      name: "manualReviews",
      title: "Manual Reviews",
      type: "array",
      description:
        "Add reviews manually if you are not using the Google embed. Each review will display as a card.",
      of: [{ type: "reference", to: [{ type: "review" }] }],
    }),
  ],
  preview: {
    select: { title: "brand" },
    prepare({ title }) {
      return {
        title: title === "photography" ? "Aira Photography" : "Agnitantra Events & Catering",
      };
    },
  },
});
