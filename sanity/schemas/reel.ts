import { defineField, defineType } from "sanity";

export default defineType({
  name: "reel",
  title: "Reel / Video",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Video Title",
      type: "string",
      description: 'A short title for this reel (e.g. "Summer Wedding Highlights 2024").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bunnyVideoId",
      title: "Bunny Stream Video ID",
      type: "string",
      description:
        "The video ID from your Bunny Stream library (found in the Bunny dashboard URL). Example: a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Cover image shown before the video plays. Recommended: 16:9 ratio.",
    }),
    defineField({
      name: "page",
      title: "Belongs To",
      type: "string",
      description: "Which page should this reel appear on?",
      options: {
        list: [
          { title: "Aira Photography", value: "photography" },
          { title: "Agnitantra Events & Catering", value: "events" },
          { title: "Both Pages", value: "both" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", media: "thumbnail" },
  },
});
