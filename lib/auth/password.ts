import crypto from "node:crypto";

/**
 * Password hashing with Node's built-in scrypt — no native module, no extra
 * dependency (bcrypt needs a native build that's awkward on Node 24 / Vercel).
 *
 * Stored format: `scrypt$<N>$<saltHex>$<hashHex>`. The cost parameter and salt
 * are embedded so verification is self-describing and we can raise the cost in
 * future without breaking old hashes.
 */

const COST = 16384; // scrypt N (CPU/memory cost). 2^14 — solid for a login.
const KEYLEN = 64;
const SALT_BYTES = 16;

/** Hash a plaintext password. Returns the encoded string to store in the DB. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES);
  const hash = crypto.scryptSync(password, salt, KEYLEN, { N: COST });
  return `scrypt$${COST}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/** Constant-time verify a plaintext password against a stored encoded hash. */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, nStr, saltHex, hashHex] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const N = Number(nStr);
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    if (!N || salt.length === 0 || expected.length === 0) return false;
    const actual = crypto.scryptSync(password, salt, expected.length, { N });
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
