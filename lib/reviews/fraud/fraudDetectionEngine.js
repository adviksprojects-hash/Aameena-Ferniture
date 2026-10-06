/**
 * @file fraudDetectionEngine.js
 * Enterprise Review Fraud & Anomaly Detection Engine.
 * Evaluates duplicate text hashes, Jaccard near-duplicate matching,
 * submission velocity spikes, spam/promotional keyword scanning,
 * disposable emails, and rating manipulation anomalies.
 * Produces an explainable composite fraud risk score (0 - 100).
 */

import { computeTextHash, calculateTextSimilarity } from "../management/utils/duplicateDetector.js";

const SPAM_KEYWORDS = [
  "crypto", "bitcoin", "forex", "casino", "lottery", "telegram",
  "whatsapp me", "earn money", "loan instant", "seo services",
  "buy followers", "hack account", "dating site", "viagra", "pills",
  "free cash", "investment scheme", "click here", "http://", "https://"
];

const DISPOSABLE_EMAIL_DOMAINS = [
  "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
  "yopmail.com", "sharklasers.com", "trashmail.com", "fakeinbox.com"
];

/**
 * Run comprehensive fraud detection on a candidate review submission.
 *
 * @param {Object} candidate - Review to inspect
 * @param {string} candidate.reviewerName
 * @param {string} [candidate.email]
 * @param {string} [candidate.phone]
 * @param {string} candidate.reviewText
 * @param {number} candidate.rating
 * @param {boolean} [candidate.isVerifiedPurchase]
 * @param {string} [candidate.orderNumber]
 * @param {Object} [context] - Historical context for velocity & duplicate checks
 * @param {Array<Object>} [context.existingReviews=[]]
 * @param {Array<Object>} [context.recentSubmissions=[]] - Submissions in past 24 hours
 * @param {number} [context.ipSubmissionsLastHour=0]
 * @returns {Object} Comprehensive fraud analysis report
 */
export function calculateFraudRisk(candidate, context = {}) {
  const {
    existingReviews = [],
    recentSubmissions = [],
    ipSubmissionsLastHour = 0,
  } = context;

  const text = String(candidate.reviewText || "").trim();
  const name = String(candidate.reviewerName || "").trim();
  const email = String(candidate.email || "").toLowerCase().trim();
  const rating = Number(candidate.rating) || 5;

  let fraudScore = 0;
  const flags = [];
  const spamKeywordsFound = [];

  // 1. Text Hash & Near-Duplicate Check
  const textHash = computeTextHash(text);
  let highestSimilarity = 0;
  let matchedDuplicateId = null;

  for (const existing of existingReviews) {
    if (existing.id === candidate.id) continue;
    const existingHash = existing.textHash || computeTextHash(existing.reviewText || existing.text);
    if (existingHash === textHash) {
      fraudScore += 55;
      flags.push("EXACT_DUPLICATE_TEXT");
      highestSimilarity = 1.0;
      matchedDuplicateId = existing.id;
      break;
    }

    const sim = calculateTextSimilarity(text, existing.reviewText || existing.text || "");
    if (sim > highestSimilarity) {
      highestSimilarity = sim;
      matchedDuplicateId = existing.id;
    }
  }

  if (highestSimilarity >= 0.85 && !flags.includes("EXACT_DUPLICATE_TEXT")) {
    fraudScore += 45;
    flags.push(`NEAR_DUPLICATE_TEXT_${Math.round(highestSimilarity * 100)}PCT`);
  } else if (highestSimilarity >= 0.70 && !flags.includes("EXACT_DUPLICATE_TEXT")) {
    fraudScore += 25;
    flags.push(`SIMILAR_TEXT_${Math.round(highestSimilarity * 100)}PCT`);
  }

  // 2. Velocity & Rate-Limiting Check
  if (ipSubmissionsLastHour >= 3) {
    fraudScore += 35;
    flags.push("HIGH_IP_VELOCITY_SPIKE");
  } else if (ipSubmissionsLastHour >= 2) {
    fraudScore += 15;
    flags.push("ELEVATED_IP_VELOCITY");
  }

  // Author/Email burst check in recent 24h
  if (email) {
    const emailMatches = recentSubmissions.filter(
      (s) => s.email && s.email.toLowerCase() === email && s.id !== candidate.id
    );
    if (emailMatches.length >= 2) {
      fraudScore += 30;
      flags.push("REPEATED_EMAIL_SUBMISSIONS");
    }
  }

  // 3. Spam & External Promotional Content
  const lowerText = text.toLowerCase();
  for (const kw of SPAM_KEYWORDS) {
    if (lowerText.includes(kw)) {
      spamKeywordsFound.push(kw);
    }
  }
  if (spamKeywordsFound.length > 0) {
    fraudScore += Math.min(spamKeywordsFound.length * 20, 50);
    flags.push(`SPAM_KEYWORDS_DETECTED_${spamKeywordsFound.length}`);
  }

  // 4. Disposable Email Domain Check
  if (email) {
    const domain = email.split("@")[1];
    if (domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
      fraudScore += 30;
      flags.push("DISPOSABLE_EMAIL_DOMAIN");
    }
  }

  // 5. Rating Manipulation Anomaly (e.g. extremely short text with extreme 1 or 5 star)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 4 && (rating === 1 || rating === 5)) {
    fraudScore += 10;
    flags.push("ULTRA_SHORT_EXTREME_RATING");
  }

  // Cap score at 100
  fraudScore = Math.min(Math.max(fraudScore, 0), 100);

  // Determine Risk Tier
  let riskLevel = "LOW";
  let recommendation = "APPROVE";

  if (fraudScore >= 60) {
    riskLevel = "HIGH";
    recommendation = "AUTO_BLOCK";
  } else if (fraudScore >= 30) {
    riskLevel = "MODERATE";
    recommendation = "NEEDS_MANUAL_REVIEW";
  }

  return {
    fraudScore,
    riskLevel,
    isFlagged: fraudScore >= 30,
    flags,
    duplicateInfo: {
      highestSimilarity,
      matchedDuplicateId,
      textHash,
    },
    velocityInfo: {
      ipSubmissionsLastHour,
    },
    spamKeywordsFound,
    recommendation,
  };
}

export default {
  calculateFraudRisk,
};
