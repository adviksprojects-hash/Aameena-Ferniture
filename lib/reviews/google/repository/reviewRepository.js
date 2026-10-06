/**
 * @file reviewRepository.js
 * Pure PostgreSQL Database-Driven Repository layer for Google & Customer Reviews.
 * Zero dummy arrays, zero static mock reviews, zero hardcoded fallbacks.
 * Everything originates directly from PostgreSQL via Prisma.
 */

import { reviewCache } from "../cache/reviewCache.js";
import { GoogleReviewService } from "../services/googleReviewService.js";
import { PRIMARY_GOOGLE_PLACE_ID } from "../../../../utils/googleReview.js";
import { db } from "../../../../lib/prisma.js";

const CACHE_KEY_REVIEWS = "normalized_google_reviews_list";
const CACHE_KEY_STATS = "normalized_google_reviews_stats";

export class ReviewRepository {
  /**
   * Clear in-memory / cache when reviews are updated or approved
   */
  static async clearCache() {
    try {
      await reviewCache.del(CACHE_KEY_REVIEWS);
      await reviewCache.del(CACHE_KEY_STATS);
    } catch (err) {
      console.warn("[ReviewRepository] Cache clearance notice:", err.message);
    }
  }

  /**
   * Fetch reviews purely from PostgreSQL database with Google Places API integration if configured.
   * Never falls back to static dummy arrays. Returns real records only.
   * @param {Object} [options]
   * @param {boolean} [options.forceRefresh=false]
   * @returns {Promise<Array<Object>>}
   */
  static async fetchReviews(options = {}) {
    const { forceRefresh = false } = options;

    // 1. Check Cache
    if (!forceRefresh) {
      const cached = await reviewCache.get(CACHE_KEY_REVIEWS);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
    }

    let baseReviews = [];

    // 2. Attempt Official Google Places API if key and place ID are configured
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID || PRIMARY_GOOGLE_PLACE_ID;

    if (apiKey && apiKey !== "demo_google_places_key" && placeId) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
          placeId
        )}&fields=reviews,rating,user_ratings_total&key=${encodeURIComponent(apiKey)}`;

        const response = await fetch(url, {
          signal: controller.signal,
          next: { revalidate: 3600 },
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.result && Array.isArray(data.result.reviews) && data.result.reviews.length > 0) {
            const apiResult = GoogleReviewService.normalizeGooglePlacesApiResponse(data.result);
            baseReviews = apiResult.reviews;
          }
        }
      } catch (err) {
        console.warn("[ReviewRepository] Google Places API fetch notice:", err.message);
      }
    }

    // 3. PostgreSQL Database Fetch: Pure database-driven retrieval
    let dbReviews = [];
    try {
      // Fetch approved customer review submissions
      const customerSubmissions = await db.customerReviewSubmission.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 200,
      });

      const normalizedCustomerReviews = customerSubmissions.map((sub) =>
        GoogleReviewService.normalizeCustomerSubmission(sub)
      );

      // If customer submissions exist, display all uploaded customer reviews
      if (normalizedCustomerReviews.length > 0) {
        dbReviews = normalizedCustomerReviews;
      } else {
        // Fallback only if no customer submissions exist yet
        const locationReviews = await db.googleLocationReview.findMany({
          where: { verified: true },
          orderBy: { createdAt: "desc" },
          take: 100,
        });

        const normalizedLocationReviews = locationReviews.map((loc, idx) =>
          GoogleReviewService.normalizeReview(
            {
              id: loc.id,
              author_name: loc.author,
              rating: loc.rating,
              text: loc.reviewText,
              time: loc.createdAt ? Math.floor(new Date(loc.createdAt).getTime() / 1000) : undefined,
              profile_photo_url: loc.authorAvatar,
              verified: loc.verified,
              googleMapsUrl: loc.googleMapsUrl,
            },
            idx
          )
        );

        dbReviews = normalizedLocationReviews;
      }
    } catch (dbErr) {
      console.warn("[ReviewRepository] PostgreSQL review fetch notice:", dbErr.message);
    }

    // 4. Merge and deduplicate by review ID and text content
    const seenIds = new Set();
    const seenTexts = new Set();
    const mergedReviews = [];

    // Prioritize direct database submissions
    for (const r of dbReviews) {
      if (!r || !r.id) continue;
      const textKey = (r.text || "").trim().toLowerCase().slice(0, 120);
      if (seenIds.has(r.id) || (textKey && seenTexts.has(textKey))) {
        continue;
      }
      seenIds.add(r.id);
      if (textKey) seenTexts.add(textKey);
      mergedReviews.push(r);
    }

    // Include Google Places API reviews if available
    for (const r of baseReviews) {
      if (!r || !r.id) continue;
      const textKey = (r.text || "").trim().toLowerCase().slice(0, 120);
      if (seenIds.has(r.id) || (textKey && seenTexts.has(textKey))) {
        continue;
      }
      seenIds.add(r.id);
      if (textKey) seenTexts.add(textKey);
      mergedReviews.push(r);
    }

    // Sort chronologically newest first
    mergedReviews.sort(
      (a, b) =>
        new Date(b.publishDate || b.createdAt || 0).getTime() -
        new Date(a.publishDate || a.createdAt || 0).getTime()
    );

    // Update Cache
    await reviewCache.set(CACHE_KEY_REVIEWS, mergedReviews);
    await reviewCache.del(CACHE_KEY_STATS); // ensure stats recompute

    return mergedReviews;
  }

  /**
   * Get calculated statistics for all reviews from real database
   * @returns {Promise<Object>} ReviewStatistics
   */
  static async getReviewStats() {
    const cachedStats = await reviewCache.get(CACHE_KEY_STATS);
    if (cachedStats) {
      return cachedStats;
    }

    const reviews = await ReviewRepository.fetchReviews();
    const stats = GoogleReviewService.calculateStatistics(reviews);
    await reviewCache.set(CACHE_KEY_STATS, stats);

    return stats;
  }

  /**
   * Get reviews that have authentic owner responses from real database
   * @returns {Promise<Array<Object>>}
   */
  static async getOwnerResponses() {
    const reviews = await ReviewRepository.fetchReviews();
    return reviews.filter((r) => r.ownerResponse !== null);
  }

  /**
   * Force cache refresh
   * @returns {Promise<Array<Object>>}
   */
  static async refreshCache() {
    await reviewCache.clear();
    return ReviewRepository.fetchReviews({ forceRefresh: true });
  }

  /**
   * Get distinct languages present in review catalog with counts from real database
   * @returns {Promise<Array<{ code: string, label: string, count: number }>>}
   */
  static async getLanguages() {
    const reviews = await ReviewRepository.fetchReviews();
    const counts = { en: 0, hi: 0, mr: 0, other: 0 };

    for (const r of reviews) {
      const code = r.language || "en";
      if (counts[code] !== undefined) {
        counts[code]++;
      } else {
        counts.other++;
      }
    }

    return [
      { code: "en", label: "English", count: counts.en },
      { code: "hi", label: "Hindi (हिंदी)", count: counts.hi },
      { code: "mr", label: "Marathi (मराठी)", count: counts.mr },
    ];
  }

  /**
   * Directly queries PostgreSQL for filtered customer reviews.
   * Pure database query with pagination, search, star ratings, language, and sorting.
   * Zero static mock data.
   */
  static async fetchFilteredReviews(filters = {}) {
    const {
      page = 1,
      limit = 6,
      rating = "all",
      sortBy = "NEWEST",
      language = "all",
      city = "",
      category = "",
      product = "",
      woodType = "",
      hasImages = false,
      hasOwnerReply = false,
      onlyPositive = false,
      onlyNegative = false,
      onlyVerified = false,
      search = "",
    } = filters;

    const where = {
      status: "APPROVED",
    };

    if (rating && rating !== "all" && Number(rating) > 0) {
      where.rating = Number(rating);
    }

    if (language && language !== "all") {
      where.language = language;
    }

    if (city && String(city).trim() && city !== "all") {
      where.city = { contains: String(city).trim(), mode: "insensitive" };
    }

    if (category && String(category).trim() && category !== "all") {
      where.furnitureCategory = { contains: String(category).trim(), mode: "insensitive" };
    }

    if (product && String(product).trim() && product !== "all") {
      where.furniturePurchased = { contains: String(product).trim(), mode: "insensitive" };
    }

    if (woodType && String(woodType).trim() && woodType !== "all") {
      where.woodType = { contains: String(woodType).trim(), mode: "insensitive" };
    }

    if (hasImages) {
      where.images = { isEmpty: false };
    }

    if (hasOwnerReply) {
      where.ownerReply = { not: null };
    }

    if (onlyVerified) {
      where.isVerified = true;
    }

    if (onlyPositive) {
      where.OR = [
        { rating: { gte: 4 } },
        { aiSentiment: "POSITIVE" },
      ];
    } else if (onlyNegative) {
      where.OR = [
        { rating: { lte: 3 } },
        { aiSentiment: { in: ["CRITICAL", "NEGATIVE", "MIXED"] } },
      ];
    }

    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { reviewerName: { contains: q, mode: "insensitive" } },
        { reviewText: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { furniturePurchased: { contains: q, mode: "insensitive" } },
        { furnitureCategory: { contains: q, mode: "insensitive" } },
        { woodType: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy = { createdAt: "desc" };
    const sortUpper = String(sortBy || "").toUpperCase();
    if (sortUpper === "OLDEST") {
      orderBy = { createdAt: "asc" };
    } else if (sortUpper === "HIGHEST") {
      orderBy = { rating: "desc" };
    } else if (sortUpper === "LOWEST") {
      orderBy = { rating: "asc" };
    }

    const take = Math.max(1, Number(limit) || 6);
    const skip = Math.max(0, (Number(page) - 1) * take);

    let dbReviews = [];
    let totalCount = 0;
    try {
      dbReviews = await db.customerReviewSubmission.findMany({
        where,
        orderBy,
        skip,
        take,
      });
      totalCount = await db.customerReviewSubmission.count({ where });
    } catch (dbErr) {
      // Retry once on transient connection issues
      try {
        dbReviews = await db.customerReviewSubmission.findMany({
          where,
          orderBy,
          skip,
          take,
        });
        totalCount = await db.customerReviewSubmission.count({ where });
      } catch (retryErr) {
        console.error("fetchFilteredReviews DB query error:", retryErr);
        throw retryErr;
      }
    }

    const normalized = dbReviews.map((sub) =>
      GoogleReviewService.normalizeCustomerSubmission(sub)
    );

    return {
      reviews: normalized,
      total: totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / take) || 1,
      hasMore: skip + dbReviews.length < totalCount,
    };
  }
}

export const fetchFilteredReviews = ReviewRepository.fetchFilteredReviews.bind(ReviewRepository);
export default ReviewRepository;
