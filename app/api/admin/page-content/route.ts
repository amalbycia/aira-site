import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import {
  getPageContent,
  updatePageContent,
  type PageContentRow,
  type ContentScope,
} from "@/lib/cms/admin";

export const runtime = "nodejs";

const isScope = (v: unknown): v is ContentScope =>
  v === "photography" || v === "events";

/** Empty strings are stored as NULL so the site falls back to its defaults. */
const norm = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
};

/** GET /api/admin/page-content?page=photography|events */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const page = req.nextUrl.searchParams.get("page");
  if (!isScope(page)) {
    return NextResponse.json(
      { error: "page must be photography or events" },
      { status: 400 },
    );
  }
  return NextResponse.json({ content: await getPageContent(page) });
}

/** PUT /api/admin/page-content — save a page's editable copy. */
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!isScope(b.page)) {
    return NextResponse.json(
      { error: "page must be photography or events" },
      { status: 400 },
    );
  }

  const content: PageContentRow = {
    hero_eyebrow: norm(b.hero_eyebrow),
    hero_title: norm(b.hero_title),
    hero_subtitle: norm(b.hero_subtitle),
    intro_eyebrow: norm(b.intro_eyebrow),
    intro_heading: norm(b.intro_heading),
    intro_body: norm(b.intro_body),
    services_heading: norm(b.services_heading),
    menu_heading: norm(b.menu_heading),
    gallery_heading: norm(b.gallery_heading),
    reels_heading: norm(b.reels_heading),
    cta_label: norm(b.cta_label),
    cta_href: norm(b.cta_href),
    stat_1_value: norm(b.stat_1_value),
    stat_1_label: norm(b.stat_1_label),
    stat_2_value: norm(b.stat_2_value),
    stat_2_label: norm(b.stat_2_label),
    stat_3_value: norm(b.stat_3_value),
    stat_3_label: norm(b.stat_3_label),
  };

  await updatePageContent(b.page, content);
  return NextResponse.json({ ok: true });
}
