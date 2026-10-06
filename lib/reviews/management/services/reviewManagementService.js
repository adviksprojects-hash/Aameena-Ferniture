/**
 * @file reviewManagementService.js
 * Domain service orchestrating Review Submission, Gemini AI Assistance,
 * Automated Moderation, Duplicate Detection, and Admin/Manager Lifecycle.
 * Enforces role-based permission boundaries at the service layer.
 */

import { reviewManagementRepository } from "../repository/reviewManagementRepository.js";
import { validateReviewSubmission } from "../validators/submissionValidator.js";
import {
  computeTextHash,
  detectDuplicate,
} from "../utils/duplicateDetector.js";
import { moderateReview } from "../utils/moderationEngine.js";
import {
  generateReviewWithGemini,
  improveReviewWithGemini,
  generateAutoFillReview,
} from "../utils/geminiClient.js";
import {
  REVIEW_STATUS,
  MODERATION_STATUS,
  MODERATION_FLAGS,
  createCustomerReviewPayload,
} from "../types/managementTypes.js";
import { matchReviewsByText } from "../utils/textMatcher.js";
import { createAutoOwnerReplyData } from "../../ownerResponse/autoReplyGenerator.js";

export class ReviewManagementService {
  /**
   * Enforce Manager vs Super Admin permission restrictions at the service layer (Step 5 & Step 8)
   * Managers can: Approve, Reject, Hide, Restore, Reply, Search, Filter, Soft Delete from Website.
   * Managers CANNOT: Permanently delete, change permissions, system settings.
   */
  assertRolePermission(role = "ADMIN", action = "") {
    const act = String(action).toUpperCase();
    if (role === "MANAGER") {
      if (act === "PERMANENT_DELETE" || act === "DELETE" || act === "BULK_PERMANENT_DELETE") {
        throw new Error("Forbidden: Managers do not have permission to permanently delete database records.");
      }
    }
  }

  /**
   * Submit a new customer review.
   * Enforces minimal required fields (name, rating, text), executes duplicate check,
   * runs AI moderation, and persists via repository.
   *
   * @param {Object} rawInput
   * @returns {Promise<{ success: boolean, review?: Object, errors?: string[], duplicateWarning?: string }>}
   */
  async submitReview(rawInput) {
    const validation = validateReviewSubmission(rawInput);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const clean = validation.sanitized;
    const textHash = computeTextHash(clean.reviewText);

    // 1. Duplicate Detection against existing submissions
    let isDuplicate = false;
    let duplicateOfId = null;
    let duplicateWarning = null;

    try {
      const existingReviews = await reviewManagementRepository.getAllForDuplicateCheck();
      const dupCheck = detectDuplicate(clean.reviewText, existingReviews);

      if (dupCheck.isExactDuplicate) {
        isDuplicate = true;
        duplicateOfId = dupCheck.matchedReviewId;
        duplicateWarning = "Identical review text previously submitted.";
      } else if (dupCheck.isNearDuplicate) {
        isDuplicate = true;
        duplicateOfId = dupCheck.matchedReviewId;
        duplicateWarning = `High similarity (${dupCheck.similarityScore}%) with an existing review.`;
      }
    } catch (err) {
      console.warn("[ReviewManagementService] Duplicate check skipped:", err.message);
    }

    // 2. Automated Content Moderation (Gemini AI + Rule Heuristics)
    let modResult = {
      status: MODERATION_STATUS.SAFE,
      flags: [],
      score: 1.0,
      reasons: [],
    };

    try {
      modResult = await moderateReview({
        text: clean.reviewText,
        reviewerName: clean.reviewerName,
      });
    } catch (err) {
      console.warn("[ReviewManagementService] Moderation error, defaulting to NEEDS_REVIEW:", err.message);
      modResult = {
        status: MODERATION_STATUS.NEEDS_REVIEW,
        flags: [MODERATION_FLAGS.SUSPECTED_FAKE],
        score: 0.5,
        reasons: ["Automated moderation unavailable; queued for manual admin review."],
      };
    }

    // 3. Determine Initial Lifecycle Status
    let initialStatus = REVIEW_STATUS.PENDING;

    if (isDuplicate && duplicateWarning?.includes("Identical")) {
      initialStatus = REVIEW_STATUS.SPAM;
      modResult.status = MODERATION_STATUS.BLOCKED;
      modResult.reasons.push("Marked as spam due to identical duplicate text.");
    } else if (modResult.status === MODERATION_STATUS.BLOCKED) {
      initialStatus = REVIEW_STATUS.SPAM;
    } else if (modResult.status === MODERATION_STATUS.NEEDS_REVIEW) {
      initialStatus = REVIEW_STATUS.PENDING;
    } else {
      const adminApprovalRequired = process.env.ENABLE_ADMIN_APPROVAL !== "false";
      initialStatus = adminApprovalRequired ? REVIEW_STATUS.PENDING : REVIEW_STATUS.APPROVED;
    }

    // 4. Construct Entity with Automated Owner Response
    const autoReplyMeta = createAutoOwnerReplyData({
      authorName: clean.reviewerName,
      rating: clean.rating,
      language: clean.language,
      productName: clean.furniturePurchased || clean.productName,
    });

    const entity = createCustomerReviewPayload({
      reviewerName: clean.reviewerName,
      rating: clean.rating,
      reviewText: clean.reviewText,
      email: clean.email,
      phone: clean.phone,
      city: clean.city,
      furniturePurchased: clean.furniturePurchased,
      furnitureCategory: clean.furnitureCategory,
      productName: clean.productName,
      orderNumber: clean.orderNumber,
      images: clean.images,
      language: clean.language,
      wouldRecommend: clean.wouldRecommend,
      visitedShowroom: clean.visitedShowroom,
      purchaseDate: clean.purchaseDate,
      deliveryDate: clean.deliveryDate,
      customization: clean.customization,
      woodType: clean.woodType,
      budget: clean.budget,
      staffName: clean.staffName,
      additionalNotes: clean.additionalNotes,
      status: initialStatus,
      moderationStatus: modResult.status,
      moderationReasons: modResult.reasons,
      moderationScore: modResult.score,
      textHash,
      isDuplicate,
      duplicateOfId,
      ...autoReplyMeta,
      publishedAt: initialStatus === REVIEW_STATUS.APPROVED ? new Date() : null,
    });

    const saved = await reviewManagementRepository.saveReview(entity);

    return {
      success: true,
      review: saved,
      duplicateWarning,
    };
  }

  /**
   * Query reviews with status, search, and pagination.
   */
  async getReviews(params = {}) {
    return reviewManagementRepository.getReviews(params);
  }

  /**
   * Get single review by ID.
   */
  async getReviewById(id) {
    return reviewManagementRepository.getReviewById(id);
  }

  /**
   * Approve a review for publishing.
   */
  async approveReview(id, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
    this.assertRolePermission(auditInfo.role, "APPROVE");
    const existing = await reviewManagementRepository.getReviewById(id);
    if (!existing) {
      return { success: false, error: "Review not found" };
    }
    const updated = await reviewManagementRepository.updateReviewStatus(
      id,
      REVIEW_STATUS.APPROVED,
      { publishedAt: new Date().toISOString() },
      auditInfo
    );
    return { success: true, review: updated };
  }

  /**
   * Reject a review with reason.
   */
  async rejectReview(id, reason = "Rejected by moderation", auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
    this.assertRolePermission(auditInfo.role, "REJECT");
    const existing = await reviewManagementRepository.getReviewById(id);
    if (!existing) {
      return { success: false, error: "Review not found" };
    }
    const currentReasons = Array.isArray(existing.moderationReasons) ? existing.moderationReasons : [];
    const updated = await reviewManagementRepository.updateReviewStatus(
      id,
      REVIEW_STATUS.REJECTED,
      {
        moderationReasons: [...new Set([...currentReasons, reason])],
        moderationStatus: MODERATION_STATUS.BLOCKED,
      },
      auditInfo
    );
    return { success: true, review: updated };
  }

  /**
   * Report a review (e.g. by website visitor or moderator).
   */
  async reportReview(id, reason = "Reported by user", reporterInfo = {}) {
    const existing = await reviewManagementRepository.getReviewById(id);
    if (!existing) {
      return { success: false, error: "Review not found" };
    }
    const currentReasons = Array.isArray(existing.moderationReasons) ? existing.moderationReasons : [];
    const updated = await reviewManagementRepository.updateReviewStatus(
      id,
      REVIEW_STATUS.REPORTED,
      {
        moderationReasons: [...new Set([...currentReasons, reason])],
        moderationStatus: MODERATION_STATUS.FLAGGED,
      },
      {
        actionBy: reporterInfo.name || "Customer/Visitor",
        role: "CUSTOMER",
        reason: reason,
      }
    );
    return { success: true, review: updated };
  }

  /**
   * Hide a review from website (status = HIDDEN)
   */
  async hideReview(id, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
    this.assertRolePermission(auditInfo.role, "HIDE");
    const updated = await reviewManagementRepository.updateReviewStatus(
      id,
      REVIEW_STATUS.HIDDEN,
      null,
      auditInfo
    );
    if (!updated) return { success: false, error: "Review not found" };
    return { success: true, review: updated };
  }

  /**
   * Archive a review.
   */
  async archiveReview(id, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
    this.assertRolePermission(auditInfo.role, "ARCHIVE");
    const updated = await reviewManagementRepository.updateReviewStatus(
      id,
      REVIEW_STATUS.ARCHIVED,
      null,
      auditInfo
    );
    if (!updated) return { success: false, error: "Review not found" };
    return { success: true, review: updated };
  }

  /**
   * Soft delete a review from website (status = DELETED).
   * Remains in database with status DELETED. Available for managers & super admins.
   */
  async softDeleteReview(id, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
    this.assertRolePermission(auditInfo.role, "SOFT_DELETE");
    const ok = await reviewManagementRepository.deleteReview(id, true, auditInfo);
    if (!ok) return { success: false, error: "Review not found or could not be removed" };
    return { success: true, status: REVIEW_STATUS.DELETED };
  }

  /**
   * Permanently delete a review from PostgreSQL.
   * Super Admin only.
   */
  async permanentDeleteReview(id, auditInfo = { actionBy: "Super Admin", role: "ADMIN" }) {
    this.assertRolePermission(auditInfo.role, "PERMANENT_DELETE");
    const ok = await reviewManagementRepository.deleteReview(id, false, auditInfo);
    return { success: Boolean(ok) };
  }

  /**
   * Delete review: soft delete by default, permanent if explicitly requested
   */
  async deleteReview(id, soft = true, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
    if (soft) {
      return this.softDeleteReview(id, auditInfo);
    }
    return this.permanentDeleteReview(id, auditInfo);
  }

  /**
   * Restore a review back to PENDING, APPROVED, or RESTORED.
   */
  async restoreReview(id, targetStatus = REVIEW_STATUS.RESTORED, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
    this.assertRolePermission(auditInfo.role, "RESTORE");
    const validTarget = [REVIEW_STATUS.PENDING, REVIEW_STATUS.APPROVED, REVIEW_STATUS.RESTORED].includes(targetStatus)
      ? targetStatus
      : REVIEW_STATUS.RESTORED;

    const extra = validTarget === REVIEW_STATUS.APPROVED ? { publishedAt: new Date().toISOString() } : null;
    const updated = await reviewManagementRepository.updateReviewStatus(id, validTarget, extra, auditInfo);
    if (!updated) return { success: false, error: "Review not found" };
    return { success: true, review: updated };
  }

  /**
   * Quick search and match reviews by pasted text (Exact, Whitespace-insensitive, Substring, Semantic)
   * @param {string} queryText
   * @returns {Promise<Array<Object>>} Scored matches
   */
  async findReviewsByText(queryText = "") {
    if (!queryText || !String(queryText).trim()) return [];

    // Fetch candidate reviews from DB
    const res = await reviewManagementRepository.getReviews({ limit: 300 });
    const candidates = res.reviews || [];

    return matchReviewsByText(queryText, candidates);
  }

  /**
   * Bulk action for reviews (approve, reject, hide, restore, archive, delete from website, permanent delete).
   */
  async bulkAction(ids, action, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, count: 0, error: "No review IDs provided" };
    }

    const normalizedAction = String(action || "").toUpperCase();
    this.assertRolePermission(auditInfo.role, normalizedAction);

    if (normalizedAction === "DELETE" || normalizedAction === "PERMANENT_DELETE") {
      let count = 0;
      for (const id of ids) {
        const ok = await reviewManagementRepository.deleteReview(id, false, auditInfo);
        if (ok) count++;
      }
      return { success: true, count, action: "PERMANENT_DELETE" };
    }

    if (normalizedAction === "SOFT_DELETE" || normalizedAction === "DELETE_FROM_WEBSITE") {
      let count = 0;
      for (const id of ids) {
        const ok = await reviewManagementRepository.deleteReview(id, true, auditInfo);
        if (ok) count++;
      }
      return { success: true, count, action: "SOFT_DELETE" };
    }

    let targetStatus = REVIEW_STATUS.PENDING;
    let extraFields = {};

    switch (normalizedAction) {
      case "APPROVE":
      case "APPROVED":
        targetStatus = REVIEW_STATUS.APPROVED;
        extraFields = { publishedAt: new Date().toISOString() };
        break;
      case "REJECT":
      case "REJECTED":
        targetStatus = REVIEW_STATUS.REJECTED;
        extraFields = { moderationStatus: MODERATION_STATUS.BLOCKED };
        break;
      case "HIDE":
        targetStatus = REVIEW_STATUS.HIDDEN;
        break;
      case "ARCHIVE":
      case "ARCHIVED":
        targetStatus = REVIEW_STATUS.ARCHIVED;
        break;
      case "SPAM":
        targetStatus = REVIEW_STATUS.SPAM;
        break;
      case "RESTORE":
      case "RESTORED":
        targetStatus = REVIEW_STATUS.RESTORED;
        break;
      default:
        return { success: false, error: `Unsupported bulk action: ${action}` };
    }

    const count = await reviewManagementRepository.bulkUpdateStatus(ids, targetStatus, extraFields, auditInfo);
    return { success: true, count, targetStatus };
  }

  /**
   * Add official owner reply with version history
   */
  async addOwnerReply(id, replyText, auditInfo = { actionBy: "Owner", role: "OWNER" }, isPinned = false) {
    if (!replyText || !String(replyText).trim()) {
      return { success: false, error: "Reply text cannot be empty" };
    }
    const updated = await reviewManagementRepository.saveOwnerReply(id, replyText, auditInfo, isPinned);
    if (!updated) return { success: false, error: "Review not found" };
    return { success: true, review: updated };
  }

  /**
   * Delete official owner reply
   */
  async deleteOwnerReply(id, auditInfo = { actionBy: "Owner", role: "OWNER" }) {
    const updated = await reviewManagementRepository.deleteOwnerReply(id, auditInfo);
    if (!updated) return { success: false, error: "Review not found" };
    return { success: true, review: updated };
  }

  /**
   * Pin or unpin owner reply
   */
  async togglePinOwnerReply(id, isPinned = true) {
    return reviewManagementRepository.togglePinOwnerReply(id, isPinned);
  }

  /**
   * Save internal staff notes for a review (Phase 8.4)
   */
  async saveReviewNotes(id, notes = "") {
    return reviewManagementRepository.saveReviewNotes(id, notes);
  }

  /**
   * Get review moderation history
   */
  async getModerationHistory(reviewId) {
    return reviewManagementRepository.getModerationHistory(reviewId);
  }

  /**
   * Get review notifications
   */
  async getNotifications(options = {}) {
    return reviewManagementRepository.getNotifications(options);
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(id) {
    return reviewManagementRepository.markNotificationRead(id);
  }

  /**
   * Status distribution count & executive metrics for admin tabs.
   */
  async getStatusCounts() {
    return reviewManagementRepository.getReviewCountsByStatus();
  }

  /**
   * AI Review Writer Assistant.
   */
  async generateAiReview(params) {
    return generateReviewWithGemini(params);
  }

  /**
   * AI Review Improvement (grammar, rewrite, tone, translate).
   */
  async improveAiReview(params) {
    return improveReviewWithGemini(params);
  }

  /**
   * Single-click AI Auto Fill — generates name, rating, and review text.
   */
  async generateAutoFillReview(options = {}) {
    return generateAutoFillReview(options);
  }

  /**
   * AI Moderation on demand.
   */
  async moderateContent(params) {
    return moderateReview(params);
  }
}

export const reviewManagementService = new ReviewManagementService();
