/**
 * @file reviewTypes.js
 * Normalized types and contracts for the Public Google Reviews Layer.
 * Strictly typed interfaces with factory initializers to prevent raw API leakage.
 */

/**
 * 6-Tier Sentiment Classification Enum
 * @readonly
 * @enum {string}
 */
export const SENTIMENT_TIERS = Object.freeze({
  VERY_POSITIVE: "VERY_POSITIVE",
  POSITIVE: "POSITIVE",
  NEUTRAL: "NEUTRAL",
  MIXED: "MIXED",
  NEGATIVE: "NEGATIVE",
  VERY_NEGATIVE: "VERY_NEGATIVE",
});

/**
 * Sentiment Labels and Visual Themes
 */
export const SENTIMENT_METADATA = Object.freeze({
  [SENTIMENT_TIERS.VERY_POSITIVE]: {
    label: "Very Positive",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  [SENTIMENT_TIERS.POSITIVE]: {
    label: "Positive",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    dotClass: "bg-teal-500",
  },
  [SENTIMENT_TIERS.NEUTRAL]: {
    label: "Neutral",
    badgeClass: "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
    dotClass: "bg-stone-400",
  },
  [SENTIMENT_TIERS.MIXED]: {
    label: "Mixed Experience",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    dotClass: "bg-amber-500",
  },
  [SENTIMENT_TIERS.NEGATIVE]: {
    label: "Constructive / Critical",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    dotClass: "bg-rose-500",
  },
  [SENTIMENT_TIERS.VERY_NEGATIVE]: {
    label: "Critical Concern",
    badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    dotClass: "bg-red-600",
  },
});

/**
 * Sort Options Enum
 * @readonly
 * @enum {string}
 */
export const SORT_OPTIONS = Object.freeze({
  NEWEST: "newest",
  OLDEST: "oldest",
  HIGHEST: "highest",
  LOWEST: "lowest",
});

/**
 * Empty State Classification Enum
 * @readonly
 * @enum {string}
 */
export const EMPTY_STATE_TYPES = Object.freeze({
  NO_REVIEWS: "no_reviews",
  NO_SEARCH_RESULTS: "no_search_results",
  NO_OWNER_REPLIES: "no_owner_replies",
  NO_LANGUAGE_MATCH: "no_language_match",
  API_UNAVAILABLE: "api_unavailable",
  CACHE_EXPIRED: "cache_expired",
});

/**
 * Error State Classification Enum
 * @readonly
 * @enum {string}
 */
export const ERROR_STATE_TYPES = Object.freeze({
  NETWORK_FAILURE: "network_failure",
  API_UNAVAILABLE: "api_unavailable",
  PERMISSION_DENIED: "permission_denied",
  QUOTA_EXCEEDED: "quota_exceeded",
  MALFORMED_RESPONSE: "malformed_response",
  CACHE_FAILURE: "cache_failure",
});

/**
 * Factory for ReviewAuthor
 * @param {Object} author
 * @returns {Object}
 */
export function createNormalizedAuthor({
  name = "Verified Customer",
  avatarUrl = "",
  isGoogleUser = true,
  reviewCount = 1,
} = {}) {
  return {
    name: String(name).trim() || "Verified Customer",
    avatarUrl: String(avatarUrl).trim(),
    isGoogleUser: Boolean(isGoogleUser),
    reviewCount: Number(reviewCount) || 1,
  };
}

/**
 * Factory for ReviewOwnerResponse
 * @param {Object|null} response
 * @returns {Object|null}
 */
export function createNormalizedOwnerResponse(response) {
  if (!response || !response.text) return null;
  return {
    text: String(response.text).trim(),
    responseDate: response.responseDate ? new Date(response.responseDate).toISOString() : new Date().toISOString(),
    relativeTime: response.relativeTime || "Recently",
    responderName: response.responderName || "Aameena Furniture (Owner)",
    isVerifiedOwner: true,
    isPinned: Boolean(response.isPinned),
  };
}

/**
 * Factory for ReviewSummary
 * @param {Object} summary
 * @returns {Object}
 */
export function createNormalizedSummary({
  text = "",
  sentiment = SENTIMENT_TIERS.POSITIVE,
  keyPoints = [],
  isIssueResolved = false,
} = {}) {
  return {
    text: String(text).trim(),
    sentiment: SENTIMENT_TIERS[sentiment] || SENTIMENT_TIERS.POSITIVE,
    keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
    isIssueResolved: Boolean(isIssueResolved),
  };
}

/**
 * Factory for normalized Review
 * @param {Object} data
 * @returns {Object}
 */
export function createNormalizedReview({
  id,
  author,
  rating = 5,
  text = "",
  originalLanguage = "en",
  language = "en",
  publishDate,
  relativeTime = "Recently",
  absoluteDate = "",
  sentiment = SENTIMENT_TIERS.POSITIVE,
  summary,
  ownerResponse = null,
  helpfulCount = 0,
  googleReviewUrl = "",
  verified = true,
  images = [],
  city = "Solapur",
  furniturePurchased = "",
  woodType = null,
  deliveryDate = null,
  visitedShowroom = false,
  furnitureCategory = "",
  productName = "",
  wouldRecommend = true,
  verificationBadge = null,
} = {}) {
  const cleanText = String(text).trim();
  const charCount = cleanText.length;
  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const isLongReview = charCount > 220;

  return {
    id: String(id),
    author: createNormalizedAuthor(author),
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    text: cleanText,
    originalLanguage: String(originalLanguage || "en").toLowerCase(),
    language: String(language || "en").toLowerCase(),
    publishDate: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString(),
    relativeTime: String(relativeTime),
    absoluteDate: String(absoluteDate),
    sentiment: SENTIMENT_TIERS[sentiment] || SENTIMENT_TIERS.POSITIVE,
    summary: createNormalizedSummary(summary),
    ownerResponse: createNormalizedOwnerResponse(ownerResponse),
    isLongReview,
    characterCount: charCount,
    wordCount,
    readingTimeMinutes,
    helpfulCount: Math.max(0, Number(helpfulCount) || 0),
    googleReviewUrl: String(googleReviewUrl || ""),
    verified: Boolean(verified),
    images: Array.isArray(images) ? images : [],
    city: String(city || "Solapur"),
    furniturePurchased: String(furniturePurchased || productName || ""),
    woodType: woodType ? String(woodType) : null,
    deliveryDate: deliveryDate ? String(deliveryDate) : null,
    visitedShowroom: Boolean(visitedShowroom),
    furnitureCategory: String(furnitureCategory || ""),
    productName: String(productName || furniturePurchased || ""),
    wouldRecommend: Boolean(wouldRecommend),
    verificationBadge: String(verificationBadge || (furniturePurchased || productName ? "VERIFIED_PURCHASE" : (visitedShowroom ? "SHOWROOM_VISIT" : "VERIFIED_PURCHASE"))),
  };
}

/**
 * Factory for ReviewStatistics
 * @param {Object} stats
 * @returns {Object}
 */
export function createNormalizedStatistics({
  averageRating = 5.0,
  totalReviews = 0,
  ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  languageDistribution = { en: 0, hi: 0, mr: 0, other: 0 },
  positivePercentage = 100,
  negativePercentage = 0,
  neutralPercentage = 0,
  latestReviewDate = "",
  overallSentiment = SENTIMENT_TIERS.VERY_POSITIVE,
  ownerReplyCount = 0,
  ownerReplyRate = 0,
} = {}) {
  return {
    averageRating: Number(Number(averageRating).toFixed(1)),
    totalReviews: Number(totalReviews) || 0,
    ratingDistribution: {
      5: Number(ratingDistribution[5]) || 0,
      4: Number(ratingDistribution[4]) || 0,
      3: Number(ratingDistribution[3]) || 0,
      2: Number(ratingDistribution[2]) || 0,
      1: Number(ratingDistribution[1]) || 0,
    },
    languageDistribution: {
      en: Number(languageDistribution.en) || 0,
      hi: Number(languageDistribution.hi) || 0,
      mr: Number(languageDistribution.mr) || 0,
      other: Number(languageDistribution.other) || 0,
    },
    positivePercentage: Math.round(Number(positivePercentage) || 0),
    negativePercentage: Math.round(Number(negativePercentage) || 0),
    neutralPercentage: Math.round(Number(neutralPercentage) || 0),
    latestReviewDate: String(latestReviewDate),
    overallSentiment: SENTIMENT_TIERS[overallSentiment] || SENTIMENT_TIERS.VERY_POSITIVE,
    ownerReplyCount: Number(ownerReplyCount) || 0,
    ownerReplyRate: Math.round(Number(ownerReplyRate) || 0),
  };
}

/**
 * Factory for ReviewFilters state
 * @param {Object} overrides
 * @returns {Object}
 */
export function createDefaultFilters(overrides = {}) {
  return {
    search: "",
    rating: "all", // 'all' | 5 | 4 | 3 | 2 | 1
    language: "all", // 'all' | 'en' | 'hi' | 'mr'
    hasOwnerReply: false,
    onlyPositive: false,
    onlyNegative: false,
    onlyLongReviews: false,
    onlyVerified: false,
    withImages: false,
    woodType: "all",
    city: "all",
    category: "all",
    sortBy: SORT_OPTIONS.NEWEST,
    ...overrides,
  };
}
