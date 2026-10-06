/**
 * @file filterSorter.js
 * Pure functions for searching, filtering, and sorting Google reviews.
 * Decoupled from UI components for testability and performance.
 */

import { SENTIMENT_TIERS, SORT_OPTIONS } from "../types/reviewTypes.js";

/**
 * Filter an array of normalized reviews based on user criteria
 * @param {Array<Object>} reviews - List of Review objects
 * @param {Object} filters - Active ReviewFilters
 * @returns {Array<Object>} Filtered list
 */
export function filterReviews(reviews = [], filters = {}) {
  if (!Array.isArray(reviews)) return [];

  const {
    search = "",
    rating = "all",
    language = "all",
    hasOwnerReply = false,
    onlyPositive = false,
    onlyNegative = false,
    onlyLongReviews = false,
  } = filters;

  const cleanSearch = String(search || "").trim().toLowerCase();

  return reviews.filter((review) => {
    // 1. Text Search across multiple fields
    if (cleanSearch) {
      const matchText = review.text && review.text.toLowerCase().includes(cleanSearch);
      const matchAuthor = review.author && review.author.name.toLowerCase().includes(cleanSearch);
      const matchSummary = review.summary && review.summary.text.toLowerCase().includes(cleanSearch);
      const matchOwner = review.ownerResponse && review.ownerResponse.text.toLowerCase().includes(cleanSearch);
      const matchLanguage = (review.language && review.language.toLowerCase().includes(cleanSearch)) ||
        (cleanSearch === "english" && review.language === "en") ||
        (cleanSearch === "hindi" && review.language === "hi") ||
        (cleanSearch === "marathi" && review.language === "mr");

      // Match rating search (e.g., "5 star", "5", "star 4")
      const matchRating = cleanSearch.includes(`${review.rating}`) ||
        cleanSearch === `${review.rating} star` ||
        cleanSearch === `${review.rating} stars`;

      if (!matchText && !matchAuthor && !matchSummary && !matchOwner && !matchLanguage && !matchRating) {
        return false;
      }
    }

    // 2. Rating Filter (1, 2, 3, 4, 5)
    if (rating !== "all" && Number(rating) > 0) {
      if (review.rating !== Number(rating)) {
        return false;
      }
    }

    // 3. Language Filter ('en', 'hi', 'mr')
    if (language !== "all") {
      if (review.language !== String(language).toLowerCase()) {
        return false;
      }
    }

    // 4. Owner Reply Filter
    if (hasOwnerReply) {
      if (!review.ownerResponse || !review.ownerResponse.text) {
        return false;
      }
    }

    // 5. Only Positive Filter
    if (onlyPositive) {
      const isPositive =
        review.sentiment === SENTIMENT_TIERS.POSITIVE ||
        review.sentiment === SENTIMENT_TIERS.VERY_POSITIVE ||
        review.rating >= 4;
      if (!isPositive) return false;
    }

    // 6. Only Negative / Constructive Filter
    if (onlyNegative) {
      const isNegative =
        review.sentiment === SENTIMENT_TIERS.NEGATIVE ||
        review.sentiment === SENTIMENT_TIERS.VERY_NEGATIVE ||
        review.sentiment === SENTIMENT_TIERS.MIXED ||
        review.rating <= 3;
      if (!isNegative) return false;
    }

    // 7. Only Long Reviews (> 220 chars)
    if (onlyLongReviews) {
      if (!review.isLongReview && (review.characterCount || 0) <= 220) {
        return false;
      }
    }

    // 8. Verified Only Filter (Phase 8.3 Issue 7)
    if (filters.onlyVerified || filters.verified) {
      if (!review.verified) {
        return false;
      }
    }

    // 9. With Images Filter (Phase 8.3 Issue 7)
    if (filters.withImages || filters.hasImages) {
      if (!review.images || !Array.isArray(review.images) || review.images.length === 0) {
        return false;
      }
    }

    // 10. Wood Type Filter
    if (filters.woodType && filters.woodType !== "all") {
      const matchWood =
        (review.woodType && review.woodType.toLowerCase().includes(filters.woodType.toLowerCase())) ||
        (review.text && review.text.toLowerCase().includes(filters.woodType.toLowerCase()));
      if (!matchWood) return false;
    }

    // 11. City Filter
    if (filters.city && filters.city !== "all") {
      const matchCity =
        (review.city && review.city.toLowerCase().includes(filters.city.toLowerCase())) ||
        (review.text && review.text.toLowerCase().includes(filters.city.toLowerCase()));
      if (!matchCity) return false;
    }

    // 12. Category Filter
    if (filters.category && filters.category !== "all") {
      const matchCat =
        (review.furnitureCategory && review.furnitureCategory.toLowerCase().includes(filters.category.toLowerCase())) ||
        (review.furniturePurchased && review.furniturePurchased.toLowerCase().includes(filters.category.toLowerCase())) ||
        (review.text && review.text.toLowerCase().includes(filters.category.toLowerCase()));
      if (!matchCat) return false;
    }

    return true;
  });
}

/**
 * Sort an array of normalized reviews
 * @param {Array<Object>} reviews - List of Review objects
 * @param {string} sortBy - One of SORT_OPTIONS
 * @returns {Array<Object>} Sorted list
 */
export function sortReviews(reviews = [], sortBy = SORT_OPTIONS.NEWEST) {
  if (!Array.isArray(reviews)) return [];
  const copy = [...reviews];

  switch (sortBy) {
    case SORT_OPTIONS.NEWEST:
      return copy.sort((a, b) => {
        const timeA = new Date(a.publishDate).getTime();
        const timeB = new Date(b.publishDate).getTime();
        return timeB - timeA;
      });

    case SORT_OPTIONS.OLDEST:
      return copy.sort((a, b) => {
        const timeA = new Date(a.publishDate).getTime();
        const timeB = new Date(b.publishDate).getTime();
        return timeA - timeB;
      });

    case SORT_OPTIONS.HIGHEST:
      return copy.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      });

    case SORT_OPTIONS.LOWEST:
      return copy.sort((a, b) => {
        if (a.rating !== b.rating) {
          return a.rating - b.rating;
        }
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      });

    default:
      return copy;
  }
}
