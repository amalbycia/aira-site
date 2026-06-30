import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",

  // Singleton — only one document of this type should exist.
  // The Studio will show this as a single editable page.
  fields: [
    defineField({
      name: "businessName",
      title: "Business Name",
      type: "string",
      description:
        'Your brand name as shown across the site (e.g. "Agnitantra Events & Caterers / Aira Photography").',
      initialValue: "Agnitantra Events & Caterers",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description:
        'A short line that appears on the homepage (e.g. "Capturing moments, crafting celebrations").',
    }),
    defineField({
      name: "yearsOfExperience",
      title: "Years of Experience",
      type: "string",
      description:
        'Shown as a highlight on the site. Just the number with a plus, e.g. "9+".',
      initialValue: "9+",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description:
        "Your logo image (PNG with a transparent background works best). Used in the navigation bar and footer.",
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      description:
        "The email people can reach you at. Shown in the footer (tapping it opens the visitor's email app).",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      description:
        "Your contact number with country code, e.g. +91 98470 12345. Shown in the footer (tapping it starts a call on phones).",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram Link",
      type: "url",
      description:
        "Paste the full link to your Instagram profile (starts with https://). Find it via Instagram → your profile → Share Profile → Copy Link.",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook Link",
      type: "url",
      description: "Paste the full link to your Facebook page (starts with https://).",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube Link",
      type: "url",
      description: "Paste the full link to your YouTube channel (starts with https://).",
    }),
    defineField({
      name: "locationPhotography",
      title: "Location text — Photography page",
      type: "string",
      description:
        'A line describing where you work, shown on the Photography page (e.g. "Based in Kottayam, Kerala — available across India").',
    }),
    defineField({
      name: "locationEvents",
      title: "Location text — Events page",
      type: "string",
      description:
        'A line describing where you work, shown on the Events & Catering page (e.g. "Based in Kottayam, Kerala — serving events across the state and beyond").',
    }),
  ],
  preview: {
    select: { title: "businessName" },
  },
});
