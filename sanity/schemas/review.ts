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
      description: "Name of the person who left the review (as shown on the card).",
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
      description: "What the reviewer said (you can paste it straight from Google).",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Review Date",
      type: "date",
      description: "Roughly when this review was written. Shown on the review card.",
    }),
    defineField({
      name: "page",
      title: "Show this review on…",
      type: "string",
      description:
        'Which page(s) this review appears on. Pick "Both Pages" if unsure.',
      initialValue: "both",
      options: {
        list: [
          { title: "Aira Photography only", value: "photography" },
          { title: "Agnitantra Events & Caterers only", value: "events" },
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
