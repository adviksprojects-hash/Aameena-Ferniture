/**
 * @file enterpriseReviewSearch.js
 * Advanced Multi-Dimensional Review Search Engine.
 * Supports token matching, multi-attribute indexing (author, review text, wood species,
 * furniture category, city, artisan/staff, owner response), date ranges, rating bounds,
 * and XSS-safe text match segmentation for visual highlighting.
 */

/**
 * Tokenize a search string into unique lowercase keywords, stripping common punctuation.
 * @param {string} str
 * @returns {string[]}
 */
export function tokenizeQuery(str = "") {
  if (!str || typeof str !== "string") return [];
  return str
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, " ") // retain alphanumeric and Devanagari script
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

/**
 * Highlight matches safely by splitting text into structured segments.
 * Returns an array of `{ text: string, isMatch: boolean }`.
 * Completely XSS-immune without dangerouslySetInnerHTML.
 *
 * @param {string} text
 * @param {string|string[]} queryOrTokens
 * @returns {Array<{ text: string, isMatch: boolean }>}
 */
export function highlightSearchMatches(text = "", queryOrTokens = "") {
  if (!text) return [];
  const tokens = Array.isArray(queryOrTokens)
    ? queryOrTokens.filter(Boolean)
    : tokenizeQuery(queryOrTokens);

  if (tokens.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Escape regex special chars
  const escapedTokens = tokens.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");

  const parts = text.split(regex);
  const segments = [];

  for (const part of parts) {
    if (!part) continue;
    const lower = part.toLowerCase();
    const isMatch = tokens.some((t) => t.toLowerCase() === lower);
    segments.push({ text: part, isMatch });
  }

  return segments;
}

/**
 * Calculate match relevance score between review and tokens.
 * @param {Object} review
 * @param {string[]} tokens
 * @param {string} rawQuery
 * @returns {number} Score (higher is better, 0 means no match)
 */
function scoreReviewRelevance(review, tokens, rawQuery = "") {
  if (tokens.length === 0) return 1;

  const rawLower = rawQuery.toLowerCase().trim();
  const author = String(review.author?.name || review.reviewerName || "").toLowerCase();
  const text = String(review.text || review.reviewText || "").toLowerCase();
  const product = String(review.furniturePurchased || review.productName || "").toLowerCase();
  const category = String(review.furnitureCategory || review.category || "").toLowerCase();
  const wood = String(review.woodType || "").toLowerCase();
  const city = String(review.city || "").toLowerCase();
  const staff = String(review.staffName || "").toLowerCase();
  const reply = String(review.ownerReply || "").toLowerCase();

  const fullCorpus = `${author} ${text} ${product} ${category} ${wood} ${city} ${staff} ${reply}`;

  let score = 0;

  // 1. Exact raw query match in text or author
  if (rawLower && fullCorpus.includes(rawLower)) {
    score += 50;
  }
  if (rawLower && author.includes(rawLower)) {
    score += 50;
  }
  if (rawLower && product.includes(rawLower)) {
    score += 40;
  }
  if (rawLower && wood.includes(rawLower)) {
    score += 30;
  }

  // 2. Token scoring
  let matchedTokensCount = 0;
  for (const token of tokens) {
    let tokenScore = 0;
    if (author.includes(token)) tokenScore += 20;
    if (product.includes(token)) tokenScore += 15;
    if (wood.includes(token)) tokenScore += 15;
    if (category.includes(token)) tokenScore += 10;
    if (city.includes(token)) tokenScore += 10;
    if (text.includes(token)) tokenScore += 5;
    if (reply.includes(token)) tokenScore += 5;
    if (staff.includes(token)) tokenScore += 8;

    if (tokenScore > 0) {
      matchedTokensCount++;
      score += tokenScore;
    }
  }

  // Require at least one token to match
  if (matchedTokensCount === 0) return 0;

  // Bonus if all tokens matched
  if (matchedTokensCount === tokens.length) {
    score += 25;
  }

  return score;
}

/**
 * Filter and sort a collection of reviews using advanced multi-dimensional criteria.
 *
 * @param {Array<Object>} reviews
 * @param {Object} options
 * @param {string} [options.query]
 * @param {number|string} [options.rating] - 'ALL' or 1..5
 * @param {string} [options.woodType] - 'ALL' or specific species (e.g. 'Sagwan Teak')
 * @param {string} [options.category] - 'ALL' or specific category
 * @param {string} [options.city] - 'ALL' or city name
 * @param {boolean} [options.isVerified] - true if verified purchase only
 * @param {boolean} [options.hasOwnerReply] - true if reply present
 * @param {boolean} [options.hasImages] - true if review contains photo attachments
 * @param {string|Date} [options.startDate]
 * @param {string|Date} [options.endDate]
 * @param {string} [options.sortBy] - 'relevance' | 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
 * @returns {Array<Object>}
 */
export function searchReviews(reviews = [], options = {}) {
  if (!Array.isArray(reviews) || reviews.length === 0) return [];

  const {
    query = "",
    rating = "ALL",
    woodType = "ALL",
    category = "ALL",
    city = "ALL",
    isVerified,
    hasOwnerReply,
    hasImages,
    startDate,
    endDate,
    sortBy = "relevance",
  } = options;

  const tokens = tokenizeQuery(query);
  const startTs = startDate ? new Date(startDate).getTime() : null;
  const endTs = endDate ? new Date(endDate).getTime() : null;

  // 1. Filter
  const scoredItems = [];

  for (const review of reviews) {
    // Rating filter
    if (rating && rating !== "ALL") {
      const numRating = Number(rating);
      if (Number(review.rating) !== numRating) continue;
    }

    // Wood Type
    if (woodType && woodType !== "ALL") {
      const reviewWood = String(review.woodType || "").toLowerCase();
      if (!reviewWood.includes(String(woodType).toLowerCase())) continue;
    }

    // Category
    if (category && category !== "ALL") {
      const revCat = String(review.furnitureCategory || review.category || "").toLowerCase();
      if (!revCat.includes(String(category).toLowerCase())) continue;
    }

    // City
    if (city && city !== "ALL") {
      const revCity = String(review.city || "").toLowerCase();
      if (!revCity.includes(String(city).toLowerCase())) continue;
    }

    // Verified purchase check
    if (isVerified === true) {
      const verified = review.isVerifiedPurchase ?? review.author?.isLocalGuide ?? true;
      if (!verified) continue;
    }

    // Has owner reply
    if (hasOwnerReply === true) {
      if (!review.ownerReply) continue;
    }

    // Has images
    if (hasImages === true) {
      const imgs = review.images || review.media || [];
      if (!Array.isArray(imgs) || imgs.length === 0) continue;
    }

    // Date range
    if (startTs || endTs) {
      const reviewDate = review.createdAt || review.publishedAt || review.date;
      const reviewTs = reviewDate ? new Date(reviewDate).getTime() : 0;
      if (startTs && reviewTs < startTs) continue;
      if (endTs && reviewTs > endTs) continue;
    }

    // Relevance score
    const score = scoreReviewRelevance(review, tokens, query);
    if (tokens.length > 0 && score <= 0) continue;

    scoredItems.push({ review, score });
  }

  // 2. Sort
  scoredItems.sort((a, b) => {
    if (sortBy === "relevance" && tokens.length > 0) {
      return b.score - a.score;
    }
    if (sortBy === "newest") {
      const tA = new Date(a.review.createdAt || a.review.date || 0).getTime();
      const tB = new Date(b.review.createdAt || b.review.date || 0).getTime();
      return tB - tA;
    }
    if (sortBy === "oldest") {
      const tA = new Date(a.review.createdAt || a.review.date || 0).getTime();
      const tB = new Date(b.review.createdAt || b.review.date || 0).getTime();
      return tA - tB;
    }
    if (sortBy === "rating_high") {
      return (Number(b.review.rating) || 0) - (Number(a.review.rating) || 0);
    }
    if (sortBy === "rating_low") {
      return (Number(a.review.rating) || 0) - (Number(b.review.rating) || 0);
    }
    if (sortBy === "helpful") {
      return (Number(b.review.helpfulCount) || 0) - (Number(a.review.helpfulCount) || 0);
    }
    // Default fallback: newest
    const tA = new Date(a.review.createdAt || a.review.date || 0).getTime();
    const tB = new Date(b.review.createdAt || b.review.date || 0).getTime();
    return tB - tA;
  });

  return scoredItems.map((item) => item.review);
}

const enterpriseReviewSearch = {
  tokenizeQuery,
  highlightSearchMatches,
  searchReviews,
};

export default enterpriseReviewSearch;
