/**
 * One-off: create the admin_users table in Neon.
 * Run once: `node --env-file=.env.local scripts/create-admin-users-table.mjs`
 * Idempotent (IF NOT EXISTS), safe to re-run.
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URI);

await sql`
  create table if not exists admin_users (
    id            serial primary key,
    email         text not null unique,
    password_hash text not null,
    created_at    timestamptz not null default now()
  )
`;
// Case-insensitive uniqueness on email (so Owner@x.com == owner@x.com).
await sql`create unique index if not exists admin_users_email_lower_idx on admin_users (lower(email))`;

const rows = await sql`select count(*)::int as n from admin_users`;
console.log(`admin_users ready. Existing users: ${rows[0].n}`);
