/**
 * @file reviewManagementRepository.js
 * Data access layer for customer-submitted reviews and admin moderation workflows.
 * Backed 100% by Prisma and PostgreSQL database.
 */

import { db } from "../../../../lib/prisma.js";
import { REVIEW_STATUS, createCustomerReviewPayload } from "../types/managementTypes.js";
import { ReviewRepository } from "../../google/repository/reviewRepository.js";

export class ReviewManagementRepository {
  /**
   * Helper to execute Prisma queries with Neon WebSocket retry
   */
  static async executeWithRetry(queryFn) {
    try {
      return await queryFn();
    } catch (err) {
      try {
        return await queryFn();
      } catch (retryErr) {
        console.error("[ReviewManagementRepository] DB execution error:", retryErr);
        throw retryErr;
      }
    }
  }

  /**
   * Save a newly submitted customer review to PostgreSQL
   * @param {Object} reviewData
   * @returns {Promise<Object>} Created review object
   */
  static async saveReview(reviewData) {
    const payload = createCustomerReviewPayload(reviewData);

    try {
      const created = await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.create({
          data: {
            id: payload.id,
            reviewerName: payload.reviewerName,
            rating: payload.rating,
            reviewText: payload.reviewText,
            email: payload.email,
            phone: payload.phone,
            city: payload.city,
            furniturePurchased: payload.furniturePurchased,
            furnitureCategory: payload.furnitureCategory,
            productName: payload.productName,
            orderNumber: payload.orderNumber,
            images: payload.images,
            language: payload.language,
            wouldRecommend: payload.wouldRecommend,
            visitedShowroom: payload.visitedShowroom,
            purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : null,
            deliveryDate: payload.deliveryDate ? new Date(payload.deliveryDate) : null,
            customization: payload.customization,
            woodType: payload.woodType,
            budget: payload.budget,
            staffName: payload.staffName,
            additionalNotes: payload.additionalNotes,
            status: payload.status,
            moderationStatus: payload.moderationStatus,
            moderationReasons: payload.moderationReasons,
            moderationScore: payload.moderationScore,
            aiSummary: payload.aiSummary,
            aiSentiment: payload.aiSentiment,
            textHash: payload.textHash,
            isDuplicate: payload.isDuplicate,
            duplicateOfId: payload.duplicateOfId,
            ownerReply: payload.ownerReply || null,
            ownerReplyDate: payload.ownerReplyDate ? new Date(payload.ownerReplyDate) : null,
            ownerReplyBy: payload.ownerReplyBy || null,
            ownerReplyRole: payload.ownerReplyRole || "OWNER",
            ownerReplyUpdatedAt: payload.ownerReplyUpdatedAt ? new Date(payload.ownerReplyUpdatedAt) : null,
            ownerReplyHistory: payload.ownerReplyHistory || null,
            publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
          },
        });
      });

      // Record initial moderation history
      try {
        await db.reviewModerationHistory.create({
          data: {
            reviewId: created.id,
            oldStatus: null,
            newStatus: created.status,
            actionBy: payload.reviewerName || "Customer",
            role: "USER",
            reason: "Initial review submission",
          },
        });
      } catch (histErr) {
        console.warn("[ReviewManagementRepository] History creation warning:", histErr.message);
      }

      // Record system notification
      try {
        await db.reviewNotification.create({
          data: {
            type: "REVIEW_SUBMITTED",
            title: "New Review Submitted",
            message: `${payload.reviewerName} submitted a ${payload.rating}★ review for ${payload.furniturePurchased || "craftsmanship"}.`,
            reviewId: created.id,
            actorName: payload.reviewerName || "Customer",
            actorRole: "USER",
          },
        });
      } catch (notifErr) {
        console.warn("[ReviewManagementRepository] Notification warning:", notifErr.message);
      }

      try {
        await ReviewRepository.clearCache();
      } catch (e) {}

      return createCustomerReviewPayload(created);
    } catch (err) {
      console.error("[ReviewManagementRepository] DB save error:", err);
      throw err;
    }
  }

  /**
   * Fetch reviews from database with Smart Search, filtering, pagination, and sorting
   * Smart Search queries across 15 dimensions:
   * Author, Phone, Email, City, Category, Product, Review ID, Order Number,
   * AI Summary, Review Text, Owner Reply, Slug, Status, Language.
   *
   * @param {Object} [filters]
   * @returns {Promise<{ reviews: Array<Object>, totalCount: number, total: number, page: number, totalPages: number }>}
   */
  static async getReviews(filters = {}) {
    const {
      status = "ALL",
      rating = "all",
      search = "",
      page = 1,
      limit = 20,
      sortBy = "newest",
    } = filters;

    const where = {};

    // Filter by status tab
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Filter by rating
    if (rating && rating !== "all" && Number(rating) > 0) {
      where.rating = Number(rating);
    }

    // Step 6: Smart Search across all 15 dimensions
    const cleanSearch = String(search || "").trim();
    if (cleanSearch) {
      where.OR = [
        { reviewerName: { contains: cleanSearch, mode: "insensitive" } },
        { phone: { contains: cleanSearch, mode: "insensitive" } },
        { email: { contains: cleanSearch, mode: "insensitive" } },
        { city: { contains: cleanSearch, mode: "insensitive" } },
        { furnitureCategory: { contains: cleanSearch, mode: "insensitive" } },
        { furniturePurchased: { contains: cleanSearch, mode: "insensitive" } },
        { productName: { contains: cleanSearch, mode: "insensitive" } },
        { id: { contains: cleanSearch, mode: "insensitive" } },
        { orderNumber: { contains: cleanSearch, mode: "insensitive" } },
        { aiSummary: { contains: cleanSearch, mode: "insensitive" } },
        { reviewText: { contains: cleanSearch, mode: "insensitive" } },
        { ownerReply: { contains: cleanSearch, mode: "insensitive" } },
        { slug: { contains: cleanSearch, mode: "insensitive" } },
        { status: { contains: cleanSearch, mode: "insensitive" } },
        { language: { contains: cleanSearch, mode: "insensitive" } },
      ];
    }

    // Sorting
    let orderBy = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "highest") orderBy = { rating: "desc" };
    if (sortBy === "lowest") orderBy = { rating: "asc" };

    try {
      const take = Math.max(1, Number(limit) || 20);
      const skip = Math.max(0, (Number(page) - 1) * take);

      const dbItems = await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.findMany({
          where,
          orderBy,
          skip,
          take,
          include: {
            moderationHistory: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        });
      });

      const totalCount = await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.count({ where });
      });

      const normalized = dbItems.map((item) => createCustomerReviewPayload(item));

      return {
        reviews: normalized,
        total: totalCount,
        totalCount,
        page: Number(page),
        totalPages: Math.ceil(totalCount / take) || 1,
      };
    } catch (err) {
      console.error("[ReviewManagementRepository] getReviews DB error:", err.message);
      return {
        reviews: [],
        total: 0,
        totalCount: 0,
        page: Number(page),
        totalPages: 1,
      };
    }
  }

  /**
   * Get single review by ID from database with moderation history
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async getReviewById(id) {
    if (!id) return null;
    try {
      const found = await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.findUnique({
          where: { id },
          include: {
            moderationHistory: {
              orderBy: { createdAt: "desc" },
            },
          },
        });
      });
      return found ? createCustomerReviewPayload(found) : null;
    } catch (err) {
      console.error("[ReviewManagementRepository] getReviewById error:", err.message);
      return null;
    }
  }

  /**
   * Update review status and store transition in ReviewModerationHistory
   * @param {string} id
   * @param {string} newStatus
   * @param {string|Object|null} [reasonOrExtra]
   * @param {Object} [auditInfo]
   * @returns {Promise<Object|null>}
   */
  static async updateReviewStatus(id, newStatus, reasonOrExtra = null, auditInfo = {}) {
    if (!id) return null;

    const statusValue = REVIEW_STATUS[newStatus] || newStatus;
    const data = {
      status: statusValue,
      updatedAt: new Date(),
    };

    if (statusValue === REVIEW_STATUS.APPROVED) {
      data.publishedAt = new Date();
    }

    let actionReason = null;
    if (typeof reasonOrExtra === "string") {
      data.additionalNotes = reasonOrExtra;
      actionReason = reasonOrExtra;
    } else if (reasonOrExtra && typeof reasonOrExtra === "object") {
      if (reasonOrExtra.publishedAt) {
        data.publishedAt = new Date(reasonOrExtra.publishedAt);
      }
      if (reasonOrExtra.moderationStatus) {
        data.moderationStatus = reasonOrExtra.moderationStatus;
      }
      if (Array.isArray(reasonOrExtra.moderationReasons)) {
        data.moderationReasons = reasonOrExtra.moderationReasons;
      }
      if (reasonOrExtra.additionalNotes) {
        data.additionalNotes = reasonOrExtra.additionalNotes;
        actionReason = reasonOrExtra.additionalNotes;
      }
    }

    try {
      const existing = await db.customerReviewSubmission.findUnique({
        where: { id },
        select: { status: true, reviewerName: true, furniturePurchased: true },
      });

      const updated = await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.update({
          where: { id },
          data,
          include: {
            moderationHistory: {
              orderBy: { createdAt: "desc" },
            },
          },
        });
      });

      // Record transition in ReviewModerationHistory (Step 3)
      try {
        await db.reviewModerationHistory.create({
          data: {
            reviewId: id,
            oldStatus: existing?.status || null,
            newStatus: statusValue,
            actionBy: auditInfo.actionBy || "Admin",
            role: auditInfo.role || "ADMIN",
            reason: auditInfo.reason || actionReason || `Status changed to ${statusValue}`,
          },
        });
      } catch (histErr) {
        console.warn("[ReviewManagementRepository] History log warning:", histErr.message);
      }

      // Record notification (Step 11)
      try {
        let notifType = "ADMIN_ACTION";
        let notifTitle = `Review Status: ${statusValue}`;
        if (statusValue === "APPROVED") notifType = "REVIEW_APPROVED";
        else if (statusValue === "HIDDEN") notifType = "REVIEW_HIDDEN";
        else if (statusValue === "SPAM") notifType = "SPAM_DETECTED";
        else if (auditInfo.role === "MANAGER") notifType = "MANAGER_ACTION";

        await db.reviewNotification.create({
          data: {
            type: notifType,
            title: notifTitle,
            message: `${auditInfo.actionBy || "Moderator"} marked review by ${existing?.reviewerName || id} as ${statusValue}.`,
            reviewId: id,
            actorName: auditInfo.actionBy || "Moderator",
            actorRole: auditInfo.role || "ADMIN",
          },
        });
      } catch (notifErr) {
        console.warn("[ReviewManagementRepository] Notification log warning:", notifErr.message);
      }

      try {
        await ReviewRepository.clearCache();
      } catch (e) {}

      return createCustomerReviewPayload(updated);
    } catch (err) {
      console.error("[ReviewManagementRepository] updateReviewStatus error:", err.message);
      return null;
    }
  }

  /**
   * Bulk update status for multiple reviews and record moderation history
   * @param {Array<string>} ids
   * @param {string} newStatus
   * @param {Object} [extraFields]
   * @param {Object} [auditInfo]
   * @returns {Promise<number>}
   */
  static async bulkUpdateStatus(ids = [], newStatus, extraFields = {}, auditInfo = {}) {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    const statusValue = REVIEW_STATUS[newStatus] || newStatus;

    const data = {
      status: statusValue,
      updatedAt: new Date(),
    };

    if (statusValue === REVIEW_STATUS.APPROVED) {
      data.publishedAt = new Date();
    }
    if (extraFields?.moderationStatus) {
      data.moderationStatus = extraFields.moderationStatus;
    }

    try {
      const result = await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.updateMany({
          where: { id: { in: ids } },
          data,
        });
      });

      // Batch history recording
      try {
        for (const reviewId of ids) {
          await db.reviewModerationHistory.create({
            data: {
              reviewId,
              oldStatus: null,
              newStatus: statusValue,
              actionBy: auditInfo.actionBy || "Admin",
              role: auditInfo.role || "ADMIN",
              reason: auditInfo.reason || `Bulk action: ${statusValue}`,
            },
          });
        }
      } catch (histErr) {
        console.warn("[ReviewManagementRepository] Bulk history warning:", histErr.message);
      }

      try {
        await ReviewRepository.clearCache();
      } catch (e) {}

      return result.count;
    } catch (err) {
      console.error("[ReviewManagementRepository] bulkUpdateStatus error:", err.message);
      return 0;
    }
  }

  /**
   * Delete review: soft delete (status = HIDDEN) or permanent removal from PostgreSQL
   * Enforces role check for permanent deletion (Super Admin only).
   *
   * @param {string} id
   * @param {boolean} [soft=true]
   * @param {Object} [auditInfo]
   * @returns {Promise<boolean>}
   */
  static async deleteReview(id, soft = true, auditInfo = {}) {
    if (!id) return false;

    try {
      if (soft) {
        const existing = await db.customerReviewSubmission.findUnique({
          where: { id },
          select: { status: true, reviewerName: true },
        });

        let updated = null;
        if (existing) {
          updated = await this.executeWithRetry(async () => {
            return db.customerReviewSubmission.update({
              where: { id },
              data: {
                status: REVIEW_STATUS.DELETED,
                updatedAt: new Date(),
              },
            });
          });
        } else {
          try {
            await db.googleLocationReview.delete({ where: { id } });
            updated = true;
          } catch (e) {}
        }

        // Record history
        try {
          await db.reviewModerationHistory.create({
            data: {
              reviewId: id,
              oldStatus: existing?.status || null,
              newStatus: REVIEW_STATUS.DELETED,
              actionBy: auditInfo.actionBy || "Moderator",
              role: auditInfo.role || "ADMIN",
              reason: auditInfo.reason || "Deleted from website",
            },
          });
        } catch (histErr) {}

        // Record notification
        try {
          await db.reviewNotification.create({
            data: {
              type: "REVIEW_HIDDEN",
              title: "Review Removed from Website",
              message: `Review by ${existing?.reviewerName || id} was soft-deleted (hidden from /reviews).`,
              reviewId: id,
              actorName: auditInfo.actionBy || "Moderator",
              actorRole: auditInfo.role || "ADMIN",
            },
          });
        } catch (notifErr) {}

        try {
          await ReviewRepository.clearCache();
        } catch (e) {}

        return Boolean(updated);
      }

      // Permanent Delete (Super Admin only)
      if (auditInfo?.role === "MANAGER") {
        throw new Error("Forbidden: Managers are not authorized to permanently delete database records.");
      }

      try {
        await this.executeWithRetry(async () => {
          return db.customerReviewSubmission.delete({
            where: { id },
          });
        });
      } catch (custErr) {
        try {
          await db.googleLocationReview.delete({
            where: { id },
          });
        } catch (locErr) {
          throw custErr;
        }
      }

      try {
        await db.reviewNotification.create({
          data: {
            type: "REVIEW_DELETED",
            title: "Review Permanently Deleted",
            message: `Review ID ${id} was permanently deleted from PostgreSQL database by Super Admin.`,
            reviewId: id,
            actorName: auditInfo.actionBy || "Super Admin",
            actorRole: "ADMIN",
          },
        });
      } catch (notifErr) {}

      try {
        await ReviewRepository.clearCache();
      } catch (e) {}

      return true;
    } catch (err) {
      console.error("[ReviewManagementRepository] deleteReview error:", err.message);
      throw err;
    }
  }

  /**
   * Enterprise Owner Reply Management (Step 10):
   * Reply, Edit, Delete, Version history, Created by, Updated by, Pinned reply, Verified owner badge.
   */
  static async saveOwnerReply(id, replyText, auditInfo = {}, isPinned = false) {
    if (!id || !replyText) return null;

    try {
      const existing = await db.customerReviewSubmission.findUnique({
        where: { id },
        select: {
          ownerReply: true,
          ownerReplyBy: true,
          ownerReplyRole: true,
          ownerReplyDate: true,
          ownerReplyHistory: true,
          reviewerName: true,
        },
      });

      const currentHistory = Array.isArray(existing?.ownerReplyHistory)
        ? existing.ownerReplyHistory
        : [];

      // If an existing reply is being edited, archive previous version
      if (existing?.ownerReply && existing.ownerReply !== replyText) {
        currentHistory.unshift({
          text: existing.ownerReply,
          author: existing.ownerReplyBy || "Store Owner",
          role: existing.ownerReplyRole || "OWNER",
          date: existing.ownerReplyDate || new Date(),
        });
      }

      const updated = await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.update({
          where: { id },
          data: {
            ownerReply: String(replyText).trim(),
            ownerReplyDate: existing?.ownerReplyDate || new Date(),
            ownerReplyBy: auditInfo.actionBy || "Aameena Furniture Owner",
            ownerReplyRole: auditInfo.role || "OWNER",
            ownerReplyUpdatedAt: new Date(),
            isReplyPinned: Boolean(isPinned),
            ownerReplyHistory: currentHistory.slice(0, 10),
            updatedAt: new Date(),
          },
        });
      });

      // Record notification
      try {
        await db.reviewNotification.create({
          data: {
            type: "REPLY_ADDED",
            title: "Owner Reply Published",
            message: `${auditInfo.actionBy || "Store Owner"} replied to review by ${existing?.reviewerName || id}.`,
            reviewId: id,
            actorName: auditInfo.actionBy || "Store Owner",
            actorRole: auditInfo.role || "OWNER",
          },
        });
      } catch (notifErr) {}

      try {
        await ReviewRepository.clearCache();
      } catch (e) {}

      return createCustomerReviewPayload(updated);
    } catch (err) {
      console.error("[ReviewManagementRepository] saveOwnerReply error:", err.message);
      return null;
    }
  }

  /**
   * Delete owner reply
   */
  static async deleteOwnerReply(id, auditInfo = {}) {
    if (!id) return null;

    try {
      const updated = await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.update({
          where: { id },
          data: {
            ownerReply: null,
            ownerReplyDate: null,
            ownerReplyBy: null,
            ownerReplyRole: null,
            ownerReplyUpdatedAt: null,
            isReplyPinned: false,
            updatedAt: new Date(),
          },
        });
      });

      try {
        await ReviewRepository.clearCache();
      } catch (e) {}

      return createCustomerReviewPayload(updated);
    } catch (err) {
      console.error("[ReviewManagementRepository] deleteOwnerReply error:", err.message);
      return null;
    }
  }

  /**
   * Pin or unpin owner reply
   */
  static async togglePinOwnerReply(id, isPinned = true) {
    if (!id) return null;
    try {
      const updated = await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.update({
          where: { id },
          data: {
            isReplyPinned: Boolean(isPinned),
            updatedAt: new Date(),
          },
        });
      });
      return createCustomerReviewPayload(updated);
    } catch (err) {
      console.error("[ReviewManagementRepository] togglePinOwnerReply error:", err.message);
      return null;
    }
  }

  /**
   * Save internal staff notes for a review (Phase 8.4)
   */
  static async saveReviewNotes(id, notes = "") {
    if (!id) return null;
    try {
      const updated = await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.update({
          where: { id },
          data: {
            additionalNotes: String(notes || "").trim(),
            updatedAt: new Date(),
          },
        });
      });
      return createCustomerReviewPayload(updated);
    } catch (err) {
      console.error("[ReviewManagementRepository] saveReviewNotes error:", err.message);
      return null;
    }
  }

  /**
   * Get review moderation history by review ID (Step 3)
   */
  static async getModerationHistory(reviewId) {
    if (!reviewId) return [];
    try {
      return await this.executeWithRetry(async () => {
        return db.reviewModerationHistory.findMany({
          where: { reviewId },
          orderBy: { createdAt: "desc" },
        });
      });
    } catch (err) {
      console.error("[ReviewManagementRepository] getModerationHistory error:", err.message);
      return [];
    }
  }

  /**
   * Get review notifications (Step 11)
   */
  static async getNotifications({ unreadOnly = false, limit = 20 } = {}) {
    try {
      const where = unreadOnly ? { isRead: false } : {};
      return await this.executeWithRetry(async () => {
        return db.reviewNotification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: Math.min(100, Number(limit) || 20),
        });
      });
    } catch (err) {
      console.error("[ReviewManagementRepository] getNotifications error:", err.message);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationRead(id) {
    if (!id) return false;
    try {
      await this.executeWithRetry(async () => {
        return db.reviewNotification.update({
          where: { id },
          data: { isRead: true },
        });
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Get review counts across all status tabs and executive metrics (Step 4)
   * Tabs: Overview, Pending, Approved, Hidden, Reported, Spam, Archived, Deleted, Restored.
   * Metrics: Average Rating, Total Reviews, Published Today, Hidden Today, Spam Today, Top Cities, Top Products, Top Categories.
   *
   * @returns {Promise<Object>}
   */
  static async getReviewCountsByStatus() {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [
        pending,
        approved,
        hidden,
        rejected,
        spam,
        reported,
        archived,
        deleted,
        restored,
        total,
        publishedToday,
        hiddenToday,
        spamToday,
        allRatings,
        topCitiesRaw,
        topProductsRaw,
        topCategoriesRaw,
      ] = await Promise.all([
        db.customerReviewSubmission.count({ where: { status: "PENDING" } }),
        db.customerReviewSubmission.count({ where: { status: "APPROVED" } }),
        db.customerReviewSubmission.count({ where: { status: "HIDDEN" } }),
        db.customerReviewSubmission.count({ where: { status: "REJECTED" } }),
        db.customerReviewSubmission.count({ where: { status: "SPAM" } }),
        db.customerReviewSubmission.count({ where: { status: "REPORTED" } }),
        db.customerReviewSubmission.count({ where: { status: "ARCHIVED" } }),
        db.customerReviewSubmission.count({ where: { status: "DELETED" } }),
        db.customerReviewSubmission.count({ where: { status: "RESTORED" } }),
        db.customerReviewSubmission.count(),
        db.customerReviewSubmission.count({
          where: { status: "APPROVED", publishedAt: { gte: todayStart } },
        }),
        db.customerReviewSubmission.count({
          where: { status: "HIDDEN", updatedAt: { gte: todayStart } },
        }),
        db.customerReviewSubmission.count({
          where: { status: "SPAM", createdAt: { gte: todayStart } },
        }),
        db.customerReviewSubmission.findMany({
          select: { rating: true },
          take: 500,
        }),
        db.customerReviewSubmission.groupBy({
          by: ["city"],
          _count: { city: true },
          orderBy: { _count: { city: "desc" } },
          take: 5,
        }),
        db.customerReviewSubmission.groupBy({
          by: ["furniturePurchased"],
          _count: { furniturePurchased: true },
          where: { furniturePurchased: { not: null } },
          orderBy: { _count: { furniturePurchased: "desc" } },
          take: 5,
        }),
        db.customerReviewSubmission.groupBy({
          by: ["furnitureCategory"],
          _count: { furnitureCategory: true },
          where: { furnitureCategory: { not: null } },
          orderBy: { _count: { furnitureCategory: "desc" } },
          take: 5,
        }),
      ]);

      const sumRating = allRatings.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      const avgRating = allRatings.length > 0 ? Number((sumRating / allRatings.length).toFixed(1)) : 5.0;

      return {
        // Tab Counts
        [REVIEW_STATUS.PENDING]: pending,
        [REVIEW_STATUS.APPROVED]: approved,
        [REVIEW_STATUS.HIDDEN]: hidden,
        [REVIEW_STATUS.REJECTED]: rejected,
        [REVIEW_STATUS.SPAM]: spam,
        [REVIEW_STATUS.REPORTED]: reported,
        [REVIEW_STATUS.ARCHIVED]: archived,
        [REVIEW_STATUS.DELETED]: deleted,
        [REVIEW_STATUS.RESTORED]: restored,
        TOTAL: total,
        totalReviews: total,
        averageRating: avgRating,
        publishedToday,
        hiddenToday,
        spamToday,
        topCities: topCitiesRaw.map((c) => ({ city: c.city || "Solapur", count: c._count.city })),
        topProducts: topProductsRaw.map((p) => ({ product: p.furniturePurchased, count: p._count.furniturePurchased })),
        topCategories: topCategoriesRaw.map((c) => ({ category: c.furnitureCategory, count: c._count.furnitureCategory })),

        // Step 4 Executive Metrics
        metrics: {
          averageRating: avgRating,
          totalReviews: total,
          publishedToday,
          hiddenToday,
          spamToday,
          topCities: topCitiesRaw.map((c) => ({ city: c.city || "Solapur", count: c._count.city })),
          topProducts: topProductsRaw.map((p) => ({ product: p.furniturePurchased, count: p._count.furniturePurchased })),
          topCategories: topCategoriesRaw.map((c) => ({ category: c.furnitureCategory, count: c._count.furnitureCategory })),
        },
      };
    } catch (err) {
      console.error("[ReviewManagementRepository] getReviewCountsByStatus error:", err.message);
      return {
        [REVIEW_STATUS.PENDING]: 0,
        [REVIEW_STATUS.APPROVED]: 0,
        [REVIEW_STATUS.HIDDEN]: 0,
        [REVIEW_STATUS.REJECTED]: 0,
        [REVIEW_STATUS.SPAM]: 0,
        [REVIEW_STATUS.REPORTED]: 0,
        [REVIEW_STATUS.ARCHIVED]: 0,
        [REVIEW_STATUS.DELETED]: 0,
        [REVIEW_STATUS.RESTORED]: 0,
        TOTAL: 0,
        metrics: {
          averageRating: 5.0,
          totalReviews: 0,
          publishedToday: 0,
          hiddenToday: 0,
          spamToday: 0,
          topCities: [],
          topProducts: [],
          topCategories: [],
        },
      };
    }
  }

  /**
   * Get reviews for text similarity matching or duplicate detection
   * @returns {Promise<Array<Object>>}
   */
  static async getAllForDuplicateCheck() {
    try {
      return await this.executeWithRetry(async () => {
        return db.customerReviewSubmission.findMany({
          select: {
            id: true,
            reviewerName: true,
            reviewText: true,
            textHash: true,
            rating: true,
            status: true,
            city: true,
          },
          take: 500,
        });
      });
    } catch (err) {
      console.error("[ReviewManagementRepository] getAllForDuplicateCheck error:", err.message);
      return [];
    }
  }
}

export const reviewManagementRepository = ReviewManagementRepository;
export default ReviewManagementRepository;
