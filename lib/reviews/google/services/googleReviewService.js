/**
 * @file googleReviewService.js
 * Service layer for Google Reviews.
 * Normalizes raw API responses, dates, ratings, author information,
 * owner replies, languages, and avatars into strict domain entities.
 * Never exposes raw third-party or database objects.
 */

import {
  createNormalizedReview,
  createNormalizedAuthor,
  createNormalizedOwnerResponse,
  createNormalizedStatistics,
  SENTIMENT_TIERS,
} from "../types/reviewTypes.js";
import { formatRelativeTime, formatAbsoluteDate, generateInitialsAvatar } from "../utils/relativeTime.js";
import { analyzeSentiment } from "../utils/sentimentAnalyzer.js";
import { generateReviewSummary } from "../utils/summaryGenerator.js";
import { PRIMARY_GOOGLE_PLACE_ID, GOOGLE_WRITE_REVIEW_URL } from "../../../../utils/googleReview.js";

/**
 * Generate a deterministic review ID hash without exposing raw IDs
 * @param {string} seed
 * @returns {string}
 */
function generateDeterministicId(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `gr-${Math.abs(hash).toString(36)}`;
}

/**
 * Normalize language identifier to standard ISO code ('en', 'hi', 'mr', etc.)
 * @param {string} rawLang
 * @param {string} text
 * @returns {string}
 */
function normalizeLanguage(rawLang = "", text = "") {
  const lang = String(rawLang || "").toLowerCase();
  if (lang.includes("mr") || lang.includes("marathi")) return "mr";
  if (lang.includes("hi") || lang.includes("hindi")) return "hi";
  if (lang.includes("en") || lang.includes("english")) return "en";

  // Heuristic for Devanagari script if language was not provided
  if (/[\u0900-\u097F]/.test(text)) {
    // Check Marathi specific character combinations or common words
    if (text.includes("आहे") || text.includes("झाले") || text.includes("केले") || text.includes("खूप") || text.includes("सागवान")) {
      return "mr";
    }
    return "hi";
  }

  return "en";
}

export class GoogleReviewService {
  /**
   * Normalize an individual raw review into domain Review entity
   * @param {Object} raw
   * @param {number} [index=0]
   * @returns {Object} Normalized Review object
   */
  static normalizeReview(raw = {}, index = 0) {
    // 1. Author Normalization
    const rawAuthor = raw.author_name || raw.author || raw.authorHint || "Verified Patron";
    const authorName = String(rawAuthor).split(",")[0].trim() || "Verified Patron";
    const photoUrl = raw.profile_photo_url || raw.avatarUrl || "";
    const avatarUrl = photoUrl && photoUrl.startsWith("http") ? photoUrl : generateInitialsAvatar(authorName);

    const author = createNormalizedAuthor({
      name: authorName,
      avatarUrl,
      isGoogleUser: true,
      reviewCount: Number(raw.reviewCount || raw.user_ratings_total || 1),
    });

    // 2. Rating Normalization (1 to 5 integer/float clamped)
    const rawRating = Number(raw.rating) || 5;
    const rating = Math.min(5, Math.max(1, Math.round(rawRating)));

    // 3. Text Normalization
    const text = String(raw.text || raw.quoteText || raw.reviewText || "").trim();

    // 4. Date Normalization (handles Unix seconds, ISO strings, or Date instances)
    let publishDate;
    if (raw.time && typeof raw.time === "number") {
      publishDate = new Date(raw.time * 1000).toISOString();
    } else if (raw.publishDate || raw.createdAt) {
      publishDate = new Date(raw.publishDate || raw.createdAt).toISOString();
    } else {
      // Stagger dates slightly based on index for realistic distribution if date missing
      const pastDays = index * 4 + 1;
      const d = new Date();
      d.setDate(d.getDate() - pastDays);
      publishDate = d.toISOString();
    }

    const relativeTime = raw.relative_time_description || formatRelativeTime(publishDate);
    const absoluteDate = formatAbsoluteDate(publishDate);

    // 5. Language Normalization
    const language = normalizeLanguage(raw.language || raw.original_language, text);

    // 6. Owner Reply Normalization
    let ownerResponse = null;
    if (raw.ownerResponse || raw.ownerReply) {
      const resp = raw.ownerResponse || raw.ownerReply;
      const respDate = resp.responseDate || resp.date || publishDate;
      ownerResponse = createNormalizedOwnerResponse({
        text: resp.text || resp.replyText || resp,
        responseDate: respDate,
        relativeTime: formatRelativeTime(respDate),
        responderName: resp.responderName || "Aameena Furniture (Owner)",
      });
    }

    // 7. AI Sentiment Analysis
    const sentiment = raw.sentiment || analyzeSentiment(rating, text);

    // 8. Factual AI Summary Generation
    const summary = generateReviewSummary({
      text,
      rating,
      sentiment,
      ownerResponse,
    });

    // 9. Deterministic ID (masking internal IDs)
    const id = raw.id && typeof raw.id === "string" && raw.id.startsWith("gr-")
      ? raw.id
      : generateDeterministicId(`${authorName}-${publishDate}-${index}`);

    const googleReviewUrl = raw.googleReviewUrl || GOOGLE_WRITE_REVIEW_URL;

    // Detect timber species if not explicitly provided
    let woodType = raw.woodType || null;
    if (!woodType) {
      const lower = text.toLowerCase();
      if (lower.includes("sagwan") || lower.includes("teak")) woodType = "Sagwan Teak";
      else if (lower.includes("sheesham")) woodType = "Sheesham Wood";
      else if (lower.includes("hardwood") || lower.includes("timber")) woodType = "Seasoned Hardwood";
    }

    const visitedShowroom = Boolean(
      raw.visitedShowroom ||
      raw.experienceType === "VISITED" ||
      text.toLowerCase().includes("visited") ||
      text.toLowerCase().includes("showroom") ||
      text.toLowerCase().includes("workshop")
    );

    return createNormalizedReview({
      id,
      author,
      rating,
      text,
      originalLanguage: language,
      language,
      publishDate,
      relativeTime,
      absoluteDate,
      sentiment,
      summary,
      ownerResponse,
      helpfulCount: Number(raw.helpfulCount || 0),
      googleReviewUrl,
      verified: true,
      images: Array.isArray(raw.images) ? raw.images : [],
      city: raw.city || "Solapur",
      furniturePurchased: raw.furniturePurchased || raw.productPurchased || "",
      woodType,
      deliveryDate: raw.deliveryDate ? new Date(raw.deliveryDate).toISOString() : null,
      visitedShowroom,
      furnitureCategory: raw.furnitureCategory || raw.category || "Living Room",
      productName: raw.productName || raw.furniturePurchased || raw.productPurchased || "",
      wouldRecommend: raw.wouldRecommend !== undefined ? Boolean(raw.wouldRecommend) : true,
      verificationBadge: raw.verificationBadge || (visitedShowroom ? "SHOWROOM_VISIT" : "VERIFIED_PURCHASE"),
    });
  }

  /**
   * Normalize an approved customer review submission from the management layer
   * @param {Object} sub
   * @returns {Object} Normalized Review domain object
   */
  static normalizeCustomerSubmission(sub = {}) {
    const authorName = String(sub.reviewerName || "Verified Patron").trim();
    const avatarUrl = sub.authorAvatar || sub.avatarUrl || generateInitialsAvatar(authorName);

    const author = createNormalizedAuthor({
      name: authorName,
      avatarUrl,
      isGoogleUser: true,
      reviewCount: 1,
    });

    const rating = Math.min(5, Math.max(1, Number(sub.rating) || 5));
    const text = String(sub.reviewText || "").trim();
    const publishDate = new Date(sub.publishedAt || sub.createdAt || new Date()).toISOString();
    const relativeTime = formatRelativeTime(publishDate);
    const absoluteDate = formatAbsoluteDate(publishDate);
    const language = normalizeLanguage(sub.language, text);

    let ownerResponse = null;
    if (sub.ownerReply) {
      const respDate = sub.ownerReplyUpdatedAt || sub.ownerReplyDate || publishDate;
      ownerResponse = createNormalizedOwnerResponse({
        text: sub.ownerReply,
        responseDate: respDate,
        relativeTime: formatRelativeTime(respDate),
        responderName: sub.ownerReplyBy || "Response from the Owner — AMEENA Distributors",
        isPinned: Boolean(sub.isReplyPinned),
      });
    }

    const sentiment = sub.aiSentiment || analyzeSentiment(rating, text);
    const summary = sub.aiSummary
      ? {
          text: sub.aiSummary,
          sentiment,
          keyPoints: ["Showroom Experience", "Craftsmanship"],
          isIssueResolved: false,
        }
      : generateReviewSummary({
          text,
          rating,
          sentiment,
          ownerResponse,
        });

    // Detect wood type if not set
    let woodType = sub.woodType || null;
    if (!woodType) {
      const lower = text.toLowerCase();
      if (lower.includes("sagwan") || lower.includes("teak")) woodType = "Sagwan Teak";
      else if (lower.includes("sheesham")) woodType = "Sheesham Wood";
      else if (lower.includes("hardwood")) woodType = "Solid Hardwood";
    }

    return createNormalizedReview({
      id: sub.id,
      author,
      rating,
      text,
      originalLanguage: language,
      language,
      publishDate,
      relativeTime,
      absoluteDate,
      sentiment,
      summary,
      ownerResponse,
      helpfulCount: Number(sub.helpfulCount || 0),
      googleReviewUrl: GOOGLE_WRITE_REVIEW_URL,
      verified: true,
      images: Array.isArray(sub.images) ? sub.images : [],
      city: sub.city || "Solapur",
      furniturePurchased: sub.furniturePurchased || sub.productName || sub.furnitureCategory || "",
      woodType,
      deliveryDate: sub.deliveryDate ? new Date(sub.deliveryDate).toISOString() : null,
      visitedShowroom: Boolean(sub.visitedShowroom || sub.furnitureCategory?.includes("SHOWROOM")),
      furnitureCategory: sub.furnitureCategory || "Living Room",
      productName: sub.productName || sub.furniturePurchased || "",
      wouldRecommend: sub.wouldRecommend !== undefined ? Boolean(sub.wouldRecommend) : true,
      verificationBadge: sub.verificationBadge || (sub.visitedShowroom ? "SHOWROOM_VISIT" : "VERIFIED_PURCHASE"),
    });
  }

  /**
   * Calculate aggregated statistics from a list of normalized reviews
   * @param {Array<Object>} reviews
   * @returns {Object} Normalized ReviewStatistics object
   */
  static calculateStatistics(reviews = []) {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return createNormalizedStatistics({
        averageRating: 5.0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        languageDistribution: { en: 0, hi: 0, mr: 0, other: 0 },
        positivePercentage: 100,
        negativePercentage: 0,
        neutralPercentage: 0,
        latestReviewDate: new Date().toISOString(),
        overallSentiment: SENTIMENT_TIERS.VERY_POSITIVE,
        ownerReplyCount: 0,
        ownerReplyRate: 0,
      });
    }

    const total = reviews.length;
    let sumRating = 0;
    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const langDist = { en: 0, hi: 0, mr: 0, other: 0 };

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let ownerReplyCount = 0;
    let latestTimestamp = 0;

    for (const r of reviews) {
      const score = Math.min(5, Math.max(1, Math.round(r.rating)));
      sumRating += score;
      ratingDist[score] = (ratingDist[score] || 0) + 1;

      const lang = r.language || "en";
      if (langDist[lang] !== undefined) {
        langDist[lang]++;
      } else {
        langDist.other++;
      }

      if (score >= 4) {
        positiveCount++;
      } else if (score <= 2) {
        negativeCount++;
      } else {
        neutralCount++;
      }

      if (r.ownerResponse && r.ownerResponse.text) {
        ownerReplyCount++;
      }

      const t = new Date(r.publishDate).getTime();
      if (t > latestTimestamp) {
        latestTimestamp = t;
      }
    }

    const avg = total > 0 ? sumRating / total : 5.0;
    const positivePercentage = total > 0 ? Math.round((positiveCount / total) * 100) : 100;
    const negativePercentage = total > 0 ? Math.round((negativeCount / total) * 100) : 0;
    const neutralPercentage = total > 0 ? Math.round((neutralCount / total) * 100) : 0;
    const ownerReplyRate = total > 0 ? Math.round((ownerReplyCount / total) * 100) : 0;

    let overallSentiment = SENTIMENT_TIERS.POSITIVE;
    if (avg >= 4.7 && positivePercentage >= 85) {
      overallSentiment = SENTIMENT_TIERS.VERY_POSITIVE;
    } else if (avg >= 4.0) {
      overallSentiment = SENTIMENT_TIERS.POSITIVE;
    } else if (avg >= 3.0) {
      overallSentiment = SENTIMENT_TIERS.NEUTRAL;
    } else {
      overallSentiment = SENTIMENT_TIERS.NEGATIVE;
    }

    const latestReviewDate = latestTimestamp > 0 ? new Date(latestTimestamp).toISOString() : new Date().toISOString();

    return createNormalizedStatistics({
      averageRating: avg,
      totalReviews: total,
      ratingDistribution: ratingDist,
      languageDistribution: langDist,
      positivePercentage,
      negativePercentage,
      neutralPercentage,
      latestReviewDate,
      overallSentiment,
      ownerReplyCount,
      ownerReplyRate,
    });
  }

  /**
   * Normalize an official Google Places API Details response
   * @param {Object} placesResult - The `result` object from Places API
   * @returns {{ reviews: Array<Object>, stats: Object }}
   */
  static normalizeGooglePlacesApiResponse(placesResult = {}) {
    const rawReviews = Array.isArray(placesResult.reviews) ? placesResult.reviews : [];
    const normalizedReviews = rawReviews.map((r, i) => GoogleReviewService.normalizeReview(r, i));

    const computedStats = GoogleReviewService.calculateStatistics(normalizedReviews);

    // If Places API reported higher overall rating or total reviews, merge gracefully
    if (placesResult.rating && placesResult.user_ratings_total) {
      computedStats.averageRating = Number(Number(placesResult.rating).toFixed(1));
      computedStats.totalReviews = Number(placesResult.user_ratings_total);
    }

    return {
      reviews: normalizedReviews,
      stats: computedStats,
    };
  }
}

export default GoogleReviewService;
