import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";

const builder = imageUrlBuilder(client);

/**
 * Returns a Sanity image URL builder scoped to the given source.
 * Chain .width(), .height(), .format(), .quality() etc. then call .url().
 *
 * @example
 *   <img src={urlFor(image).width(800).format("webp").url()} />
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
