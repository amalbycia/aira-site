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
      description:
        'A short title for this reel (e.g. "Riya & Arjun — Wedding Highlights"). Shown as the caption on the card.',
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
      title: "Cover Image (optional)",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional cover picture shown before the video plays. Reels are tall (portrait), so use a vertical image. Leave blank and we'll use a frame from your video automatically.",
    }),
    defineField({
      name: "page",
      title: "Show this reel on…",
      type: "string",
      description:
        'Choose which page(s) this reel appears on. Pick "Both Pages" if you\'re unsure — it will show everywhere.',
      initialValue: "both",
      options: {
        list: [
          { title: "Aira Photography only", value: "photography" },
          { title: "Agnitantra Events & Caterers only", value: "events" },
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
