/**
 * Word count length profiles and sentence pacing guidelines
 * for Aameena Furniture Humanized AI Review Engine (Phase 8.3).
 * Strictly guarantees authentic reviews within the 120-220 word boundaries.
 */

export const REVIEW_LENGTH_PROFILES = {
  COMPACT: {
    key: "Compact",
    label: "Focused Review",
    minWords: 120,
    maxWords: 145,
    targetSentences: 5,
    desc: "5-6 concise sentences covering visit, timber quality, and satisfaction",
  },
  STANDARD: {
    key: "Standard",
    label: "Balanced Story",
    minWords: 140,
    maxWords: 175,
    targetSentences: 7,
    desc: "6-8 balanced sentences covering visit, pricing, timber seasoning, and setup",
  },
  DETAILED: {
    key: "Detailed",
    label: "In-Depth Account",
    minWords: 170,
    maxWords: 200,
    targetSentences: 8,
    desc: "7-9 narrative sentences with backstory, joinery inspection, and recommendation",
  },
  COMPREHENSIVE: {
    key: "Comprehensive",
    label: "Heirloom Narrative",
    minWords: 190,
    maxWords: 220,
    targetSentences: 9,
    desc: "8-10 rich sentences covering workshop visit, woodwork specs, delivery, and advice",
  },
};

export const LENGTH_KEYS = ["COMPACT", "STANDARD", "DETAILED", "COMPREHENSIVE"];

/**
 * Classify a review text into its corresponding word length bucket
 */
export function classifyWordCount(text = "") {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const count = words.length;

  if (count < 120) return "Short";
  if (count <= 150) return "Compact (120-150 words)";
  if (count <= 180) return "Standard (150-180 words)";
  if (count <= 220) return "Detailed (180-220 words)";
  return "Extended (>220 words)";
}
