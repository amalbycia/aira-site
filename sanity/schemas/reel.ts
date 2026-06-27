import { defineField, defineType } from "sanity";
import { BunnyVideoUpload } from "../components/BunnyVideoUpload";

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
      title: "Reel Video",
      type: "string",
      description:
        "Upload your video here. It uploads securely and starts playing on the site automatically once it finishes processing (a few minutes).",
      components: { input: BunnyVideoUpload },
      validation: (Rule) =>
        Rule.required().error("Please upload a video for this reel."),
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
