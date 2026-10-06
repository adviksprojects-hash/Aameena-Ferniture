/**
 * Review Similarity & Duplicate Detection Engine for Aameena Furniture Humanized AI Review Engine.
 * Enforces strict < 40% similarity threshold between all generated review candidates.
 */

/**
 * Tokenize text for semantic similarity comparison across English, Hindi, and Marathi
 */
export function extractContentTokens(text = "") {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Extract word bigrams for structural flow comparison
 */
export function extractBigrams(tokens = []) {
  const bigrams = new Set();
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.add(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

/**
 * Compute Jaccard token overlap between two texts (0.0 to 1.0)
 */
export function computeJaccardSimilarity(textA = "", textB = "") {
  const tokensA = new Set(extractContentTokens(textA));
  const tokensB = new Set(extractContentTokens(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}

/**
 * Compute Bigram Dice coefficient for structural sequence similarity
 */
export function computeBigramSimilarity(textA = "", textB = "") {
  const tokensA = extractContentTokens(textA);
  const tokensB = extractContentTokens(textB);

  const bigramsA = extractBigrams(tokensA);
  const bigramsB = extractBigrams(tokensB);

  if (bigramsA.size === 0 || bigramsB.size === 0) return 0;

  let common = 0;
  for (const b of bigramsA) {
    if (bigramsB.has(b)) common++;
  }

  return (2 * common) / (bigramsA.size + bigramsB.size);
}

/**
 * Calculate composite similarity score (weighted Jaccard + Bigram)
 */
export function calculateCompositeSimilarity(textA = "", textB = "") {
  const jaccard = computeJaccardSimilarity(textA, textB);
  const bigram = computeBigramSimilarity(textA, textB);
  // 60% token overlap, 40% bigram flow
  return 0.6 * jaccard + 0.4 * bigram;
}

/**
 * Check if the opening 4 words are too similar
 */
export function hasMatchingOpeningPrefix(textA = "", textB = "") {
  const cleanA = textA.trim().replace(/\s+/g, " ").toLowerCase().split(" ").slice(0, 4).join(" ");
  const cleanB = textB.trim().replace(/\s+/g, " ").toLowerCase().split(" ").slice(0, 4).join(" ");

  return cleanA.length > 8 && cleanB.length > 8 && cleanA === cleanB;
}

/**
 * Check if two texts share any identical sentence of significant length
 */
export function hasOverlappingSentences(textA = "", textB = "") {
  const sentencesA = textA
    .split(/[.!?।]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 18);
  const sentencesB = textB
    .split(/[.!?।]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 18);

  for (const sA of sentencesA) {
    for (const sB of sentencesB) {
      if (sA === sB) return true;
    }
  }
  return false;
}

/**
 * Determine if a review candidate exceeds the 40% similarity threshold with any accepted review
 */
export function isTooSimilar(candidateText, acceptedReviews = [], threshold = 0.40) {
  for (const accepted of acceptedReviews) {
    const acceptedText = typeof accepted === "string" ? accepted : accepted.review;

    // Check opening matching
    if (hasMatchingOpeningPrefix(candidateText, acceptedText)) {
      return { isDuplicate: true, reason: "Identical opening phrase", score: 1.0 };
    }

    // Check sentence overlap
    if (hasOverlappingSentences(candidateText, acceptedText)) {
      return { isDuplicate: true, reason: "Overlapping identical sentence found", score: 0.95 };
    }

    // Check composite similarity
    const score = calculateCompositeSimilarity(candidateText, acceptedText);
    if (score >= threshold) {
      return { isDuplicate: true, reason: `Similarity score ${(score * 100).toFixed(1)}% exceeds 40% threshold`, score };
    }
  }

  return { isDuplicate: false, score: 0 };
}
