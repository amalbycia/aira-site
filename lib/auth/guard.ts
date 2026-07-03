import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Returns null if the request is authenticated via Clerk, or a 401 response if
 * not. Auth for /manage is handled by Clerk (see ADMIN-CONSOLE.md) — access is
 * "being a user in the Clerk dashboard". Usage at the top of an admin API route:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 *
 * Note: proxy.ts (clerkMiddleware) already protects /api/admin(*) at the edge;
 * this is defense-in-depth so each mutating route independently refuses
 * unauthenticated calls.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
