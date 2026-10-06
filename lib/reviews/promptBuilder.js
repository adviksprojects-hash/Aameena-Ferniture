/**
 * Dynamic Prompt Builder for Aameena Furniture Humanized AI Review Engine (Phase 5).
 * Dynamically builds context-aware (Case 1) and rating-only showroom (Case 2) prompts.
 * Strictly omits missing fields — NEVER inserts 'Unknown', 'N/A', 'Null', or 'Empty'.
 */

import { BANNED_AI_WORDS, LANGUAGE_PROFILES } from "./languageProfiles.js";

/**
 * Sanitize and normalize input payload for Phase 5.
 * Category, product, customProduct, experience, and notes are completely optional.
 */
export function sanitizeReviewInput(rawInput = {}) {
  const ratingNum = Number(rawInput.rating);
  const rating = !isNaN(ratingNum) ? Math.max(1, Math.min(5, ratingNum)) : 5;

  const rawLang = String(rawInput.language || "en").toLowerCase();
  const language = ["en", "hi", "mr"].includes(rawLang) ? rawLang : "en";

  const category =
    rawInput.category && String(rawInput.category).trim() !== "" && rawInput.category !== "All"
      ? String(rawInput.category).trim()
      : null;

  const product =
    rawInput.product && String(rawInput.product).trim() !== ""
      ? String(rawInput.product).trim()
      : null;

  const customProduct =
    rawInput.customProduct && String(rawInput.customProduct).trim() !== ""
      ? String(rawInput.customProduct).trim()
      : null;

  const experience = Array.isArray(rawInput.experience)
    ? rawInput.experience.map((e) => String(e).trim()).filter(Boolean)
    : [];

  const additionalFeedback =
    rawInput.additionalFeedback && String(rawInput.additionalFeedback).trim() !== ""
      ? String(rawInput.additionalFeedback).trim()
      : null;

  // Determine target item display name without ever using "Custom Product"
  let targetItem = null;
  if (customProduct) {
    targetItem = customProduct;
  } else if (product) {
    targetItem = product;
  } else if (category) {
    targetItem = `${category} furniture`;
  }

  const isRatingOnly = !category && !product && !customProduct && experience.length === 0 && !additionalFeedback;

  return {
    rating,
    language,
    category,
    product,
    customProduct,
    targetItem,
    experience,
    additionalFeedback,
    isRatingOnly,
  };
}

/**
 * Rating awareness directives matching exact Phase 5 specifications:
 * 5 Stars: Very happy
 * 4 Stars: Happy with minor suggestion
 * 3 Stars: Balanced / Mixed experience
 * 2 Stars: Mostly disappointed
 * 1 Star: Clearly disappointed
 */
export const RATING_TONE_DIRECTIVES = {
  5: {
    label: "5 Stars (★★★★★)",
    tone: "Very happy",
    guideline: "The customer is genuinely satisfied with their experience. Keep praise understated, authentic, and grounded without over-the-top hype.",
  },
  4: {
    label: "4 Stars (★★★★☆)",
    tone: "Happy with minor suggestion",
    guideline: "The customer is pleased with the furniture and overall dealing, but includes a sensible, minor suggestion (e.g., slight scheduling delay, showroom parking, or wanting quicker phone updates).",
  },
  3: {
    label: "3 Stars (★★★☆☆)",
    tone: "Balanced / Mixed experience",
    guideline: "A fair, honest, and balanced review mentioning both positive aspects and clear areas where expectations were only partially met. Realistic and neutral.",
  },
  2: {
    label: "2 Stars (★★☆☆☆)",
    tone: "Mostly disappointed",
    guideline: "The customer felt the experience fell short of expectations. Expressed calmly, respectfully, but clearly pointing out issues.",
  },
  1: {
    label: "1 Star (★☆☆☆☆)",
    tone: "Clearly disappointed",
    guideline: "Unhappy experience shared constructively and respectfully without aggressive abuse. Focuses on specific service or quality let-downs.",
  },
};

// In-memory cache for prompt memoization
const promptCache = new Map();

function createCacheKey(input) {
  return `${input.rating}|${input.category || ""}|${input.product || ""}|${input.customProduct || ""}|${input.language}|${input.experience.join(",")}|${input.additionalFeedback || ""}`;
}

/**
 * Dedicated Dynamic Prompt Builder
 * Only includes available information. Strictly omits missing fields.
 */
export function buildReviewPrompt(rawInput = {}) {
  const input = sanitizeReviewInput(rawInput);
  const cacheKey = createCacheKey(input);

  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey);
  }

  const langProfile = LANGUAGE_PROFILES[input.language] || LANGUAGE_PROFILES.en;
  const ratingDirective = RATING_TONE_DIRECTIVES[input.rating] || RATING_TONE_DIRECTIVES[5];

  // Dynamic system prompt construction
  const systemLines = [
    `You are an authentic local customer writing an honest Google review for Aameena Furniture located in Solapur, Maharashtra, India.`,
    `You write in genuine, natural language that sounds 100% like an everyday person, NEVER like an AI model (no ChatGPT, Gemini, or Claude style) and NEVER like a marketing agency.`,
    ``,
    `CORE INTEGRITY DIRECTIVES:`,
    `1. AVOID ALL AI AND MARKETING LANGUAGE:`,
    `   STRICTLY FORBIDDEN WORDS: ${BANNED_AI_WORDS.slice(0, 20).join(", ")}.`,
    `   Do NOT use superlatives like 'world-class', 'perfection', 'five star experience', 'flawless', or 'unbeatable'.`,
    `2. FACT SAFETY (DO NOT INVENT DETAILS):`,
    `   - Never invent delivery dates, employee names, owner names, discounts, wood guarantees, warranties, or specific prices.`,
    `   - Discuss ONLY the information provided. If details were not provided, do NOT fabricate them.`,
    `3. TONE & RATING ALIGNMENT:`,
    `   - Rating: ${ratingDirective.label}`,
    `   - Emotional Tone: ${ratingDirective.tone}`,
    `   - ${ratingDirective.guideline}`,
    `4. LANGUAGE FIDELITY:`,
    `   - Target Language: ${langProfile.name} (${langProfile.native}).`,
    `   - ${langProfile.writingPersona}.`,
    `   - Write naturally in native script (${input.language === "en" ? "standard Latin English" : "Devanagari script"}). Never translate word-for-word.`,
    `5. VARIATION & IMPERFECTIONS:`,
    `   - Randomize sentence lengths (Very Short 35-55 words, Short 60-90 words, Medium 90-140 words, Long 140-220 words).`,
    `   - Every review MUST have a completely distinct opening sentence and unique sentence order.`,
    `   - Occasionally include natural casual conversational words (e.g., 'honestly', 'overall', 'quite', 'really').`,
  ];

  // Dynamic user prompt construction - STRICTLY OMIT MISSING FIELDS
  const userLines = [
    `Customer Review Context:`,
    `- Star Rating: ${input.rating} out of 5 (${ratingDirective.tone})`,
    `- Language: ${langProfile.name} (${langProfile.native})`,
  ];

  if (input.isRatingOnly) {
    // CASE 2: Customer provided ONLY a rating
    userLines.push(
      `- Review Mode: General Showroom & Buying Experience (Rating-Only).`,
      `  * NOTE: The customer selected only a star rating. Do NOT invent any specific product or custom piece.`,
      `  * Focus naturally on: overall showroom visit, staff courtesy, showroom display, build quality, pricing fairness, customer service, or trust.`
    );
  } else {
    // CASE 1: Customer provided context
    if (input.category) {
      userLines.push(`- Furniture Category: ${input.category}`);
    }

    if (input.customProduct) {
      // Natural custom product inclusion rule
      userLines.push(
        `- Custom Item Requested: "${input.customProduct}"`,
        `  * CRITICAL: Never write 'Custom Product' or 'custom item'. Naturally incorporate the exact typed name: "${input.customProduct}" (e.g. 'We recently had a ${input.customProduct} made by Aameena Furniture...').`
      );
    } else if (input.product) {
      userLines.push(`- Specific Furniture Product: "${input.product}"`);
    }

    if (input.experience && input.experience.length > 0) {
      userLines.push(`- Experience Highlights Noted: ${input.experience.join(", ")}`);
      userLines.push(`  * Blend these topics naturally into the review text without listing them as bullet points.`);
    }

    if (input.additionalFeedback) {
      userLines.push(`- Customer's Own Notes: "${input.additionalFeedback}"`);
      userLines.push(`  * Weave this personal feedback seamlessly into the review.`);
    }
  }

  userLines.push(
    ``,
    `Generate exactly 6 completely distinct review suggestions now.`,
    `Ensure every review has a different opening, distinct sentence structure, varied word length, and 0% marketing fluff.`
  );

  const promptResult = {
    systemPrompt: systemLines.join("\n"),
    userPrompt: userLines.join("\n"),
    meta: {
      rating: input.rating,
      language: input.language,
      isRatingOnly: input.isRatingOnly,
      category: input.category,
      product: input.targetItem,
      experienceCount: input.experience.length,
      hasAdditionalFeedback: Boolean(input.additionalFeedback),
    },
  };

  // LRU cache limit 100
  if (promptCache.size > 100) {
    const oldestKey = promptCache.keys().next().value;
    promptCache.delete(oldestKey);
  }
  promptCache.set(cacheKey, promptResult);

  return promptResult;
}
