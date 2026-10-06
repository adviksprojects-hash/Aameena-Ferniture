/**
 * @file app/api/reviews/reject/route.js
 * Production API Route for rejecting single or bulk reviews.
 */

import { NextResponse } from "next/server";
import { reviewManagementService } from "@/lib/reviews/management/services/reviewManagementService";

export const dynamic = "force-dynamic";

/**
 * POST /api/reviews/reject
 * Body: { id?: string, ids?: string[], reason?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const reason = body?.reason || "Rejected by admin moderation";

    if (Array.isArray(body?.ids) && body.ids.length > 0) {
      const result = await reviewManagementService.bulkAction(body.ids, "REJECT");
      return NextResponse.json(result);
    }

    if (body?.id) {
      const result = await reviewManagementService.rejectReview(body.id, reason);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: "Review ID or array of IDs is required" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reject review" },
      { status: 500 }
    );
  }
}
