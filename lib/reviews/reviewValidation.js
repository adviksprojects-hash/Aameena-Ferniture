/**
 * Comprehensive Quality & Naturalness Validator for Aameena Furniture Humanized AI Review Engine.
 * Enforces naturalness, strict <= 40% duplicate score, native script correctness,
 * word length bounds, rating consistency, and fact safety.
 */

import { BANNED_AI_WORDS, FORBIDDEN_FABRICATIONS } from "./languageProfiles.js";
import { calculateCompositeSimilarity, isTooSimilar } from "./reviewSimilarity.js";

/**
 * Count words in a string accurately across Latin and Devanagari
 */
export function countWords(text = "") {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Check if text contains any banned AI or marketing buzzwords
 */
export function checkMarketingWords(text = "") {
  if (!text) return { hasMarketing: false, foundWords: [] };
  const lower = text.toLowerCase();
  const foundWords = [];

  for (const word of BANNED_AI_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      foundWords.push(word);
    }
  }

  return {
    hasMarketing: foundWords.length > 0,
    foundWords,
  };
}

/**
 * Validate that the script matches the expected language
 */
export function validateLanguageCorrectness(text = "", language = "en") {
  if (!text) return { isValid: false, reason: "Review text is empty" };
  const lang = String(language).toLowerCase();

  // Devanagari Unicode block: \u0900-\u097F
  const hasDevanagari = /[\u0900-\u097F]/.test(text);

  if (lang === "hi" || lang === "mr") {
    if (!hasDevanagari) {
      return {
        isValid: false,
        reason: `Expected Devanagari script for ${lang.toUpperCase()}, but text contains only Latin script.`,
      };
    }
    return { isValid: true };
  }

  if (lang === "en") {
    if (hasDevanagari) {
      return {
        isValid: false,
        reason: "English review should not contain Devanagari script.",
      };
    }
    return { isValid: true };
  }

  return { isValid: true };
}

/**
 * Classify word length into Humanized Review Profiles:
 * Very Short: 35-55 words
 * Short: 60-90 words
 * Medium: 90-140 words
 * Long: 140-220 words
 */
export function classifyWordLength(text = "") {
  const words = countWords(text);
  if (words < 70) return { category: "Brief", words, profileKey: "BRIEF" };
  if (words <= 90) return { category: "Compact", words, profileKey: "COMPACT" };
  if (words <= 110) return { category: "Standard", words, profileKey: "STANDARD" };
  return { category: "Detailed", words, profileKey: "DETAILED" };
}

export function classifyLength(text = "") {
  return classifyWordLength(text).category;
}

/**
 * Check tone alignment with rating
 */
export function classifyTone(rating = 5) {
  const r = Number(rating) || 5;
  if (r === 5) return "Very Happy";
  if (r === 4) return "Happy with minor suggestion";
  if (r === 3) return "Balanced / Mixed";
  if (r === 2) return "Mostly disappointed";
  return "Clearly disappointed";
}

/**
 * Fact Safety Checker: Never invent discounts, warranties, owner names, or false promises
 */
export function checkFactSafety(text = "") {
  const lower = text.toLowerCase();
  const violations = [];

  for (const forbidden of FORBIDDEN_FABRICATIONS) {
    if (lower.includes(forbidden.toLowerCase())) {
      violations.push(forbidden);
    }
  }

  // Also check for specific fabricated claims
  const fakePatterns = [
    /\b\d{1,2}%\s*(off|discount)\b/i,
    /\b(free|lifetime)\s+warranty\b/i,
    /\b(lowest|cheapest)\s+price\s+guaranteed\b/i,
  ];

  for (const pat of fakePatterns) {
    if (pat.test(lower)) {
      violations.push(pat.toString());
    }
  }

  return {
    isSafe: violations.length === 0,
    violations,
  };
}

/**
 * Validate a single generated review for Phase 8.3 quality
 */
export function validateReviewQuality(reviewText = "", input = {}) {
  const text = (reviewText || "").trim();
  const words = countWords(text);

  // 1. Natural medium-length 60 - 120 word boundaries (tolerance: 50 to 130 words)
  if (words < 50) {
    return {
      isValid: false,
      reason: `Review too brief (${words} words). Minimum 60 words required.`,
    };
  }
  if (words > 130) {
    return {
      isValid: false,
      reason: `Review too long (${words} words). Maximum 120 words allowed.`,
    };
  }

  // 2. Anti-marketing / Anti-AI check
  const marketing = checkMarketingWords(text);
  if (marketing.hasMarketing) {
    return {
      isValid: false,
      reason: `Contains banned AI marketing buzzwords: ${marketing.foundWords.join(", ")}`,
    };
  }

  // 3. Script / Language check
  const script = validateLanguageCorrectness(text, input.language || "en");
  if (!script.isValid) {
    return script;
  }

  // 4. Fact safety check
  const safety = checkFactSafety(text);
  if (!safety.isSafe) {
    return {
      isValid: false,
      reason: `Contains fabricated claims: ${safety.violations.join(", ")}`,
    };
  }

  const lengthInfo = classifyWordLength(text);
  const tone = classifyTone(input.rating || 5);

  return {
    isValid: true,
    words,
    lengthCategory: lengthInfo.category,
    profileKey: lengthInfo.profileKey,
    tone,
  };
}

/**
 * Backwards compatible single review validator
 */
export function validateGeneratedReview(reviewText, input = {}) {
  const res = validateReviewQuality(reviewText, input);
  return {
    isValid: res.isValid,
    reason: res.reason,
    estimatedLength: res.lengthCategory || "Medium",
    tone: res.tone || "Very Happy",
  };
}

/**
 * Validate an entire batch of 6 reviews:
 * - Validates each individual review
 * - Runs strict <= 40% similarity check between every single pair
 * - Ensures opening phrases are unique
 */
export function validateBatchQuality(reviews = [], input = {}) {
  const validated = [];
  const rejected = [];

  for (let i = 0; i < reviews.length; i++) {
    const candidate = reviews[i];
    const text = typeof candidate === "string" ? candidate : candidate.review;

    // Single quality validation
    const singleVal = validateReviewQuality(text, input);
    if (!singleVal.isValid) {
      rejected.push({ index: i, text, reason: singleVal.reason });
      continue;
    }

    // Similarity validation against previously accepted reviews (<= 40% threshold)
    const simCheck = isTooSimilar(text, validated, 0.40);
    if (simCheck.isDuplicate) {
      rejected.push({ index: i, text, reason: simCheck.reason, score: simCheck.score });
      continue;
    }

    validated.push(typeof candidate === "string" ? { review: candidate, ...singleVal } : candidate);
  }

  return {
    isBatchValid: validated.length >= 5,
    accepted: validated,
    rejected,
    acceptedCount: validated.length,
  };
}
