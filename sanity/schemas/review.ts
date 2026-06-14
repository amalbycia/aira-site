import { defineField, defineType } from "sanity";

export default defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({
      name: "reviewerName",
      title: "Reviewer Name",
      type: "string",
      description: "Full name of the person who left the review.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rating",
      title: "Star Rating",
      type: "number",
      description: "Rating out of 5.",
      options: {
        list: [1, 2, 3, 4, 5],
      },
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: "reviewText",
      title: "Review Text",
      type: "text",
      description: "What the reviewer said.",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Review Date",
      type: "date",
      description: "When this review was written.",
    }),
    defineField({
      name: "page",
      title: "Belongs To",
      type: "string",
      description: "Which page should this review appear on?",
      options: {
        list: [
          { title: "Aira Photography", value: "photography" },
          { title: "Agnitantra Events & Catering", value: "events" },
          { title: "Both Pages", value: "both" },
        ],
        layout: "radio",
      },
    }),
  ],
  preview: {
    select: { title: "reviewerName", subtitle: "rating" },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? `${"★".repeat(subtitle)} (${subtitle}/5)` : "No rating",
      };
    },
  },
});
