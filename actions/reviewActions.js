"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";

/**
 * Fetch randomized review quotes directly from PostgreSQL database matching rating, experience, and product.
 * Zero dummy seed arrays; pure database queries only.
 */
export async function getReviewQuotes(filters = {}) {
  try {
    const { rating = 5, experienceType = "ALL", productPurchased = "" } = filters;
    const targetRating = Number(rating) || 5;

    const where = {};
    if (rating && Number(rating) > 0) {
      where.rating = Number(rating);
    }
    if (experienceType && experienceType !== "ALL") {
      where.experienceType = experienceType;
    }

    let quotes = await db.reviewQuote.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // If specific product filter provided, prioritize matching quotes
    if (productPurchased && productPurchased.trim() !== "") {
      const term = productPurchased.trim().toLowerCase();
      quotes = quotes.sort((a, b) => {
        const aMatch =
          (a.productPurchased && a.productPurchased.toLowerCase().includes(term)) ||
          a.quoteText.toLowerCase().includes(term);
        const bMatch =
          (b.productPurchased && b.productPurchased.toLowerCase().includes(term)) ||
          b.quoteText.toLowerCase().includes(term);
        return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
      });
    }

    // Shuffle quotes slightly for dynamic variety
    const shuffled = [...quotes].sort(() => 0.5 - Math.random());

    return {
      success: true,
      data: shuffled.slice(0, 12),
      totalCount: quotes.length,
    };
  } catch (error) {
    console.error("Error in getReviewQuotes:", error);
    return { success: true, data: [], totalCount: 0 };
  }
}

/**
 * Submit verified review with author validation and experience logging directly to PostgreSQL
 */
export async function submitVerifiedReview(data) {
  try {
    const {
      author,
      phone,
      rating = 5,
      reviewText,
      experienceType = "PURCHASED",
      productPurchased = "",
      locationName = "AMEENA Distributors’s Sofa Set Furniture Company (Solapur)",
      city = "Solapur",
      categoryName = "Living Room",
      language = "en",
    } = data;

    if (!author || author.trim().length < 2) {
      return { success: false, error: "Please enter your valid name (at least 2 characters)." };
    }

    if (!reviewText || reviewText.trim().length < 10) {
      return { success: false, error: "Review text must be at least 10 characters long." };
    }

    const starRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const cleanAuthor = author.trim();
    const cleanText = reviewText.trim();
    const cleanSlug = `${cleanAuthor.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "patron"}-${Date.now().toString(36)}`;
    const reviewId = `rev-cust-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

    // Duplicate detection pre-check
    const { computeTextHash } = await import("../lib/reviews/management/utils/duplicateDetector.js");
    const textHash = computeTextHash(cleanText);
    const existingDuplicate = await db.customerReviewSubmission.findFirst({
      where: { textHash },
      select: { id: true },
    });

    const isDuplicate = Boolean(existingDuplicate);
    const duplicateOfId = existingDuplicate?.id || null;

    // Detect timber species
    let woodType = data.woodType || null;
    if (!woodType) {
      const lower = cleanText.toLowerCase();
      if (lower.includes("sagwan") || lower.includes("teak")) woodType = "Sagwan Teak";
      else if (lower.includes("sheesham")) woodType = "Sheesham Wood";
      else if (lower.includes("hardwood")) woodType = "Seasoned Hardwood";
    }

    // Determine purchase vs showroom visit:
    const isShowroom = Boolean(
      data.verificationBadge === "SHOWROOM_VISIT" ||
      data.visitedShowroom === true ||
      experienceType === "VISITED" ||
      productPurchased === "Showroom & Store Visit" ||
      categoryName === "Showroom Visit"
    );

    const verificationBadge = isShowroom ? "SHOWROOM_VISIT" : "VERIFIED_PURCHASE";
    const visitedShowroom = isShowroom;
    const finalProduct = isShowroom ? "Showroom & Store Visit" : (productPurchased || "Handcrafted Sagwan Teak Piece");
    const finalCategory = isShowroom ? "Showroom Visit" : (categoryName || "Living Room");
    const finalWoodType = isShowroom ? null : woodType;

    // Generate automated official owner response
    const { createAutoOwnerReplyData } = await import(
      "../lib/reviews/ownerResponse/autoReplyGenerator.js"
    );
    const autoReplyMeta = createAutoOwnerReplyData({
      authorName: cleanAuthor,
      rating: starRating,
      language,
      productName: finalProduct,
    });

    // 1. Primary PostgreSQL persistence: CustomerReviewSubmission
    const created = await db.customerReviewSubmission.create({
      data: {
        id: reviewId,
        reviewerName: cleanAuthor,
        rating: starRating,
        reviewText: cleanText,
        phone: phone ? String(phone).trim() : null,
        city: city || "Solapur",
        furnitureCategory: finalCategory,
        furniturePurchased: finalProduct,
        language: ["en", "hi", "mr"].includes(language) ? language : "en",
        status: "APPROVED",
        moderationStatus: isDuplicate ? "NEEDS_REVIEW" : "SAFE",
        moderationScore: isDuplicate ? 0.5 : 1.0,
        aiSummary: isShowroom
          ? `${starRating}★ showroom & workshop visit experience. Solapur facility inspection.`
          : `${starRating}★ experience for ${finalProduct}. Verified craftsmanship.`,
        aiSentiment: starRating >= 4 ? "POSITIVE" : starRating === 3 ? "NEUTRAL" : "CRITICAL",
        slug: cleanSlug,
        textHash,
        isDuplicate,
        duplicateOfId,
        woodType: finalWoodType,
        deliveryDate: (() => {
          if (isShowroom || !data.deliveryDate) return null;
          const parsed = new Date(data.deliveryDate);
          return isNaN(parsed.getTime()) ? null : parsed;
        })(),
        visitedShowroom,
        isVerified: true,
        verificationBadge,
        ...autoReplyMeta,
        publishedAt: new Date(),
        createdAt: new Date(),
      },
    });

    // 2. Backward compatibility: also record in googleLocationReview
    try {
      await db.googleLocationReview.create({
        data: {
          author: cleanAuthor,
          locationName,
          rating: starRating,
          reviewText: cleanText,
          aiSentiment: starRating >= 4 ? "POSITIVE" : starRating === 3 ? "NEUTRAL" : "CRITICAL",
          aiSummary: `${experienceType === "PURCHASED" ? "Customer Purchase" : "Showroom Visit"}: ${productPurchased || "Handcrafted Furniture"}`,
          aiKeyTopics: [experienceType, productPurchased || "Handcrafted Sagwan Teak", "Solapur Workshop"].filter(Boolean),
          verified: true,
          googleMapsUrl: "https://search.google.com/local/writereview?placeid=ChIJB1k-wjTbxTsR7dA3i-yPr4Y",
        },
      });
    } catch (legErr) {
      console.warn("Legacy table write warning:", legErr.message);
    }

    // 2a. Record initial status history & admin notification in database
    try {
      await db.reviewModerationHistory.create({
        data: {
          reviewId,
          oldStatus: "NEW",
          newStatus: "APPROVED",
          actionBy: cleanAuthor,
          role: "CUSTOMER",
          reason: "User verified Google review posting via Assisted Workflow",
        },
      });

      await db.reviewNotification.create({
        data: {
          type: "NEW_REVIEW",
          title: "New Verified Review Published",
          message: `${cleanAuthor} submitted and verified a ${starRating}★ review for ${productPurchased || "Furniture"}.`,
          reviewId,
          actorName: cleanAuthor,
          actorRole: "CUSTOMER",
        },
      });
    } catch (auditErr) {
      console.warn("Audit/Notification logging warning:", auditErr.message);
    }

    // 2b. If generation sessionId provided, record selectedReview and submission state
    if (data.sessionId) {
      try {
        await db.reviewGenerationSession.update({
          where: { sessionId: data.sessionId },
          data: {
            selectedReview: {
              author: cleanAuthor,
              rating: starRating,
              review: cleanText,
              submittedAt: new Date().toISOString(),
            },
          },
        });
      } catch (sessErr) {
        // Non-fatal
      }
    }

    // 3. Clear in-memory caches and revalidate public & admin paths
    try {
      const { ReviewRepository } = await import("../lib/reviews/google/repository/reviewRepository.js");
      await ReviewRepository.clearCache();
    } catch (cacheErr) {
      console.warn("Cache clearance warning:", cacheErr.message);
    }

    try {
      revalidatePath("/ai-reviews");
      revalidatePath("/admin/reviews");
      revalidatePath("/manager/reviews");
      revalidatePath("/review");
    } catch (revalErr) {
      // Gracefully ignored when executed outside active Next.js HTTP request cycle
    }

    const { GoogleReviewService } = await import("../lib/reviews/google/services/googleReviewService.js");
    const normalized = GoogleReviewService.normalizeCustomerSubmission(created);

    return { success: true, data: created, review: normalized };
  } catch (error) {
    console.error("Error submitting verified review:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get verified reviews from PostgreSQL database
 */
export async function getVerifiedReviews() {
  try {
    const reviews = await db.googleLocationReview.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    return { success: true, reviews };
  } catch (error) {
    console.error("Error fetching verified reviews:", error);
    return { success: false, reviews: [], error: error.message };
  }
}

/**
 * Fetch randomized review prompts directly from database for a chosen star rating
 */
export async function getRandomFivePrompts(rating = 5, count = 6) {
  try {
    const starRating = Number(rating) || 5;
    const fetchLimit = Number(count) || 6;

    const allForStar = await db.reviewQuote.findMany({
      where: { rating: starRating },
    });

    const shuffled = [...allForStar].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.max(5, fetchLimit));

    return {
      success: true,
      prompts: selected,
      totalCount: allForStar.length,
    };
  } catch (error) {
    console.error("Error in getRandomFivePrompts:", error);
    return {
      success: true,
      prompts: [],
      totalCount: 0,
    };
  }
}

/**
 * Admin: Get all review quotes with search, filter by star rating, and stats
 */
export async function getAdminReviewQuotes(filters = {}) {
  try {
    const { rating, search = "", page = 1, limit = 25 } = filters;
    const where = {};

    if (rating && Number(rating) > 0) {
      where.rating = Number(rating);
    }

    if (search && search.trim()) {
      where.OR = [
        { quoteText: { contains: search.trim(), mode: "insensitive" } },
        { authorHint: { contains: search.trim(), mode: "insensitive" } },
        { category: { contains: search.trim(), mode: "insensitive" } },
        { productPurchased: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [totalQuotes, star5, star4, star3, star2, star1, quotes, filteredCount] = await Promise.all([
      db.reviewQuote.count(),
      db.reviewQuote.count({ where: { rating: 5 } }),
      db.reviewQuote.count({ where: { rating: 4 } }),
      db.reviewQuote.count({ where: { rating: 3 } }),
      db.reviewQuote.count({ where: { rating: 2 } }),
      db.reviewQuote.count({ where: { rating: 1 } }),
      db.reviewQuote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      db.reviewQuote.count({ where }),
    ]);

    return {
      success: true,
      quotes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredCount,
        totalPages: Math.ceil(filteredCount / Number(limit)) || 1,
      },
      stats: {
        totalQuotes,
        star5,
        star4,
        star3,
        star2,
        star1,
      },
    };
  } catch (error) {
    console.error("Error in getAdminReviewQuotes:", error);
    return { success: false, error: error.message, quotes: [] };
  }
}

/**
 * Admin: Create a new review prompt
 */
export async function createReviewQuote(data) {
  try {
    const { rating = 5, category = "LIVING_SOFA", quoteText, authorHint, experienceType = "PURCHASED", productPurchased = null } = data;
    if (!quoteText || quoteText.trim().length < 5) {
      return { success: false, error: "Review prompt text must be at least 5 characters." };
    }

    const created = await db.reviewQuote.create({
      data: {
        rating: Number(rating) || 5,
        category: category || "LIVING_SOFA",
        experienceType: experienceType || "PURCHASED",
        productPurchased: productPurchased || null,
        quoteText: quoteText.trim(),
        authorHint: authorHint ? authorHint.trim() : null,
      },
    });

    revalidatePath("/ai-reviews");
    revalidatePath("/admin/reviews");

    return { success: true, quote: created };
  } catch (error) {
    console.error("Error in createReviewQuote:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Update an existing review prompt
 */
export async function updateReviewQuote(id, data) {
  try {
    const { rating, category, quoteText, authorHint, experienceType, productPurchased } = data;
    const updateData = {};

    if (rating !== undefined) updateData.rating = Number(rating);
    if (category !== undefined) updateData.category = category;
    if (quoteText !== undefined) updateData.quoteText = quoteText.trim();
    if (authorHint !== undefined) updateData.authorHint = authorHint ? authorHint.trim() : null;
    if (experienceType !== undefined) updateData.experienceType = experienceType;
    if (productPurchased !== undefined) updateData.productPurchased = productPurchased || null;

    const updated = await db.reviewQuote.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/ai-reviews");
    revalidatePath("/admin/reviews");

    return { success: true, quote: updated };
  } catch (error) {
    console.error("Error in updateReviewQuote:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Delete a review prompt
 */
export async function deleteReviewQuote(id) {
  try {
    await db.reviewQuote.delete({ where: { id } });
    revalidatePath("/ai-reviews");
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteReviewQuote:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Review Pool status check
 */
export async function seedBulkReviewPool() {
  try {
    const total = await db.reviewQuote.count();
    revalidatePath("/ai-reviews");
    revalidatePath("/admin/reviews");
    return { success: true, insertedCount: 0, totalCount: total };
  } catch (error) {
    console.error("Error in seedBulkReviewPool:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch dynamic categories for the Review Wizard from database
 */
export async function getReviewCategories() {
  try {
    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        _count: {
          select: {
            Product: {
              where: { isArchived: false },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    if (categories && categories.length > 0) {
      return { success: true, categories };
    }

    return {
      success: true,
      categories: [
        { id: "cat-living", name: "Living Room", slug: "living", description: "Royal teak sofas, recliners, and center tables.", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80", _count: { Product: 12 } },
        { id: "cat-bedroom", name: "Bedroom", slug: "bedroom", description: "Solid wood king/queen beds, wardrobes, and nightstands.", imageUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80", _count: { Product: 8 } },
        { id: "cat-dining", name: "Dining Room", slug: "dining", description: "6 & 8-seater dining suites with cushioned chairs.", imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80", _count: { Product: 6 } },
        { id: "cat-office", name: "Office & Study", slug: "office", description: "Executive desks, ergonomic chairs, and bookshelves.", imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80", _count: { Product: 4 } },
        { id: "cat-fabrics", name: "Loose Cloth & Fabrics", slug: "fabrics", description: "Velvet, Turkish jacquard, and sofa upholstery rolls.", imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80", _count: { Product: 3 } },
      ],
    };
  } catch (error) {
    console.error("Error in getReviewCategories:", error);
    return {
      success: true,
      categories: [
        { id: "cat-living", name: "Living Room", slug: "living", description: "Royal teak sofas, recliners, and center tables.", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80", _count: { Product: 12 } },
        { id: "cat-bedroom", name: "Bedroom", slug: "bedroom", description: "Solid wood king/queen beds, wardrobes, and nightstands.", imageUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80", _count: { Product: 8 } },
        { id: "cat-dining", name: "Dining Room", slug: "dining", description: "6 & 8-seater dining suites with cushioned chairs.", imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80", _count: { Product: 6 } },
        { id: "cat-office", name: "Office & Study", slug: "office", description: "Executive desks, ergonomic chairs, and bookshelves.", imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80", _count: { Product: 4 } },
        { id: "cat-fabrics", name: "Loose Cloth & Fabrics", slug: "fabrics", description: "Velvet, Turkish jacquard, and sofa upholstery rolls.", imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80", _count: { Product: 3 } },
      ],
    };
  }
}

/**
 * Fetch dynamic products by category for the Review Wizard
 */
export async function getReviewProductsByCategory(categorySlugOrId) {
  try {
    const where = { isArchived: false };
    if (categorySlugOrId && categorySlugOrId !== "all") {
      where.OR = [
        { categoryId: categorySlugOrId },
        { Category: { slug: categorySlugOrId } },
      ];
    }

    const products = await db.product.findMany({
      where,
      select: {
        id: true,
        title: true,
        woodType: true,
        slug: true,
        price: true,
        images: true,
        categoryId: true,
        Category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { title: "asc" },
      take: 60,
    });

    return { success: true, products };
  } catch (error) {
    console.error("Error in getReviewProductsByCategory:", error);
    return { success: false, products: [], error: error.message };
  }
}

/**
 * Validate customer review input before submission or AI generation
 */
export async function validateReviewInput(input = {}) {
  const errors = {};

  if (!input.rating || Number(input.rating) < 1 || Number(input.rating) > 5) {
    errors.rating = "Please select an overall rating between 1 and 5 stars.";
  }

  if (input.isCustomMode && (!input.customProduct || !String(input.customProduct).trim())) {
    errors.product = "Please enter the name of your custom furniture item.";
  }

  if (input.language && !["en", "hi", "mr"].includes(String(input.language).toLowerCase())) {
    errors.language = "Please select your preferred review language (English, Hindi, or Marathi).";
  }

  if (input.additionalFeedback && String(input.additionalFeedback).length > 1000) {
    errors.additionalFeedback = "Feedback note is too long (maximum 1,000 characters).";
  }

  if (input.phone && String(input.phone).trim()) {
    const cleanPhone = String(input.phone).replace(/[\s\-\(\)\+]/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone.slice(-10))) {
      errors.phone = "Please enter a valid 10-digit mobile number.";
    }
  }

  if (input.reviewText && String(input.reviewText).trim().length < 5) {
    errors.reviewText = "Review text must be at least 5 characters long.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Server Action: Generate multiple natural Google review suggestions from Phase 2 customer input
 */
export async function generateAiReviewSuggestions(validatedPayload = {}) {
  try {
    const { generateAiReviews } = await import("../lib/reviews/reviewGenerator.js");
    const result = await generateAiReviews(validatedPayload);
    return result;
  } catch (error) {
    console.error("Error in generateAiReviewSuggestions:", error);
    return {
      success: false,
      suggestions: [],
      error: error.message || "Failed to generate AI reviews.",
    };
  }
}

/**
 * Database-backed Review Generation Session (Phase 8.3 & 8.5.1)
 * Generates natural reviews with zero static seed dependency.
 * Persists session cleanly in PostgreSQL.
 */
export async function getOrCreateReviewGenerationSessionAction({ sessionId, payload = {}, forceNew = false } = {}) {
  try {
    const safePayload = payload && typeof payload === "object" ? payload : { rating: 5, language: "en" };

    // 1. If existing sessionId provided and forceNew is false, check database
    if (sessionId && !forceNew) {
      try {
        const existing = await db.reviewGenerationSession.findUnique({
          where: { sessionId },
        });

        if (existing && new Date(existing.expiresAt) > new Date()) {
          // Verify if existing session's prompt matches the current requested payload
          let promptMatches = false;
          try {
            const prev = typeof existing.prompt === "string" ? JSON.parse(existing.prompt) : existing.prompt;
            if (
              prev &&
              Number(prev.rating) === Number(safePayload.rating) &&
              prev.language === safePayload.language &&
              (prev.category || "") === (safePayload.category || "") &&
              (prev.product || "") === (safePayload.product || "") &&
              Boolean(prev.isShowroomOnly) === Boolean(safePayload.isShowroomOnly) &&
              JSON.stringify(prev.experience || []) === JSON.stringify(safePayload.experience || []) &&
              (prev.additionalFeedback || "") === (safePayload.additionalFeedback || "")
            ) {
              promptMatches = true;
            }
          } catch (e) {
            promptMatches = false;
          }

          if (promptMatches) {
            const meta = existing.aiMetadata || {};
            return {
              success: true,
              sessionId: existing.sessionId,
              suggestions: existing.generatedReviews,
              selectedReview: existing.selectedReview,
              version: meta.version || 1,
              generationCount: meta.generationCount || 1,
              isNew: false,
              expiresAt: existing.expiresAt,
            };
          }
        }
      } catch (findErr) {
        console.warn("Session lookup notice:", findErr.message);
      }
    }

    // 2. Generate exactly 6 reviews strictly within 60-120 words
    const { generateAiReviews } = await import("../lib/reviews/reviewGenerator.js");
    const seedOffset = Math.floor(Math.random() * 5);
    const genResult = await generateAiReviews(safePayload, { seedOffset });

    if (!genResult || !Array.isArray(genResult.suggestions) || genResult.suggestions.length === 0) {
      throw new Error("Unable to synthesize review suggestions.");
    }

    // 3. If forceNew and sessionId provided, update existing session
    if (sessionId && forceNew) {
      try {
        const existing = await db.reviewGenerationSession.findUnique({
          where: { sessionId },
        });

        if (existing) {
          const curMeta = typeof existing.aiMetadata === "object" && existing.aiMetadata ? existing.aiMetadata : {};
          const curVersion = Number(curMeta.version) || 1;
          const curGenCount = Number(curMeta.generationCount) || 1;
          const history = Array.isArray(curMeta.history) ? [...curMeta.history] : [];

          history.unshift({
            version: curVersion,
            reviews: existing.generatedReviews,
            archivedAt: new Date().toISOString(),
          });

          const newMeta = {
            ...curMeta,
            version: curVersion + 1,
            generationCount: curGenCount + 1,
            history: history.slice(0, 10),
            debug: genResult.debug || {},
            updatedAt: new Date().toISOString(),
          };

          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

          const updated = await db.reviewGenerationSession.update({
            where: { sessionId },
            data: {
              rating: Number(safePayload.rating) || existing.rating,
              category: safePayload.category || existing.category,
              product: safePayload.product || existing.product,
              language: safePayload.language || existing.language,
              prompt: JSON.stringify(safePayload),
              generatedReviews: genResult.suggestions,
              selectedReview: genResult.suggestions[0] || null,
              aiMetadata: newMeta,
              expiresAt,
              updatedAt: new Date(),
            },
          });

          return {
            success: true,
            sessionId: updated.sessionId,
            suggestions: updated.generatedReviews,
            selectedReview: updated.selectedReview,
            version: newMeta.version,
            generationCount: newMeta.generationCount,
            isNew: false,
            expiresAt,
          };
        }
      } catch (updErr) {
        console.warn("Session update notice:", updErr.message);
      }
    }

    // 4. Create new generation session in PostgreSQL
    const newSessionId = `rgs_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const initialMeta = {
      version: 1,
      generationCount: 1,
      history: [],
      debug: genResult.debug || {},
      createdAt: new Date().toISOString(),
    };

    try {
      await db.reviewGenerationSession.create({
        data: {
          sessionId: newSessionId,
          rating: Number(safePayload.rating) || 5,
          category: safePayload.category || null,
          product: safePayload.product || null,
          language: safePayload.language || "en",
          prompt: JSON.stringify(safePayload),
          generatedReviews: genResult.suggestions,
          selectedReview: genResult.suggestions[0] || null,
          aiMetadata: initialMeta,
          expiresAt,
        },
      });
    } catch (saveErr) {
      console.warn("Session save notice:", saveErr.message);
    }

    return {
      success: true,
      sessionId: newSessionId,
      suggestions: genResult.suggestions,
      selectedReview: genResult.suggestions[0] || null,
      version: 1,
      generationCount: 1,
      isNew: true,
      expiresAt,
    };
  } catch (error) {
    console.error("Error in getOrCreateReviewGenerationSessionAction:", error);
    return {
      success: false,
      error: error.message || "Failed to manage review generation session.",
      suggestions: [],
    };
  }
}

/**
 * Update selected review in the active generation session
 */
export async function updateSessionSelectedReviewAction({ sessionId, selectedReview }) {
  try {
    if (!sessionId) return { success: false, error: "Session ID required" };
    await db.reviewGenerationSession.update({
      where: { sessionId },
      data: { selectedReview },
    });
    return { success: true };
  } catch (error) {
    console.warn("updateSessionSelectedReviewAction warning:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Submit review from wizard directly to PostgreSQL
 */
export async function submitReviewFromWizardAction(data = {}) {
  return submitVerifiedReview(data);
}

/**
 * PostgreSQL Direct Review Filters
 */
export async function getFilteredReviewsAction(filters = {}) {
  try {
    const { ReviewRepository } = await import("../lib/reviews/google/repository/reviewRepository.js");
    const result = await ReviewRepository.fetchFilteredReviews(filters);
    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error("Error in getFilteredReviewsAction:", error);
    return {
      success: false,
      reviews: [],
      total: 0,
      page: 1,
      totalPages: 1,
      error: error.message,
    };
  }
}
