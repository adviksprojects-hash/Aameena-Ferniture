/**
 * @file app/api/reviews/route.js
 * Production API Route for Listing Reviews (GET) and Submitting Customer Reviews (POST).
 */

import { NextResponse } from "next/server";
import { reviewManagementService } from "@/lib/reviews/management/services/reviewManagementService";

export const dynamic = "force-dynamic";

/**
 * GET /api/reviews
 * Query parameters:
 *  - status: PENDING | APPROVED | REJECTED | SPAM | REPORTED | ARCHIVED
 *  - page: number (default 1)
 *  - limit: number (default 10)
 *  - search: string
 *  - rating: 1-5
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search") || undefined;
    const ratingParam = searchParams.get("rating");
    const rating = ratingParam ? parseInt(ratingParam, 10) : undefined;

    const result = await reviewManagementService.getReviews({
      status,
      page,
      limit,
      search,
      rating,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[GET /api/reviews] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Submit a customer review.
 * Enforces minimal required fields (reviewerName, rating, reviewText).
 * Runs automated Gemini moderation, duplicate detection, and persists review.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const result = await reviewManagementService.submitReview(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        review: result.review,
        duplicateWarning: result.duplicateWarning,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/reviews] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
