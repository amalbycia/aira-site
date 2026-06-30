import { neon } from "@neondatabase/serverless";

/**
 * Neon Postgres client (HTTP driver — serverless-friendly, no pooling needed).
 *
 * `sql` is a tagged-template query function:
 *   const rows = await sql`select * from reviews where page = ${brand}`;
 * Values interpolated via ${} are sent as parameters (safe from SQL injection).
 *
 * The connection string lives in DATABASE_URI (.env.local / Vercel env).
 */
const connectionString = process.env.DATABASE_URI;

if (!connectionString) {
  // Surface a clear message at import time rather than a cryptic driver error.
  // (Pages fall back to placeholder content when the DB is unconfigured.)
  console.warn("[db] DATABASE_URI is not set — content queries will fail.");
}

export const sql = neon(connectionString ?? "");

/** True when a database connection string is configured. */
export const hasDb = () => Boolean(connectionString);
