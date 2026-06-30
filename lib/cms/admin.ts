import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

/**
 * Admin-side data access (raw rows with ids, both brands). Kept separate from
 * the public lib/cms read functions, which return display-shaped data only.
 * All callers are guarded by the admin session — never import into public pages.
 */

export type PageBrand = "photography" | "events";
export type ContentScope = "photography" | "events" | "both";

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

// ── Admin users (email + password accounts) ──────────────────────────────────

export type AdminUserRow = {
  id: number;
  email: string;
  created_at: string;
};

/** Max number of admin accounts allowed. */
export const MAX_ADMIN_USERS = 4;

/** List all admin users (no password hashes). Newest first. */
export async function listAdminUsers(): Promise<AdminUserRow[]> {
  return (await sql`
    select id, email, created_at from admin_users
    order by created_at asc, id asc
  `) as AdminUserRow[];
}

export async function countAdminUsers(): Promise<number> {
  const rows = (await sql`select count(*)::int as n from admin_users`) as { n: number }[];
  return rows[0]?.n ?? 0;
}

/** True if an account exists for this email (case-insensitive). */
export async function adminUserExists(email: string): Promise<boolean> {
  const rows = (await sql`
    select 1 from admin_users where lower(email) = lower(${email}) limit 1
  `) as unknown[];
  return rows.length > 0;
}

/**
 * Create an admin user. Throws "limit" if at capacity, "exists" if the email is
 * taken. Caller should enforce the guard and surface a friendly message.
 */
export async function createAdminUser(
  email: string,
  password: string,
): Promise<AdminUserRow> {
  if ((await countAdminUsers()) >= MAX_ADMIN_USERS) throw new Error("limit");
  if (await adminUserExists(email)) throw new Error("exists");
  const rows = (await sql`
    insert into admin_users (email, password_hash)
    values (${email.trim()}, ${hashPassword(password)})
    returning id, email, created_at
  `) as AdminUserRow[];
  return rows[0];
}

/** Update an existing user's password. */
export async function setAdminUserPassword(
  id: number,
  password: string,
): Promise<void> {
  await sql`update admin_users set password_hash = ${hashPassword(password)} where id = ${id}`;
}

export async function deleteAdminUser(id: number): Promise<void> {
  await sql`delete from admin_users where id = ${id}`;
}

/**
 * Verify an email + password against the admin_users table. Returns the matching
 * email (normalized) on success, or null. Always runs a hash comparison even when
 * the user is missing, to avoid leaking which emails exist via timing.
 */
export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<string | null> {
  const rows = (await sql`
    select email, password_hash from admin_users where lower(email) = lower(${email}) limit 1
  `) as { email: string; password_hash: string }[];
  const row = rows[0];
  // Dummy hash keeps timing roughly constant when the email doesn't exist.
  const stored =
    row?.password_hash ??
    "scrypt$16384$00000000000000000000000000000000$00";
  const ok = verifyPassword(password, stored);
  return ok && row ? row.email : null;
}

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

export async function listReels(): Promise<ReelRow[]> {
  return (await sql`
    select id, page, bunny_video_id, title, thumbnail_url, sort_order
    from reels order by sort_order asc, id asc
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

export async function listReviews(): Promise<ReviewRow[]> {
  return (await sql`
    select id, page, reviewer_name, rating, review_text, review_date, sort_order
    from reviews order by review_date desc nulls last, sort_order asc, id desc
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
