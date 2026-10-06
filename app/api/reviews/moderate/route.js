/**
 * @file app/api/reviews/moderate/route.js
 * Production API Route for automated AI content moderation audit.
 */

import { NextResponse } from "next/server";
import { reviewManagementService } from "@/lib/reviews/management/services/reviewManagementService";

export const dynamic = "force-dynamic";

/**
 * POST /api/reviews/moderate
 * Body: { text: string, reviewerName?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    if (!body?.text || !String(body.text).trim()) {
      return NextResponse.json(
        { success: false, error: "Text is required for moderation audit" },
        { status: 400 }
      );
    }

    const moderation = await reviewManagementService.moderateContent({
      text: body.text,
      reviewerName: body.reviewerName || "Visitor",
    });

    return NextResponse.json({
      success: true,
      moderation,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Moderation check failed" },
      { status: 500 }
    );
  }
}
