/**
 * @file managementTypes.js
 * Domain types, enums, and factory initializers for Review Management & Moderation.
 */

export const REVIEW_STATUS = Object.freeze({
  NEW: "NEW",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  HIDDEN: "HIDDEN",
  REJECTED: "REJECTED",
  SPAM: "SPAM",
  REPORTED: "REPORTED",
  ARCHIVED: "ARCHIVED",
  DELETED: "DELETED",
  RESTORED: "RESTORED",
});

export const MODERATION_STATUS = Object.freeze({
  SAFE: "SAFE",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  BLOCKED: "BLOCKED",
});

export const MODERATION_FLAGS = Object.freeze({
  SPAM: "SPAM",
  PROFANITY: "PROFANITY",
  ABUSE: "ABUSE",
  HATE_SPEECH: "HATE_SPEECH",
  ADVERTISING: "ADVERTISING",
  PERSONAL_INFO: "PERSONAL_INFO",
  SUSPECTED_FAKE: "SUSPECTED_FAKE",
  EXTERNAL_LINKS: "EXTERNAL_LINKS",
  VIOLENCE: "VIOLENCE",
  ADULT: "ADULT",
});

export const GENERATION_LENGTH = Object.freeze({
  SHORT: "SHORT",
  MEDIUM: "MEDIUM",
  LONG: "LONG",
});

export const GENERATION_TONE = Object.freeze({
  PROFESSIONAL: "PROFESSIONAL",
  CASUAL: "CASUAL",
  FORMAL: "FORMAL",
  FRIENDLY: "FRIENDLY",
});

export const GENERATION_LANGUAGES = Object.freeze({
  en: "English",
  mr: "मराठी (Marathi)",
  hi: "हिंदी (Hindi)",
});

/**
 * Factory for Customer Review Submission entity
 */
export function createCustomerReviewPayload({
  id,
  reviewerName = "",
  rating = 5,
  reviewText = "",
  email = "",
  phone = "",
  city = "Solapur",
  furniturePurchased = "",
  furnitureCategory = "",
  productName = "",
  orderNumber = "",
  images = [],
  language = "en",
  wouldRecommend = true,
  visitedShowroom = false,
  purchaseDate = null,
  deliveryDate = null,
  customization = "",
  woodType = "",
  budget = "",
  staffName = "",
  additionalNotes = "",
  status = REVIEW_STATUS.PENDING,
  moderationStatus = MODERATION_STATUS.SAFE,
  moderationReasons = [],
  moderationScore = 1.0,
  aiSummary = "",
  aiSentiment = "POSITIVE",
  textHash = "",
  isDuplicate = false,
  duplicateOfId = null,
  ownerReply = null,
  ownerReplyDate = null,
  ownerReplyBy = null,
  ownerReplyRole = "OWNER",
  ownerReplyUpdatedAt = null,
  isReplyPinned = false,
  ownerReplyHistory = null,
  moderationHistory = [],
  publishedAt = null,
  createdAt,
  updatedAt,
} = {}) {
  const cleanName = String(reviewerName || "").trim();
  const cleanText = String(reviewText || "").trim();
  const validRating = Math.min(5, Math.max(1, Number(rating) || 5));

  return {
    id: id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    reviewerName: cleanName,
    rating: validRating,
    reviewText: cleanText,
    email: email ? String(email).trim().toLowerCase() : null,
    phone: phone ? String(phone).trim() : null,
    city: city ? String(city).trim() : null,
    furniturePurchased: furniturePurchased ? String(furniturePurchased).trim() : null,
    furnitureCategory: furnitureCategory ? String(furnitureCategory).trim() : null,
    productName: productName ? String(productName).trim() : null,
    orderNumber: orderNumber ? String(orderNumber).trim() : null,
    images: Array.isArray(images) ? images : [],
    language: String(language || "en").toLowerCase(),
    wouldRecommend: Boolean(wouldRecommend),
    visitedShowroom: Boolean(visitedShowroom),
    purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : null,
    deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,
    customization: customization ? String(customization).trim() : null,
    woodType: woodType ? String(woodType).trim() : null,
    budget: budget ? String(budget).trim() : null,
    staffName: staffName ? String(staffName).trim() : null,
    additionalNotes: additionalNotes ? String(additionalNotes).trim() : null,
    status: REVIEW_STATUS[status] || REVIEW_STATUS.PENDING,
    moderationStatus: MODERATION_STATUS[moderationStatus] || MODERATION_STATUS.SAFE,
    moderationReasons: Array.isArray(moderationReasons) ? moderationReasons : [],
    moderationScore: Number(Number(moderationScore || 1.0).toFixed(2)),
    aiSummary: aiSummary ? String(aiSummary).trim() : null,
    aiSentiment: String(aiSentiment || "POSITIVE"),
    textHash: String(textHash || ""),
    isDuplicate: Boolean(isDuplicate),
    duplicateOfId: duplicateOfId ? String(duplicateOfId) : null,
    ownerReply: ownerReply ? String(ownerReply).trim() : null,
    ownerReplyDate: ownerReplyDate ? new Date(ownerReplyDate).toISOString() : null,
    ownerReplyBy: ownerReplyBy ? String(ownerReplyBy).trim() : null,
    ownerReplyRole: ownerReplyRole ? String(ownerReplyRole).trim() : "OWNER",
    ownerReplyUpdatedAt: ownerReplyUpdatedAt ? new Date(ownerReplyUpdatedAt).toISOString() : null,
    isReplyPinned: Boolean(isReplyPinned),
    ownerReplyHistory: ownerReplyHistory || null,
    moderationHistory: Array.isArray(moderationHistory) ? moderationHistory : [],
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString(),
  };
}
