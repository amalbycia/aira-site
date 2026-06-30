import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getSettingsRow, updateSettings, type SettingsRow } from "@/lib/cms/admin";

export const runtime = "nodejs";

/** GET /api/admin/settings — current site settings. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ settings: await getSettingsRow() });
}

/** PUT /api/admin/settings — save site settings. */
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const b = (await req.json().catch(() => ({}))) as Partial<SettingsRow>;
  const clean = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  await updateSettings({
    business_name: clean(b.business_name),
    tagline: clean(b.tagline),
    years_of_experience: clean(b.years_of_experience),
    email: clean(b.email),
    phone: clean(b.phone),
    instagram_url: clean(b.instagram_url),
    facebook_url: clean(b.facebook_url),
    youtube_url: clean(b.youtube_url),
    location_photography: clean(b.location_photography),
    location_events: clean(b.location_events),
  });
  return NextResponse.json({ ok: true });
}
