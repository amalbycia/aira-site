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
      description: 'The shared brand name displayed across the site (e.g. "Aira / Agnitantra").',
      initialValue: "Aira",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description:
        'A short line that appears on the homepage (e.g. "Capturing moments, crafting memories").',
    }),
    defineField({
      name: "yearsOfExperience",
      title: "Years of Experience",
      type: "string",
      description: 'Displayed as a highlight on the site (e.g. "9+").',
      initialValue: "9+",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Your main logo. Used in the navigation bar and footer.",
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      description: "Contact email shown on the site.",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      description: "Contact phone number shown on the site.",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      description: "Full Instagram profile link.",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook URL",
      type: "url",
      description: "Full Facebook page link.",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      description: "Full YouTube channel link.",
    }),
    defineField({
      name: "locationPhotography",
      title: "Photography — Location Text",
      type: "string",
      description:
        'Location text for the Photography page (e.g. "Based in Chennai, available across South India").',
    }),
    defineField({
      name: "locationEvents",
      title: "Events — Location Text",
      type: "string",
      description: "Location text for the Events & Catering page.",
    }),
  ],
  preview: {
    select: { title: "businessName" },
  },
});
