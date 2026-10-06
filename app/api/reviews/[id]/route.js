/**
 * @file app/api/reviews/[id]/route.js
 * Production API Route for Single Review retrieval (GET), status update (PATCH), and removal (DELETE).
 */

import { NextResponse } from "next/server";
import { reviewManagementService } from "@/lib/reviews/management/services/reviewManagementService";

export const dynamic = "force-dynamic";

/**
 * GET /api/reviews/:id
 */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    const review = await reviewManagementService.getReviewById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve review" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reviews/:id
 * Body: { status?: string, ownerReply?: string, reason?: string }
 */
export async function PATCH(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    const existing = await reviewManagementService.getReviewById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    let updated = null;

    if (body.ownerReply) {
      const res = await reviewManagementService.addOwnerReply(id, body.ownerReply);
      updated = res.review;
    }

    if (body.status) {
      const statusUpper = String(body.status).toUpperCase();
      if (statusUpper === "APPROVED") {
        const res = await reviewManagementService.approveReview(id);
        updated = res.review;
      } else if (statusUpper === "REJECTED") {
        const res = await reviewManagementService.rejectReview(id, body.reason || "Rejected by admin");
        updated = res.review;
      } else if (statusUpper === "ARCHIVED") {
        const res = await reviewManagementService.archiveReview(id);
        updated = res.review;
      } else if (statusUpper === "PENDING") {
        const res = await reviewManagementService.restoreReview(id);
        updated = res.review;
      }
    }

    return NextResponse.json({ success: true, review: updated || existing });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/:id
 */
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    const result = await reviewManagementService.deleteReview(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Review not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}
