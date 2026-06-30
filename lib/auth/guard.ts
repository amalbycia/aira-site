import { NextResponse } from "next/server";
import { isAuthenticated } from "./session";

/**
 * Returns null if the request is authenticated, or a 401 response if not.
 * Usage at the top of an admin API route:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAuthenticated()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
