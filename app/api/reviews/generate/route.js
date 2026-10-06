/**
 * @file app/api/reviews/generate/route.js
 * Production API Route for generating customer reviews with Gemini AI.
 */

import { NextResponse } from "next/server";
import { reviewManagementService } from "@/lib/reviews/management/services/reviewManagementService";

export const dynamic = "force-dynamic";

/**
 * POST /api/reviews/generate
 * Body: { prompt: string, rating?: number, length?: string, tone?: string, language?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    if (!body?.prompt || !String(body.prompt).trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt or key bullet points are required" },
        { status: 400 }
      );
    }

    const text = await reviewManagementService.generateAiReview({
      prompt: body.prompt,
      rating: body.rating || 5,
      length: body.length,
      tone: body.tone,
      language: body.language,
    });

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate review" },
      { status: 500 }
    );
  }
}
