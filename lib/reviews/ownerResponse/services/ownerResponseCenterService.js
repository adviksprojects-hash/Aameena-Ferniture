/**
 * @file ownerResponseCenterService.js
 * Owner Response Center Service for Aameena Furniture.
 * Manages official owner replies, professional response templates, quick replies,
 * reply version history, internal notes, and response velocity analytics.
 * 100% PostgreSQL backed via Prisma.
 */

import { db } from "@/lib/prisma.js";

export const DEFAULT_REPLY_TEMPLATES = [
  {
    title: "Customer Gratitude & Appreciation",
    category: "GRATITUDE",
    content:
      "Thank you for your review! We truly appreciate your feedback and wonderful support for Aameena Furniture.",
    isQuickReply: true,
  },
  {
    title: "Showroom Visit Gratitude",
    category: "SHOWROOM",
    content:
      "Thank you for visiting our Solapur showroom and sharing your review! We truly appreciate your feedback and look forward to welcoming you back.",
    isQuickReply: true,
  },
  {
    title: "Timber Care Guidance",
    category: "TIMBER_CARE",
    content:
      "Thank you for your valuable feedback! To preserve the rich natural finish of your Sagwan teak furniture, dust gently with a dry microfiber cloth.",
    isQuickReply: true,
  },
  {
    title: "Custom Order Collaboration",
    category: "CUSTOM_ORDER",
    content:
      "Thank you for your review and collaboration on your custom furniture! We truly appreciate your feedback and hope it brings joy for years to come.",
    isQuickReply: true,
  },
  {
    title: "Customer Care & Resolution",
    category: "ISSUE_RESOLUTION",
    content:
      "Thank you for sharing your feedback. We appreciate your insights, and our Solapur service desk is here to help resolve any questions or concerns.",
    isQuickReply: false,
  },
];

export class OwnerResponseCenterService {
  /**
   * Seed default templates if database table is empty.
   */
  static async seedDefaultTemplates() {
    try {
      const count = await db.reviewReplyTemplate.count();
      if (count === 0) {
        for (const tmpl of DEFAULT_REPLY_TEMPLATES) {
          await db.reviewReplyTemplate.create({ data: tmpl });
        }
      }
      return true;
    } catch (err) {
      console.warn("[OwnerResponseCenterService.seedDefaultTemplates] Warning:", err.message);
      return false;
    }
  }

  /**
   * Fetch all response templates, optionally filtered by category.
   */
  static async getTemplates(category = "ALL") {
    try {
      await this.seedDefaultTemplates();

      const where = {};
      if (category && category !== "ALL") {
        where.category = category;
      }

      const templates = await db.reviewReplyTemplate.findMany({
        where,
        orderBy: [{ usageCount: "desc" }, { createdAt: "asc" }],
      });

      return templates;
    } catch (err) {
      console.error("[OwnerResponseCenterService.getTemplates] Error:", err.message);
      return DEFAULT_REPLY_TEMPLATES.map((t, idx) => ({ id: `default-${idx}`, ...t }));
    }
  }

  /**
   * Save or update an official owner reply with version history and internal notes.
   */
  static async saveOwnerReply({
    reviewId,
    replyText,
    isPinned = false,
    actorName = "Aameena Furniture Owner",
    role = "OWNER",
    internalNotes = null,
    templateId = null,
  }) {
    if (!reviewId || !replyText?.trim()) {
      throw new Error("reviewId and replyText are required");
    }

    try {
      const review = await db.customerReviewSubmission.findUnique({
        where: { id: reviewId },
      });
      if (!review) throw new Error("Review not found");

      // Build version history
      const currentHistory = Array.isArray(review.ownerReplyHistory) ? review.ownerReplyHistory : [];
      if (review.ownerReply && review.ownerReply.trim() !== replyText.trim()) {
        currentHistory.unshift({
          text: review.ownerReply,
          updatedAt: review.ownerReplyUpdatedAt || review.ownerReplyDate || new Date(),
          updatedBy: review.ownerReplyBy || actorName,
        });
      }

      // If a template was used, increment its usage counter
      if (templateId) {
        try {
          await db.reviewReplyTemplate.update({
            where: { id: templateId },
            data: { usageCount: { increment: 1 } },
          });
        } catch (e) {}
      }

      const isFirstReply = !review.ownerReplyDate;
      const [updatedReview] = await db.$transaction([
        db.customerReviewSubmission.update({
          where: { id: reviewId },
          data: {
            ownerReply: replyText.trim(),
            ownerReplyDate: review.ownerReplyDate || new Date(),
            ownerReplyUpdatedAt: new Date(),
            ownerReplyBy: actorName,
            ownerReplyRole: role,
            isReplyPinned: Boolean(isPinned),
            ownerReplyHistory: currentHistory.slice(0, 10), // keep last 10 edits
            ...(internalNotes ? { internalNotes } : {}),
          },
        }),
        db.reviewModerationHistory.create({
          data: {
            reviewId,
            action: isFirstReply ? "OWNER_REPLIED" : "EDITED",
            oldStatus: review.status,
            newStatus: review.status,
            actionBy: actorName,
            role,
            reason: isFirstReply ? "Official owner response published" : "Owner response updated",
            metadata: { replyLength: replyText.length, isPinned },
          },
        }),
      ]);

      return { success: true, review: updatedReview };
    } catch (err) {
      console.error("[OwnerResponseCenterService.saveOwnerReply] Error:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete an owner reply.
   */
  static async deleteOwnerReply(reviewId, actorName = "Admin") {
    if (!reviewId) throw new Error("reviewId is required");

    try {
      const review = await db.customerReviewSubmission.findUnique({
        where: { id: reviewId },
      });
      if (!review) throw new Error("Review not found");

      const [updatedReview] = await db.$transaction([
        db.customerReviewSubmission.update({
          where: { id: reviewId },
          data: {
            ownerReply: null,
            ownerReplyDate: null,
            ownerReplyUpdatedAt: null,
            ownerReplyBy: null,
            isReplyPinned: false,
          },
        }),
        db.reviewModerationHistory.create({
          data: {
            reviewId,
            action: "OWNER_REPLIED",
            oldStatus: review.status,
            newStatus: review.status,
            actionBy: actorName,
            role: "ADMIN",
            reason: "Owner response deleted",
          },
        }),
      ]);

      return { success: true, review: updatedReview };
    } catch (err) {
      console.error("[OwnerResponseCenterService.deleteOwnerReply] Error:", err.message);
      return { success: false, error: err.message };
    }
  }
}

export default OwnerResponseCenterService;
