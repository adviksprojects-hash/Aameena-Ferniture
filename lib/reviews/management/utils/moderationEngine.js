/**
 * @file moderationEngine.js
 * AI Moderation Engine for Review Submissions.
 * Detects spam, profanity, hate speech, external links, contact harvesting,
 * advertising, and unsafe content.
 * Returns SAFE, NEEDS_REVIEW, or BLOCKED with specific audit flags.
 */

import { MODERATION_STATUS, MODERATION_FLAGS } from "../types/managementTypes.js";
import { callGeminiApi } from "./geminiClient.js";

// Contact and URL detection regexes
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i;
const PHONE_REGEX = /(?:\+?91[\s-]?)?[6-9]\d{9}|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(?:com|org|net|io|co|in|biz|xyz)[^\s]*)/i;

// Profanity & abuse patterns
const SEVERE_ABUSE_WORDS = [
  "fuck", "bitch", "bastard", "asshole", "dick", "cunt", "motherfucker", "idiot", "fraud", "scam", "cheater",
  "गांड", "मादरचोद", "बहिणचोद", "रांड", "झाटू", "भोसडीच्या",
  "चूतिया", "भोसड़ीके", "हरामी", "कमीने"
];

// Spam / advertising patterns
const ADVERTISING_KEYWORDS = [
  "buy now", "discount code", "click here", "visit our website", "call us for", "whatsapp me at",
  "free money", "earn online", "crypto", "forex", "casino", "loan approved", "seo service"
];

/**
 * Perform rule-based heuristic moderation on text
 * @param {string} text
 * @returns {{ reasons: string[], flags: string[], isBlocked: boolean, isNeedsReview: boolean }}
 */
export function evaluateRuleBasedModeration(text = "") {
  const clean = String(text || "").toLowerCase();
  const reasons = [];
  const flags = [];
  let isBlocked = false;
  let isNeedsReview = false;

  // 1. Check Severe Profanity / Abuse
  const foundAbuse = SEVERE_ABUSE_WORDS.filter((word) => clean.includes(word));
  if (foundAbuse.length > 0) {
    reasons.push("Explicit profanity, abusive wording, or defamatory accusations detected.");
    flags.push(MODERATION_FLAGS.PROFANITY, MODERATION_FLAGS.ABUSE);
    isBlocked = true;
  }

  // 2. Check External Links / Promotion
  if (URL_REGEX.test(text)) {
    reasons.push("External links or website URLs are not permitted in public reviews.");
    flags.push(MODERATION_FLAGS.EXTERNAL_LINKS, MODERATION_FLAGS.SPAM);
    isBlocked = true;
  }

  // 3. Check Advertising / Promotional Keywords
  const foundPromo = ADVERTISING_KEYWORDS.filter((phrase) => clean.includes(phrase));
  if (foundPromo.length > 0) {
    reasons.push("Promotional marketing or unsolicited commercial advertising detected.");
    flags.push(MODERATION_FLAGS.ADVERTISING, MODERATION_FLAGS.SPAM);
    isBlocked = true;
  }

  // 4. Check Personal Contact Solicitation in Review Body
  if (EMAIL_REGEX.test(text) || PHONE_REGEX.test(text)) {
    reasons.push("Review body contains private email or phone number.");
    flags.push(MODERATION_FLAGS.PERSONAL_INFO);
    isBlocked = true;
  }

  // 5. Check Repeated Character Gibberish
  if (/(.)\1{6,}/.test(clean)) {
    reasons.push("Suspicious character repetition detected.");
    flags.push(MODERATION_FLAGS.SPAM);
    isNeedsReview = true;
  }

  return { reasons, flags, isBlocked, isNeedsReview };
}

/**
 * Moderate review submission through Gemini AI + heuristic validation
 * @param {string|Object} input - Review text content or options object { text, reviewerName }
 * @returns {Promise<{
 *   status: string,
 *   reasons: string[],
 *   score: number,
 *   flags: string[]
 * }>}
 */
export async function moderateReview(input = "") {
  let cleanText = "";
  if (typeof input === "string") {
    cleanText = input.trim();
  } else if (input && typeof input === "object") {
    cleanText = String(input.text || input.reviewText || "").trim();
  }

  if (!cleanText) {
    return {
      status: MODERATION_STATUS.BLOCKED,
      reasons: ["Empty review text."],
      score: 0.0,
      flags: [MODERATION_FLAGS.SPAM],
    };
  }

  // Step 1: Instant deterministic heuristic screening
  const heuristic = evaluateRuleBasedModeration(cleanText);
  if (heuristic.isBlocked) {
    return {
      status: MODERATION_STATUS.BLOCKED,
      reasons: heuristic.reasons,
      score: 0.1,
      flags: heuristic.flags,
    };
  }

  // Step 2: Advanced Gemini AI Policy Audit
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "demo_gemini_api_key") {
    const prompt = `Analyze this customer review for an Indian furniture manufacturing workshop for trust and safety:
"${cleanText}"

Evaluate whether it contains:
- Hate speech or harassment
- Spam or advertising
- Threatening or unsafe content
- Suspected fake or coordinated bot content

Respond ONLY in valid JSON format:
{
  "isSafe": true | false,
  "confidenceScore": 0.0 to 1.0,
  "flaggedCategories": [],
  "justification": "short reason"
}`;

    const geminiRaw = await callGeminiApi(prompt, { temperature: 0.1, maxOutputTokens: 200 });
    if (geminiRaw) {
      try {
        const cleanJson = geminiRaw.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        if (!parsed.isSafe) {
          return {
            status: parsed.confidenceScore > 0.8 ? MODERATION_STATUS.BLOCKED : MODERATION_STATUS.NEEDS_REVIEW,
            reasons: [parsed.justification || "Flagged by AI trust & safety classifier."],
            score: Number(parsed.confidenceScore || 0.5),
            flags: parsed.flaggedCategories || [MODERATION_FLAGS.SPAM],
          };
        }
      } catch (err) {
        console.warn("[ModerationEngine] Gemini JSON parse failed, utilizing heuristic result:", err.message);
      }
    }
  }

  // Step 3: Heuristic needs review check
  if (heuristic.isNeedsReview) {
    return {
      status: MODERATION_STATUS.NEEDS_REVIEW,
      reasons: heuristic.reasons,
      score: 0.65,
      flags: heuristic.flags,
    };
  }

  // Default: Safe and clean
  return {
    status: MODERATION_STATUS.SAFE,
    reasons: [],
    score: 0.98,
    flags: [],
  };
}
