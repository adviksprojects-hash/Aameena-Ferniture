/**
 * @file sentimentAnalyzer.js
 * 6-tier sentiment analysis engine for Google Reviews.
 * Combines customer star rating with contextual linguistic markers.
 */

import { SENTIMENT_TIERS } from "../types/reviewTypes.js";

const VERY_POSITIVE_KEYWORDS = [
  "world-class",
  "exceptional",
  "outstanding",
  "breathtaking",
  "flawless",
  "heirloom",
  "perfection",
  "masterpiece",
  "unbeatable",
  "exceeded",
  "best furniture",
  "highly recommend",
  "superb",
  "magnificent",
  "royal",
  "top notch",
  "100% genuine",
  "pure teak",
  "sagwan",
  "flawless finish",
  "अतिशय सुंदर",
  "उत्कृष्ट",
  "शानदार",
  "सर्वोत्तम",
];

const MIXED_KEYWORDS = [
  "but",
  "however",
  "although",
  "though",
  "suggest",
  "suggested",
  "suggestion",
  "improve",
  "improvement",
  "delay",
  "delayed",
  "late delivery",
  "communication",
  "follow up",
  "waiting",
  "slow",
  "bit pricey",
  "could be better",
  "पण",
  "वेळ लागला",
  "सुधारणा",
  "लेकिन",
  "देरी",
];

const VERY_NEGATIVE_KEYWORDS = [
  "worst",
  "terrible",
  "horrible",
  "cheat",
  "fraud",
  "fake",
  "defective",
  "broken",
  "waste of money",
  "unacceptable",
  "damaged",
  "disaster",
  "never again",
  "खराब",
  "फसवणूक",
  "बकवास",
];

/**
 * Classify a review into one of the 6 sentiment tiers
 * @param {number} rating - Star rating (1-5)
 * @param {string} text - Review text content
 * @returns {string} One of SENTIMENT_TIERS
 */
export function analyzeSentiment(rating, text = "") {
  const score = Number(rating) || 5;
  const lower = String(text || "").toLowerCase();

  // 1 Star ratings
  if (score === 1) {
    const hasExtremeNegative = VERY_NEGATIVE_KEYWORDS.some((kw) => lower.includes(kw));
    return hasExtremeNegative ? SENTIMENT_TIERS.VERY_NEGATIVE : SENTIMENT_TIERS.NEGATIVE;
  }

  // 2 Star ratings
  if (score === 2) {
    const hasMixedPositive = lower.includes("quality") || lower.includes("wood") || lower.includes("design");
    return hasMixedPositive ? SENTIMENT_TIERS.MIXED : SENTIMENT_TIERS.NEGATIVE;
  }

  // 3 Star ratings
  if (score === 3) {
    const isMixed = MIXED_KEYWORDS.some((kw) => lower.includes(kw));
    return isMixed ? SENTIMENT_TIERS.MIXED : SENTIMENT_TIERS.NEUTRAL;
  }

  // 4 Star ratings
  if (score === 4) {
    const hasMixedSuggestion = MIXED_KEYWORDS.some((kw) => lower.includes(kw));
    return hasMixedSuggestion ? SENTIMENT_TIERS.MIXED : SENTIMENT_TIERS.POSITIVE;
  }

  // 5 Star ratings
  if (score >= 5) {
    const hasHighPraise = VERY_POSITIVE_KEYWORDS.some((kw) => lower.includes(kw));
    return hasHighPraise ? SENTIMENT_TIERS.VERY_POSITIVE : SENTIMENT_TIERS.POSITIVE;
  }

  return SENTIMENT_TIERS.POSITIVE;
}
