/**
 * @file duplicateDetector.js
 * Hash-based and similarity-based duplicate review detection engine.
 * Detects identical texts, repeated submissions, and near-duplicates (> 80% similarity).
 */

import crypto from "crypto";

/**
 * Normalize text by lowercasing and removing punctuation/excess whitespace
 * @param {string} text
 * @returns {string}
 */
export function normalizeTextForComparison(text = "") {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, "") // preserves alphanumeric and Devanagari
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generate SHA-256 hash of normalized review text
 * @param {string} text
 * @returns {string}
 */
export function computeTextHash(text = "") {
  const normalized = normalizeTextForComparison(text);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Calculate Jaccard word-level similarity coefficient between two texts (0.0 to 1.0)
 * @param {string} textA
 * @param {string} textB
 * @returns {number}
 */
export function calculateTextSimilarity(textA = "", textB = "") {
  const normA = normalizeTextForComparison(textA);
  const normB = normalizeTextForComparison(textB);

  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;

  const wordsA = new Set(normA.split(" ").filter((w) => w.length > 2));
  const wordsB = new Set(normB.split(" ").filter((w) => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) {
      intersectionCount++;
    }
  }

  const unionSize = wordsA.size + wordsB.size - intersectionCount;
  return unionSize > 0 ? Number((intersectionCount / unionSize).toFixed(2)) : 0.0;
}

/**
 * Detect whether a review text is an exact or near duplicate of any existing reviews
 * @param {string} reviewText - Incoming review text
 * @param {Array<Object>} existingReviews - List of existing review objects
 * @param {number} [threshold=0.80] - Near duplicate threshold (default 80%)
 * @returns {{
 *   isDuplicate: boolean,
 *   isExactDuplicate: boolean,
 *   isNearDuplicate: boolean,
 *   similarityScore: number,
 *   duplicateOfId: string|null,
 *   matchedReviewId: string|null,
 *   reason: string|null,
 *   textHash: string
 * }}
 */
export function detectDuplicate(reviewText = "", existingReviews = [], threshold = 0.8) {
  const textHash = computeTextHash(reviewText);

  if (!Array.isArray(existingReviews) || existingReviews.length === 0) {
    return {
      isDuplicate: false,
      isExactDuplicate: false,
      isNearDuplicate: false,
      similarityScore: 0.0,
      duplicateOfId: null,
      matchedReviewId: null,
      reason: null,
      textHash,
    };
  }

  // 1. Exact Hash Match Check
  for (const existing of existingReviews) {
    const existingHash = existing.textHash || computeTextHash(existing.reviewText || existing.text);
    if (existingHash === textHash) {
      return {
        isDuplicate: true,
        isExactDuplicate: true,
        isNearDuplicate: false,
        similarityScore: 1.0,
        duplicateOfId: existing.id || null,
        matchedReviewId: existing.id || null,
        reason: "Exact duplicate review text already submitted.",
        textHash,
      };
    }
  }

  // 2. Near-Duplicate Fuzzy Similarity Check
  let highestSimilarity = 0.0;
  let matchingId = null;

  for (const existing of existingReviews) {
    const targetText = existing.reviewText || existing.text || "";
    const sim = calculateTextSimilarity(reviewText, targetText);
    if (sim > highestSimilarity) {
      highestSimilarity = sim;
      matchingId = existing.id || null;
    }
  }

  if (highestSimilarity >= threshold) {
    return {
      isDuplicate: true,
      isExactDuplicate: false,
      isNearDuplicate: true,
      similarityScore: highestSimilarity,
      duplicateOfId: matchingId,
      matchedReviewId: matchingId,
      reason: `Near duplicate content detected (${Math.round(highestSimilarity * 100)}% similarity to previous review).`,
      textHash,
    };
  }

  return {
    isDuplicate: false,
    isExactDuplicate: false,
    isNearDuplicate: false,
    similarityScore: highestSimilarity,
    duplicateOfId: null,
    matchedReviewId: null,
    reason: null,
    textHash,
  };
}
