/**
 * @file textMatcher.js
 * High-precision review text matching engine.
 * Supports exact match, whitespace-insensitive match, substring partial match,
 * and token-based semantic similarity scoring (Jaccard + Dice coefficients).
 */

/**
 * Normalize text by lowercasing and stripping non-alphanumeric punctuation
 * @param {string} text
 * @returns {string}
 */
export function normalizeCleanText(text = "") {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Remove ALL whitespace for whitespace-insensitive comparison
 * @param {string} text
 * @returns {string}
 */
export function stripAllWhitespace(text = "") {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/**
 * Extract word tokens from text
 * @param {string} text
 * @returns {Set<string>}
 */
export function extractTokens(text = "") {
  const clean = normalizeCleanText(text);
  const words = clean.split(" ").filter((w) => w.length > 2);
  return new Set(words);
}

/**
 * Calculate Jaccard similarity between two token sets (0.0 to 1.0)
 * @param {Set<string>} setA
 * @param {Set<string>} setB
 * @returns {number}
 */
export function calculateJaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0.0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0.0;
}

/**
 * Calculate overlap ratio relative to the smaller set (Dice / Overlap coefficient)
 * Useful when a user pastes a short excerpt of a longer review.
 * @param {Set<string>} queryTokens
 * @param {Set<string>} targetTokens
 * @returns {number}
 */
export function calculateOverlapCoefficient(queryTokens, targetTokens) {
  if (queryTokens.size === 0 || targetTokens.size === 0) return 0.0;
  let intersection = 0;
  for (const token of queryTokens) {
    if (targetTokens.has(token)) intersection++;
  }
  const minSize = Math.min(queryTokens.size, targetTokens.size);
  return minSize > 0 ? intersection / minSize : 0.0;
}

/**
 * Match a query string against candidate reviews.
 * Returns ranked matches with confidence score, match type, and highlighted excerpt.
 *
 * @param {string} rawQuery - The pasted review text
 * @param {Array<Object>} candidateReviews - Reviews to search through
 * @returns {Array<Object>} Ranked matches
 */
export function matchReviewsByText(rawQuery = "", candidateReviews = []) {
  const query = String(rawQuery || "").trim();
  if (!query || !Array.isArray(candidateReviews) || candidateReviews.length === 0) {
    return [];
  }

  const queryClean = normalizeCleanText(query);
  const queryCondensed = stripAllWhitespace(query);
  const queryTokens = extractTokens(query);

  const scoredResults = [];

  for (const review of candidateReviews) {
    const reviewText = String(review.reviewText || "").trim();
    if (!reviewText) continue;

    const reviewClean = normalizeCleanText(reviewText);
    const reviewCondensed = stripAllWhitespace(reviewText);
    const reviewTokens = extractTokens(reviewText);

    let matchType = "NONE";
    let confidence = 0.0;

    // 1. Exact Match (case & punctuation normalized)
    if (queryClean === reviewClean) {
      matchType = "EXACT";
      confidence = 1.0;
    }
    // 2. Whitespace-insensitive Exact Match
    else if (queryCondensed.length > 10 && queryCondensed === reviewCondensed) {
      matchType = "WHITESPACE_EXACT";
      confidence = 1.0;
    }
    // 3. Substring Partial Match (pasted excerpt is inside the review or vice versa)
    else if (
      queryCondensed.length >= 15 &&
      (reviewCondensed.includes(queryCondensed) || queryCondensed.includes(reviewCondensed))
    ) {
      matchType = "SUBSTRING_PARTIAL";
      const ratio = Math.min(queryCondensed.length, reviewCondensed.length) / Math.max(queryCondensed.length, reviewCondensed.length);
      confidence = Math.max(0.85, Number((0.8 + ratio * 0.2).toFixed(2)));
    }
    // 4. Token Overlap & Semantic Similarity
    else {
      const overlapCoeff = calculateOverlapCoefficient(queryTokens, reviewTokens);
      const jaccard = calculateJaccardSimilarity(queryTokens, reviewTokens);

      // Blend overlap with Jaccard for robust excerpt matching
      const blended = overlapCoeff * 0.7 + jaccard * 0.3;

      if (overlapCoeff >= 0.7 || blended >= 0.45) {
        matchType = "SEMANTIC_SIMILARITY";
        confidence = Number(blended.toFixed(2));
      } else if (overlapCoeff >= 0.4) {
        matchType = "PARTIAL_KEYWORDS";
        confidence = Number((overlapCoeff * 0.7).toFixed(2));
      }
    }

    if (confidence >= 0.35 || matchType !== "NONE") {
      scoredResults.push({
        review,
        matchType,
        confidence: Math.min(1.0, confidence),
        confidencePercent: Math.round(confidence * 100),
      });
    }
  }

  // Sort descending by confidence score
  scoredResults.sort((a, b) => b.confidence - a.confidence);

  return scoredResults;
}
