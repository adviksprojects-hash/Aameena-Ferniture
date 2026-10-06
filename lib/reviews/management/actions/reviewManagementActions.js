"use server";

/**
 * @file reviewManagementActions.js
 * Server Actions for Public Review Submission, AI Assistance, Owner Replies,
 * and Admin & Manager Moderation Workflow.
 * Fully synchronized with database persistence, audit logging, and cache revalidation.
 */

import { revalidatePath } from "next/cache";
import { reviewManagementService } from "../services/reviewManagementService.js";
import { ReviewRepository } from "../../google/repository/reviewRepository.js";
import { ReviewVerificationService } from "../../verification/services/reviewVerificationService.js";
import { OwnerResponseCenterService } from "../../ownerResponse/services/ownerResponseCenterService.js";
import { AdvancedReviewSearchService } from "../../search/services/advancedReviewSearchService.js";
import { db } from "@/lib/prisma.js";

/**
 * Helper to invalidate all review caches and revalidate public & admin paths
 */
async function invalidateReviewCaches() {
  try {
    await ReviewRepository.clearCache();
    revalidatePath("/ai-reviews");
    revalidatePath("/admin/reviews");
    revalidatePath("/manager/reviews");
  } catch (err) {
    console.warn("[reviewManagementActions] Cache invalidation warning:", err.message);
  }
}

/**
 * Public action to submit a customer review.
 * Allows showroom browsers, design consultation clients, and furniture purchasers.
 *
 * @param {Object} payload
 * @returns {Promise<{ success: boolean, review?: Object, errors?: string[], duplicateWarning?: string }>}
 */
export async function submitCustomerReviewAction(payload) {
  try {
    const result = await reviewManagementService.submitReview(payload);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    console.error("[submitCustomerReviewAction] Error:", error);
    return {
      success: false,
      errors: [error.message || "Failed to submit review. Please try again."],
    };
  }
}

/**
 * Single-click AI Auto Fill Action
 */
export async function autoFillReviewAction(options = {}) {
  try {
    return await reviewManagementService.generateAutoFillReview(options);
  } catch (error) {
    console.error("[autoFillReviewAction] Error:", error);
    return {
      success: false,
      error: error.message || "Failed to auto fill review",
    };
  }
}

/**
 * AI Review Writer action via Gemini.
 */
export async function generateAiReviewAction(params) {
  try {
    return await reviewManagementService.generateAiReview(params);
  } catch (error) {
    console.error("[generateAiReviewAction] Error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate review with AI",
    };
  }
}

/**
 * AI Review Improvement action (grammar, translate, rewrite, tone).
 */
export async function improveAiReviewAction(params) {
  try {
    return await reviewManagementService.improveAiReview(params);
  } catch (error) {
    console.error("[improveAiReviewAction] Error:", error);
    return {
      success: false,
      error: error.message || "Failed to improve review with AI",
    };
  }
}

/**
 * Content moderation check action.
 */
export async function moderateReviewAction(params) {
  try {
    const result = await reviewManagementService.moderateContent(params);
    return { success: true, moderation: result };
  } catch (error) {
    console.error("[moderateReviewAction] Error:", error);
    return {
      success: false,
      error: error.message || "Moderation check failed",
    };
  }
}

/**
 * Admin / Manager action: Approve review for publication.
 */
export async function adminApproveReviewAction(id, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
  try {
    const result = await reviewManagementService.approveReview(id, auditInfo);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Reject review with explanation.
 */
export async function adminRejectReviewAction(id, reason, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
  try {
    const result = await reviewManagementService.rejectReview(id, reason, auditInfo);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Hide review from public website (status = HIDDEN).
 */
export async function adminHideReviewAction(id, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
  try {
    const result = await reviewManagementService.hideReview(id, auditInfo);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Archive review.
 */
export async function adminArchiveReviewAction(id, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
  try {
    const result = await reviewManagementService.archiveReview(id, auditInfo);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Delete review from website (Soft delete: status = HIDDEN).
 * Review disappears from /reviews immediately, remaining in DB with status HIDDEN.
 */
export async function adminSoftDeleteReviewAction(id, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
  try {
    const result = await reviewManagementService.softDeleteReview(id, auditInfo);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Alias for Delete from Website
 */
export async function deleteReviewFromWebsiteAction(id, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
  return adminSoftDeleteReviewAction(id, auditInfo);
}

/**
 * Super Admin action: Permanently delete review from database.
 * Forbidden for Managers at service layer.
 */
export async function adminDeleteReviewAction(id, auditInfo = { actionBy: "Super Admin", role: "ADMIN" }) {
  try {
    const result = await reviewManagementService.permanentDeleteReview(id, auditInfo);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Restore review back to PENDING, APPROVED, or RESTORED.
 */
export async function adminRestoreReviewAction(id, targetStatus = "RESTORED", auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
  try {
    const result = await reviewManagementService.restoreReview(id, targetStatus, auditInfo);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Bulk update reviews.
 */
export async function adminBulkAction(ids, action, auditInfo = { actionBy: "Admin", role: "ADMIN" }) {
  try {
    const result = await reviewManagementService.bulkAction(ids, action, auditInfo);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Add or edit official owner reply with version history.
 */
export async function adminAddOwnerReplyAction(id, replyText, auditInfo = { actionBy: "Store Owner", role: "OWNER" }, isPinned = false) {
  try {
    const result = await reviewManagementService.addOwnerReply(id, replyText, auditInfo, isPinned);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Delete official owner reply.
 */
export async function adminDeleteOwnerReplyAction(id, auditInfo = { actionBy: "Store Owner", role: "OWNER" }) {
  try {
    const result = await reviewManagementService.deleteOwnerReply(id, auditInfo);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Pin or unpin owner reply.
 */
export async function adminTogglePinOwnerReplyAction(id, isPinned = true) {
  try {
    const result = await reviewManagementService.togglePinOwnerReply(id, isPinned);
    if (result) {
      await invalidateReviewCaches();
    }
    return { success: Boolean(result), review: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Get moderation audit history for a review.
 */
export async function getReviewModerationHistoryAction(reviewId) {
  try {
    const history = await reviewManagementService.getModerationHistory(reviewId);
    return { success: true, history };
  } catch (error) {
    return { success: false, history: [], error: error.message };
  }
}

/**
 * Admin / Manager action: Get review notifications.
 */
export async function getReviewNotificationsAction(options = {}) {
  try {
    const notifications = await reviewManagementService.getNotifications(options);
    return { success: true, notifications };
  } catch (error) {
    return { success: false, notifications: [], error: error.message };
  }
}

/**
 * Admin / Manager action: Mark notification as read.
 */
export async function markReviewNotificationReadAction(notificationId) {
  try {
    const ok = await reviewManagementService.markNotificationRead(notificationId);
    return { success: ok };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Public action: Report a review.
 */
export async function reportCustomerReviewAction(reviewId, reason, reporterInfo = {}) {
  try {
    const result = await reviewManagementService.reportReview(reviewId, reason, reporterInfo);
    if (result.success) {
      await invalidateReviewCaches();
    }
    return result;
  } catch (error) {
    console.error("[reportCustomerReviewAction] Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin / Manager action: Quick match reviews by review text (Exact, Whitespace-insensitive, Substring, Semantic).
 */
export async function quickFindReviewByTextAction(text) {
  try {
    const matches = await reviewManagementService.findReviewsByText(text);
    return { success: true, matches };
  } catch (error) {
    console.error("[quickFindReviewByTextAction] Error:", error);
    return { success: false, matches: [], error: error.message };
  }
}

/**
 * Admin action: Fetch filtered review list directly from PostgreSQL.
 */
export async function adminFetchReviewsAction(filters = {}) {
  try {
    const result = await reviewManagementService.getReviews(filters);
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message, reviews: [], total: 0 };
  }
}

/**
 * Admin action: Fetch review status tab counts and executive metrics directly from PostgreSQL.
 */
export async function adminFetchReviewStatsAction() {
  try {
    const stats = await reviewManagementService.getStatusCounts();
    return { success: true, stats };
  } catch (error) {
    return { success: false, error: error.message, stats: {} };
  }
}

/**
 * Enterprise action: Fetch real-time BI analytics directly from PostgreSQL
 */
export async function fetchEnterpriseAnalyticsAction(timePeriod = "ALL") {
  try {
    const analytics = await ReviewAnalyticsService.getEnterpriseAnalytics();
    return { success: true, analytics };
  } catch (error) {
    console.error("[fetchEnterpriseAnalyticsAction] Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin action: Save internal staff notes for a customer review
 */
export async function saveReviewNotesAction(reviewId, notes = "") {
  try {
    const updated = await reviewManagementService.saveReviewNotes(reviewId, notes);
    return { success: Boolean(updated), review: updated };
  } catch (error) {
    console.error("[saveReviewNotesAction] Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin action: Bulk reply to multiple customer reviews
 */
export async function bulkReplyCustomerReviewsAction(reviewIds = [], replyText = "", responderInfo = {}) {
  if (!Array.isArray(reviewIds) || reviewIds.length === 0 || !replyText.trim()) {
    return { success: false, count: 0, error: "Review IDs and reply text are required" };
  }
  try {
    let count = 0;
    for (const id of reviewIds) {
      const res = await reviewManagementService.addOwnerReply(
        id,
        replyText,
        {
          actionBy: responderInfo.name || "Aameena Furniture Owner",
          role: responderInfo.role || "OWNER",
        },
        false
      );
      if (res.success) count++;
    }
    await invalidateReviewCaches();
    return { success: true, count };
  } catch (error) {
    console.error("[bulkReplyCustomerReviewsAction] Error:", error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Admin action: Undo recent review status moderation actions
 */
export async function bulkUndoReviewStatusAction(itemsToRestore = []) {
  if (!Array.isArray(itemsToRestore) || itemsToRestore.length === 0) {
    return { success: false, count: 0, error: "No items provided for undo" };
  }
  try {
    let count = 0;
    for (const item of itemsToRestore) {
      if (!item.id || !item.previousStatus) continue;
      const res = await reviewManagementService.restoreReview(
        item.id,
        item.previousStatus,
        { actionBy: item.actionBy || "Admin Undo", role: "ADMIN" }
      );
      if (res.success) count++;
    }
    await invalidateReviewCaches();
    return { success: true, count };
  } catch (error) {
    console.error("[bulkUndoReviewStatusAction] Error:", error);
    return { success: false, count: 0, error: error.message };
  }
}

// ==========================================
// PHASE 8.5 ENTERPRISE CXP SERVER ACTIONS
// ==========================================

/**
 * Admin action: Manually verify a review
 */
export async function verifyReviewAction(payload) {
  try {
    const res = await ReviewVerificationService.verifyReviewManually(payload);
    if (res.success) {
      await invalidateReviewCaches();
      revalidatePath("/admin/reputation");
    }
    return res;
  } catch (err) {
    console.error("[verifyReviewAction] Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Manager action: Request verification for a review
 */
export async function requestVerificationAction(payload) {
  try {
    const res = await ReviewVerificationService.requestVerification(payload);
    if (res.success) {
      await invalidateReviewCaches();
    }
    return res;
  } catch (err) {
    console.error("[requestVerificationAction] Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch complete review lifecycle timeline
 */
export async function fetchReviewTimelineAction() {
  return { success: true, timeline: [] };
}

export async function evaluateReviewHealthAction() {
  return { success: false, error: "Health evaluation module retired" };
}

export async function evaluateAllReviewsHealthAction() {
  return { success: true };
}

export async function fetchReviewReputationMetricsAction() {
  return { success: false };
}

export async function fetchReviewerProfileAction() {
  return { success: false };
}

export async function fetchSmartReviewRankingsAction() {
  return { success: true, rankings: [] };
}

/**
 * Fetch Response Templates
 */
export async function fetchReplyTemplatesAction(category = "ALL") {
  try {
    const templates = await OwnerResponseCenterService.getTemplates(category);
    return { success: true, templates };
  } catch (err) {
    console.error("[fetchReplyTemplatesAction] Error:", err);
    return { success: false, templates: [], error: err.message };
  }
}

/**
 * Save official owner reply with template and history tracking
 */
export async function saveOwnerReplyAction(payload) {
  try {
    const res = await OwnerResponseCenterService.saveOwnerReply(payload);
    if (res.success) {
      await invalidateReviewCaches();
      revalidatePath("/admin/reputation");
    }
    return res;
  } catch (err) {
    console.error("[saveOwnerReplyAction] Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Advanced multi-dimensional review search V2
 */
export async function advancedSearchReviewsAction(filters = {}) {
  try {
    const res = await AdvancedReviewSearchService.searchReviews(filters);
    return res;
  } catch (err) {
    console.error("[advancedSearchReviewsAction] Error:", err);
    return { success: false, reviews: [], total: 0, error: err.message };
  }
}

/**
 * Public action: Record helpful or unhelpful vote on review
 */
export async function recordHelpfulVoteAction(reviewId, isHelpful = true) {
  if (!reviewId) return { success: false };
  try {
    const updated = await db.customerReviewSubmission.update({
      where: { id: reviewId },
      data: {
        ...(isHelpful
          ? { helpfulVotes: { increment: 1 } }
          : { unhelpfulVotes: { increment: 1 } }),
      },
    });
    return { success: true, helpfulVotes: updated.helpfulVotes };
  } catch (err) {
    console.error("[recordHelpfulVoteAction] Error:", err);
    return { success: false, error: err.message };
  }
}

