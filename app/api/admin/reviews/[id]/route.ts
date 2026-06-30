import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { updateReview, deleteReview, type ContentScope } from "@/lib/cms/admin";

export const runtime = "nodejs";

const isScope = (v: unknown): v is ContentScope =>
  v === "photography" || v === "events" || v === "both";

/** PUT /api/admin/reviews/[id] — edit a review. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const reviewId = Number(id);
  if (Number.isNaN(reviewId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

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
  await updateReview(reviewId, {
    page: isScope(b.page) ? b.page : "both",
    reviewerName: b.reviewerName,
    rating: Math.min(5, Math.max(1, Number(b.rating) || 5)),
    reviewText: b.reviewText,
    reviewDate: b.reviewDate,
  });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/reviews/[id] — remove a review. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const reviewId = Number(id);
  if (Number.isNaN(reviewId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await deleteReview(reviewId);
  return NextResponse.json({ ok: true });
}
