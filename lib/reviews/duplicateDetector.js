/**
 * Duplicate Detector for the Aameena Furniture AI Review Generation Layer.
 * Ensures review suggestions never share identical openings, structures, or phrasing.
 */

/**
 * Tokenize and normalize text for semantic overlap calculation
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

/**
 * Extract opening signature (first 4-6 words)
 */
export function getOpeningSignature(text) {
  if (!text) return "";
  const cleaned = text.trim().replace(/\s+/g, " ");
  const words = cleaned.split(" ");
  return words.slice(0, 5).join(" ").toLowerCase();
}

/**
 * Compute Jaccard similarity between two token sets
 */
export function calculateJaccardSimilarity(textA, textB) {
  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = new Set([...tokensA].filter((token) => tokensB.has(token)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}

/**
 * Check if two openings share an identical prefix or root phrase
 */
export function hasDuplicateOpening(textA, textB) {
  const openingA = getOpeningSignature(textA);
  const openingB = getOpeningSignature(textB);

  if (openingA === openingB) return true;

  const wordsA = openingA.split(" ");
  const wordsB = openingB.split(" ");

  // If first 3 words match exactly
  if (wordsA.length >= 3 && wordsB.length >= 3) {
    if (wordsA.slice(0, 3).join(" ") === wordsB.slice(0, 3).join(" ")) {
      return true;
    }
  }

  return false;
}

/**
 * Filter an array of candidate reviews to eliminate duplicates and near-duplicates
 * @param {Array<{ review: string }>} candidates
 * @param {number} maxSimilarityThreshold - default 0.60
 * @returns {Array} Distinct reviews
 */
export function filterDuplicateReviews(candidates = [], maxSimilarityThreshold = 0.58) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return [];
  }

  const distinctReviews = [];

  for (const candidate of candidates) {
    const candidateText = typeof candidate === "string" ? candidate : candidate.review;
    if (!candidateText || candidateText.trim().length < 20) continue;

    let isDuplicate = false;

    for (const accepted of distinctReviews) {
      const acceptedText = typeof accepted === "string" ? accepted : accepted.review;

      // 1. Check opening sentence similarity
      if (hasDuplicateOpening(candidateText, acceptedText)) {
        isDuplicate = true;
        break;
      }

      // 2. Check token vocabulary overlap
      const similarity = calculateJaccardSimilarity(candidateText, acceptedText);
      if (similarity >= maxSimilarityThreshold) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      distinctReviews.push(candidate);
    }
  }

  return distinctReviews;
}
