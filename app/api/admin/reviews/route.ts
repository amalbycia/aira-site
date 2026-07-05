import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { listReviews, addReview, type ContentScope } from "@/lib/cms/admin";

export const runtime = "nodejs";

const isScope = (v: unknown): v is ContentScope =>
  v === "photography" || v === "events";

/** GET /api/admin/reviews?page=photography|events — list a page's reviews. */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const page = req.nextUrl.searchParams.get("page");
  if (!isScope(page)) {
    return NextResponse.json({ error: "page must be photography or events" }, { status: 400 });
  }
  return NextResponse.json({ reviews: await listReviews(page) });
}

/** POST /api/admin/reviews — add a review. */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const b = (await req.json().catch(() => ({}))) as {
    reviewerName?: string;
    rating?: number;
    reviewText?: string;
    reviewDate?: string;
    page?: string;
  };
  if (!b.reviewerName || !b.reviewText) {
    return NextResponse.json(
      { error: "reviewerName and reviewText are required" },
      { status: 400 },
    );
  }
  if (!isScope(b.page)) {
    return NextResponse.json({ error: "page must be photography or events" }, { status: 400 });
  }
  const review = await addReview({
    page: b.page,
    reviewerName: b.reviewerName,
    rating: Math.min(5, Math.max(1, Number(b.rating) || 5)),
    reviewText: b.reviewText,
    reviewDate: b.reviewDate,
  });
  return NextResponse.json({ ok: true, review });
}
