/**
 * @file app/api/reviews/approve/route.js
 * Production API Route for approving single or bulk reviews.
 */

import { NextResponse } from "next/server";
import { reviewManagementService } from "@/lib/reviews/management/services/reviewManagementService";

export const dynamic = "force-dynamic";

/**
 * POST /api/reviews/approve
 * Body: { id?: string, ids?: string[] }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    if (Array.isArray(body?.ids) && body.ids.length > 0) {
      const result = await reviewManagementService.bulkAction(body.ids, "APPROVE");
      return NextResponse.json(result);
    }

    if (body?.id) {
      const result = await reviewManagementService.approveReview(body.id);
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
      { success: false, error: error.message || "Failed to approve review" },
      { status: 500 }
    );
  }
}
