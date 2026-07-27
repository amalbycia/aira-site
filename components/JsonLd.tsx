/**
 * Renders one or more JSON-LD objects as <script type="application/ld+json">.
 * Server component (no "use client") so the markup is in the initial HTML —
 * crawlers and AI answer engines read it without executing JS.
 */
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Content is built from our own typed constants (lib/structuredData),
          // never user input, so this is safe.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
