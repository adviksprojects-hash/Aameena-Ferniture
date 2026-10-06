/**
 * Multi-dimensional Randomization Engine for Aameena Furniture Humanized AI Review Engine.
 * Shuffles writing styles, sentence counts, personality angles, and imperfections
 * to guarantee that no two reviews ever follow the same structure or cadence.
 */

import { REVIEW_PERSONALITIES } from "./reviewPersonalities.js";
import { LENGTH_KEYS, REVIEW_LENGTH_PROFILES } from "./reviewLengthProfiles.js";
import { NATURAL_IMPERFECTIONS } from "./languageProfiles.js";

export const WRITING_STYLES = [
  { id: "story_style", name: "Story Narrative", cadence: "chronological, setup -> experience -> outcome" },
  { id: "direct_review", name: "Direct & Factual", cadence: "concise, straight to the point, zero fluff" },
  { id: "conversational", name: "Conversational & Candid", cadence: "dialogue tone, casual pauses, warm" },
  { id: "opinion_style", name: "Evaluative Opinion", cadence: "pros/cons, practical value assessment" },
  { id: "reflection", name: "Generational Reflection", cadence: "contrasting old vs modern wood standards" },
  { id: "recommendation", name: "Advice to Future Buyers", cadence: "practical tips, showroom advice" },
  { id: "thank_you_style", name: "Appreciative Patron", cadence: "warm community appreciation" },
];

/**
 * Modern Fisher-Yates array shuffle
 */
export function shuffleArray(arr = []) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pick a random item from array
 */
export function pickRandom(arr = []) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate 6 distinct style blueprints for a batch generation
 */
export function generateReviewBlueprints(count = 6) {
  const shuffledPersonalities = shuffleArray(REVIEW_PERSONALITIES);
  const shuffledStyles = shuffleArray(WRITING_STYLES);
  // Deliberately distribute lengths across all profiles with randomized order
  const lengthPool = shuffleArray(["VERY_SHORT", "SHORT", "MEDIUM", "MEDIUM", "LONG", "SHORT"]);

  const blueprints = [];

  for (let i = 0; i < count; i++) {
    const lengthKey = lengthPool[i % lengthPool.length];
    const lengthProfile = REVIEW_LENGTH_PROFILES[lengthKey] || REVIEW_LENGTH_PROFILES.MEDIUM;

    blueprints.push({
      slot: i + 1,
      personality: shuffledPersonalities[i % shuffledPersonalities.length],
      style: shuffledStyles[i % shuffledStyles.length],
      lengthProfile,
      useImperfection: i % 2 === 0, // Natural imperfection in 50% of reviews
      sentenceOrder: i % 3, // 0: Opening -> Body -> Closing; 1: Context -> Opening -> Closing; 2: Experience -> Note -> Conclusion
      commaCadence: i % 2 === 0 ? "relaxed" : "crisp",
    });
  }

  return blueprints;
}

/**
 * Inject a subtle human conversational imperfection word into a sentence
 */
export function injectNaturalImperfection(sentence = "", language = "en") {
  const words = NATURAL_IMPERFECTIONS[language] || NATURAL_IMPERFECTIONS.en;
  const picked = pickRandom(words);

  if (!picked || !sentence) return sentence;

  // Insert cleanly at start or after first comma
  if (language === "en") {
    const capitalized = picked.charAt(0).toUpperCase() + picked.slice(1);
    if (Math.random() > 0.5) {
      return `${capitalized}, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
    }
  }

  return sentence;
}
