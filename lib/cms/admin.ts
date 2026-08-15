import { sql } from "@/lib/db";

/**
 * Admin-side data access (raw rows with ids, both brands). Kept separate from
 * the public lib/cms read functions, which return display-shaped data only.
 * All callers are guarded by Clerk (see requireAdmin) — never import into public
 * pages. Admin USER accounts are managed in the Clerk dashboard, not here.
 */

export type PageBrand = "photography" | "events";
// Reels and reviews are now strictly per-page (the old "both" scope was retired
// in the admin split — see PLAN-ADMIN-REVAMP.md). ContentScope is kept as an
// alias of PageBrand so existing imports keep working.
export type ContentScope = PageBrand;

export type PhotoRow = {
  id: number;
  page: PageBrand;
  url: string;
  storage_path: string | null;
  alt: string | null;
  caption: string | null;
  sort_order: number;
};

export type ReelRow = {
  id: number;
  page: ContentScope;
  bunny_video_id: string;
  title: string | null;
  thumbnail_url: string | null;
  sort_order: number;
};

export type ReviewRow = {
  id: number;
  page: ContentScope;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string | null;
  sort_order: number;
};

// Admin user ACCOUNTS are managed in the Clerk dashboard now — the former
// admin_users table + password helpers were removed with the Clerk migration.

// ── Photos ───────────────────────────────────────────────────────────────────

export async function listPhotos(page: PageBrand): Promise<PhotoRow[]> {
  return (await sql`
    select id, page, url, storage_path, alt, caption, sort_order
    from gallery_photos where page = ${page}
    order by sort_order asc, id asc
  `) as PhotoRow[];
}

export async function addPhoto(args: {
  page: PageBrand;
  url: string;
  storagePath: string;
  alt?: string;
  caption?: string;
}): Promise<PhotoRow> {
  const next = (await sql`
    select coalesce(max(sort_order), -1) + 1 as n from gallery_photos where page = ${args.page}
  `) as { n: number }[];
  const rows = (await sql`
    insert into gallery_photos (page, url, storage_path, alt, caption, sort_order)
    values (${args.page}, ${args.url}, ${args.storagePath}, ${args.alt ?? null},
            ${args.caption ?? null}, ${next[0].n})
    returning id, page, url, storage_path, alt, caption, sort_order
  `) as PhotoRow[];
  return rows[0];
}

export async function deletePhoto(id: number): Promise<string | null> {
  const rows = (await sql`
    delete from gallery_photos where id = ${id} returning storage_path
  `) as { storage_path: string | null }[];
  return rows[0]?.storage_path ?? null;
}

/** Persist a new ordering (array of photo ids in desired order). */
export async function reorderPhotos(ids: number[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    await sql`update gallery_photos set sort_order = ${i} where id = ${ids[i]}`;
  }
}

// ── Reels ────────────────────────────────────────────────────────────────────

export async function listReels(page: PageBrand): Promise<ReelRow[]> {
  return (await sql`
    select id, page, bunny_video_id, title, thumbnail_url, sort_order
    from reels where page = ${page}
    order by sort_order asc, id asc
  `) as ReelRow[];
}

export async function addReel(args: {
  page: ContentScope;
  bunnyVideoId: string;
  title?: string;
}): Promise<ReelRow> {
  const next = (await sql`select coalesce(max(sort_order), -1) + 1 as n from reels`) as {
    n: number;
  }[];
  const rows = (await sql`
    insert into reels (page, bunny_video_id, title, sort_order)
    values (${args.page}, ${args.bunnyVideoId}, ${args.title ?? null}, ${next[0].n})
    returning id, page, bunny_video_id, title, thumbnail_url, sort_order
  `) as ReelRow[];
  return rows[0];
}

export async function deleteReel(id: number): Promise<string | null> {
  const rows = (await sql`
    delete from reels where id = ${id} returning bunny_video_id
  `) as { bunny_video_id: string }[];
  return rows[0]?.bunny_video_id ?? null;
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export async function listReviews(page: PageBrand): Promise<ReviewRow[]> {
  return (await sql`
    select id, page, reviewer_name, rating, review_text, review_date, sort_order
    from reviews where page = ${page}
    order by review_date desc nulls last, sort_order asc, id desc
  `) as ReviewRow[];
}

export async function addReview(args: {
  page: ContentScope;
  reviewerName: string;
  rating: number;
  reviewText: string;
  reviewDate?: string;
}): Promise<ReviewRow> {
  const rows = (await sql`
    insert into reviews (page, reviewer_name, rating, review_text, review_date)
    values (${args.page}, ${args.reviewerName}, ${args.rating}, ${args.reviewText},
            ${args.reviewDate || null})
    returning id, page, reviewer_name, rating, review_text, review_date, sort_order
  `) as ReviewRow[];
  return rows[0];
}

export async function updateReview(
  id: number,
  args: {
    page: ContentScope;
    reviewerName: string;
    rating: number;
    reviewText: string;
    reviewDate?: string;
  },
): Promise<void> {
  await sql`
    update reviews set
      page = ${args.page},
      reviewer_name = ${args.reviewerName},
      rating = ${args.rating},
      review_text = ${args.reviewText},
      review_date = ${args.reviewDate || null}
    where id = ${id}
  `;
}

export async function deleteReview(id: number): Promise<void> {
  await sql`delete from reviews where id = ${id}`;
}

// ── Catering menu (categories + dishes) ──────────────────────────────────────

export type MenuDishRow = {
  id: number;
  category_id: number;
  name: string;
  sort_order: number;
};

export type MenuCategoryRow = {
  id: number;
  label: string;
  sort_order: number;
  dishes: MenuDishRow[];
};

/**
 * Full menu (categories, each with its ordered dishes) for the admin editor.
 * Fails soft (returns []) if Neon is briefly unreachable so a transient DB
 * hiccup never crashes the whole /manage dashboard — the Events Menu tab just
 * shows empty and the owner can retry by reloading.
 */
export async function listMenu(): Promise<MenuCategoryRow[]> {
  try {
    const [cats, dishes] = (await Promise.all([
      sql`select id, label, sort_order from menu_categories order by sort_order asc, id asc`,
      sql`select id, category_id, name, sort_order from menu_dishes order by sort_order asc, id asc`,
    ])) as [Omit<MenuCategoryRow, "dishes">[], MenuDishRow[]];

    return cats.map((c) => ({
      ...c,
      dishes: dishes.filter((d) => d.category_id === c.id),
    }));
  } catch (err) {
    console.error("[listMenu] query failed:", err);
    return [];
  }
}

export async function addMenuCategory(label: string): Promise<MenuCategoryRow> {
  const next = (await sql`
    select coalesce(max(sort_order), -1) + 1 as n from menu_categories
  `) as { n: number }[];
  const rows = (await sql`
    insert into menu_categories (label, sort_order)
    values (${label.trim()}, ${next[0].n})
    returning id, label, sort_order
  `) as Omit<MenuCategoryRow, "dishes">[];
  return { ...rows[0], dishes: [] };
}

export async function renameMenuCategory(id: number, label: string): Promise<void> {
  await sql`update menu_categories set label = ${label.trim()} where id = ${id}`;
}

/** Deletes a category and (via ON DELETE CASCADE) all its dishes. */
export async function deleteMenuCategory(id: number): Promise<void> {
  await sql`delete from menu_categories where id = ${id}`;
}

export async function reorderMenuCategories(ids: number[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    await sql`update menu_categories set sort_order = ${i} where id = ${ids[i]}`;
  }
}

export async function addMenuDish(
  categoryId: number,
  name: string,
): Promise<MenuDishRow> {
  const next = (await sql`
    select coalesce(max(sort_order), -1) + 1 as n
    from menu_dishes where category_id = ${categoryId}
  `) as { n: number }[];
  const rows = (await sql`
    insert into menu_dishes (category_id, name, sort_order)
    values (${categoryId}, ${name.trim()}, ${next[0].n})
    returning id, category_id, name, sort_order
  `) as MenuDishRow[];
  return rows[0];
}

export async function renameMenuDish(id: number, name: string): Promise<void> {
  await sql`update menu_dishes set name = ${name.trim()} where id = ${id}`;
}

export async function deleteMenuDish(id: number): Promise<void> {
  await sql`delete from menu_dishes where id = ${id}`;
}

export async function reorderMenuDishes(ids: number[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    await sql`update menu_dishes set sort_order = ${i} where id = ${ids[i]}`;
  }
}

// ── Settings ─────────────────────────────────────────────────────────────────

export type SettingsRow = {
  business_name: string | null;
  tagline: string | null;
  years_of_experience: string | null;
  email: string | null;
  phone: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  location_photography: string | null;
  location_events: string | null;
};

export async function getSettingsRow(): Promise<SettingsRow | null> {
  const rows = (await sql`
    select business_name, tagline, years_of_experience, email, phone,
           instagram_url, facebook_url, youtube_url,
           location_photography, location_events
    from site_settings where id = 1
  `) as SettingsRow[];
  return rows[0] ?? null;
}

export async function updateSettings(s: SettingsRow): Promise<void> {
  await sql`
    insert into site_settings (id, business_name, tagline, years_of_experience,
      email, phone, instagram_url, facebook_url, youtube_url,
      location_photography, location_events)
    values (1, ${s.business_name}, ${s.tagline}, ${s.years_of_experience},
      ${s.email}, ${s.phone}, ${s.instagram_url}, ${s.facebook_url}, ${s.youtube_url},
      ${s.location_photography}, ${s.location_events})
    on conflict (id) do update set
      business_name = excluded.business_name,
      tagline = excluded.tagline,
      years_of_experience = excluded.years_of_experience,
      email = excluded.email,
      phone = excluded.phone,
      instagram_url = excluded.instagram_url,
      facebook_url = excluded.facebook_url,
      youtube_url = excluded.youtube_url,
      location_photography = excluded.location_photography,
      location_events = excluded.location_events,
      updated_at = now()
  `;
}

// ── Page content (owner-editable copy per page) ──────────────────────────────

/**
 * Editable copy for a brand page. Every field is nullable — when null the site
 * falls back to its built-in default, so a blank field never blanks the page.
 */
export type PageContentRow = {
  hero_eyebrow: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  intro_eyebrow: string | null;
  intro_heading: string | null;
  intro_body: string | null;
  services_heading: string | null;
  menu_heading: string | null;
  gallery_heading: string | null;
  reels_heading: string | null;
  cta_label: string | null;
  cta_href: string | null;
  stat_1_value: string | null;
  stat_1_label: string | null;
  stat_2_value: string | null;
  stat_2_label: string | null;
  stat_3_value: string | null;
  stat_3_label: string | null;
};

export async function getPageContent(
  page: PageBrand,
): Promise<PageContentRow | null> {
  const rows = (await sql`
    select hero_eyebrow, hero_title, hero_subtitle,
           intro_eyebrow, intro_heading, intro_body,
           services_heading, menu_heading, gallery_heading, reels_heading,
           cta_label, cta_href,
           stat_1_value, stat_1_label,
           stat_2_value, stat_2_label,
           stat_3_value, stat_3_label
    from pages where slug = ${page}
  `) as PageContentRow[];
  return rows[0] ?? null;
}

export async function updatePageContent(
  page: PageBrand,
  c: PageContentRow,
): Promise<void> {
  await sql`
    insert into pages (slug, hero_eyebrow, hero_title, hero_subtitle,
      intro_eyebrow, intro_heading, intro_body,
      services_heading, menu_heading, gallery_heading, reels_heading,
      cta_label, cta_href,
      stat_1_value, stat_1_label, stat_2_value, stat_2_label,
      stat_3_value, stat_3_label)
    values (${page}, ${c.hero_eyebrow}, ${c.hero_title}, ${c.hero_subtitle},
      ${c.intro_eyebrow}, ${c.intro_heading}, ${c.intro_body},
      ${c.services_heading}, ${c.menu_heading}, ${c.gallery_heading}, ${c.reels_heading},
      ${c.cta_label}, ${c.cta_href},
      ${c.stat_1_value}, ${c.stat_1_label}, ${c.stat_2_value}, ${c.stat_2_label},
      ${c.stat_3_value}, ${c.stat_3_label})
    on conflict (slug) do update set
      hero_eyebrow = excluded.hero_eyebrow,
      hero_title = excluded.hero_title,
      hero_subtitle = excluded.hero_subtitle,
      intro_eyebrow = excluded.intro_eyebrow,
      intro_heading = excluded.intro_heading,
      intro_body = excluded.intro_body,
      services_heading = excluded.services_heading,
      menu_heading = excluded.menu_heading,
      gallery_heading = excluded.gallery_heading,
      reels_heading = excluded.reels_heading,
      cta_label = excluded.cta_label,
      cta_href = excluded.cta_href,
      stat_1_value = excluded.stat_1_value,
      stat_1_label = excluded.stat_1_label,
      stat_2_value = excluded.stat_2_value,
      stat_2_label = excluded.stat_2_label,
      stat_3_value = excluded.stat_3_value,
      stat_3_label = excluded.stat_3_label,
      updated_at = now()
  `;
}
