import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { listReviews, addReview, type ContentScope } from "@/lib/cms/admin";

export const runtime = "nodejs";

const isScope = (v: unknown): v is ContentScope =>
  v === "photography" || v === "events" || v === "both";

/** GET /api/admin/reviews — list all reviews. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ reviews: await listReviews() });
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
  const review = await addReview({
    page: isScope(b.page) ? b.page : "both",
    reviewerName: b.reviewerName,
    rating: Math.min(5, Math.max(1, Number(b.rating) || 5)),
    reviewText: b.reviewText,
    reviewDate: b.reviewDate,
  });
  return NextResponse.json({ ok: true, review });
}
