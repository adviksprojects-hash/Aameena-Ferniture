/**
 * @file app/api/reviews/improve/route.js
 * Production API Route for refining review text (grammar, readability, translate, summarize, tone) with Gemini AI.
 */

import { NextResponse } from "next/server";
import { reviewManagementService } from "@/lib/reviews/management/services/reviewManagementService";

export const dynamic = "force-dynamic";

/**
 * POST /api/reviews/improve
 * Body: { text: string, action?: string, targetTone?: string, targetLanguage?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    if (!body?.text || !String(body.text).trim()) {
      return NextResponse.json(
        { success: false, error: "Review text is required for improvement" },
        { status: 400 }
      );
    }

    const text = await reviewManagementService.improveAiReview({
      text: body.text,
      action: body.action || "grammar",
      targetTone: body.targetTone,
      targetLanguage: body.targetLanguage,
    });

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to refine review" },
      { status: 500 }
    );
  }
}
