/**
 * @file reviewVerificationService.js
 * Verified Purchase System for Aameena Furniture Review Platform.
 * Connects reviews to Orders, Customer Profiles, Products, and Invoices.
 * Determines verification badges: Verified Purchase, Delivered Customer,
 * Showroom Visit, Custom Order, and Repeat Customer.
 * 100% PostgreSQL backed via Prisma.
 */

import { db } from "@/lib/prisma.js";

export const VERIFICATION_BADGES = {
  VERIFIED_PURCHASE: "VERIFIED_PURCHASE",
  DELIVERED_CUSTOMER: "DELIVERED_CUSTOMER",
  SHOWROOM_VISIT: "SHOWROOM_VISIT",
  CUSTOM_ORDER: "CUSTOM_ORDER",
  REPEAT_CUSTOMER: "REPEAT_CUSTOMER",
};

export const VERIFICATION_TYPES = {
  ORDER_MATCH: "ORDER_MATCH",
  INVOICE_MATCH: "INVOICE_MATCH",
  MANUAL_ADMIN: "MANUAL_ADMIN",
  SHOWROOM_CONFIRMED: "SHOWROOM_CONFIRMED",
};

export class ReviewVerificationService {
  /**
   * Automatically resolve verification badge for a review based on database associations.
   */
  static async autoVerifyReview(reviewId) {
    if (!reviewId) return null;

    try {
      const review = await db.customerReviewSubmission.findUnique({
        where: { id: reviewId },
      });

      if (!review) return null;

      let matchedOrder = null;
      let matchedCustomer = null;
      let matchedProduct = null;

      // 1. Try finding order by orderNumber
      if (review.orderNumber) {
        matchedOrder = await db.order.findFirst({
          where: {
            orderNumber: {
              equals: review.orderNumber.trim(),
              mode: "insensitive",
            },
          },
          include: { OrderItem: true },
        });
      }

      // 2. Try finding order by email or phone if not matched by number
      if (!matchedOrder && (review.email || review.phone)) {
        matchedOrder = await db.order.findFirst({
          where: {
            OR: [
              ...(review.email ? [{ customerEmail: { equals: review.email.trim(), mode: "insensitive" } }] : []),
              ...(review.phone ? [{ customerPhone: { equals: review.phone.trim(), mode: "insensitive" } }] : []),
            ],
          },
          include: { OrderItem: true },
          orderBy: { createdAt: "desc" },
        });
      }

      // 3. Try finding customer profile
      if (review.email || review.phone) {
        matchedCustomer = await db.customerProfile.findFirst({
          where: {
            OR: [
              ...(review.email ? [{ email: { equals: review.email.trim(), mode: "insensitive" } }] : []),
              ...(review.phone ? [{ phone: { equals: review.phone.trim(), mode: "insensitive" } }] : []),
            ],
          },
        });
      }

      // 4. Try matching product by name or furniture purchased
      const prodSearch = review.productName || review.furniturePurchased;
      if (prodSearch) {
        matchedProduct = await db.product.findFirst({
          where: {
            title: { contains: prodSearch.trim(), mode: "insensitive" },
          },
        });
      }

      // Determine appropriate badge
      let badge = null;
      let isVerified = false;
      let verificationType = null;
      let deliveryStatus = matchedOrder ? matchedOrder.status : review.deliveryStatus || null;

      if (matchedOrder) {
        isVerified = true;
        verificationType = VERIFICATION_TYPES.ORDER_MATCH;
        if (matchedOrder.status === "DELIVERED") {
          badge = VERIFICATION_BADGES.DELIVERED_CUSTOMER;
          deliveryStatus = "DELIVERED";
        } else {
          badge = VERIFICATION_BADGES.VERIFIED_PURCHASE;
        }
      } else if (review.visitedShowroom) {
        isVerified = true;
        badge = VERIFICATION_BADGES.SHOWROOM_VISIT;
        verificationType = VERIFICATION_TYPES.SHOWROOM_CONFIRMED;
      } else if (review.customization && review.customization.trim().length > 3) {
        badge = VERIFICATION_BADGES.CUSTOM_ORDER;
      }

      // Check if repeat customer
      if (matchedCustomer && matchedCustomer.totalOrders > 1) {
        badge = VERIFICATION_BADGES.REPEAT_CUSTOMER;
      }

      // Update review record with verified linkages
      const updated = await db.customerReviewSubmission.update({
        where: { id: reviewId },
        data: {
          isVerified: isVerified || review.isVerified,
          verificationBadge: badge || review.verificationBadge || (isVerified ? VERIFICATION_BADGES.VERIFIED_PURCHASE : null),
          verificationType: verificationType || review.verificationType,
          orderId: matchedOrder ? matchedOrder.id : review.orderId,
          customerId: matchedCustomer ? matchedCustomer.id : review.customerId,
          productId: matchedProduct ? matchedProduct.id : review.productId,
          deliveryStatus: deliveryStatus || (matchedOrder ? matchedOrder.status : null),
          verifiedAt: isVerified && !review.verifiedAt ? new Date() : review.verifiedAt,
          verifiedBy: isVerified && !review.verifiedBy ? "Verification Engine" : review.verifiedBy,
        },
      });

      return updated;
    } catch (err) {
      console.error("[ReviewVerificationService.autoVerifyReview] Error:", err.message);
      return null;
    }
  }

  /**
   * Admin manual verification of a review.
   */
  static async verifyReviewManually({
    reviewId,
    verificationBadge = VERIFICATION_BADGES.VERIFIED_PURCHASE,
    verificationType = VERIFICATION_TYPES.MANUAL_ADMIN,
    adminName = "Super Admin",
    notes = null,
    orderId = null,
    invoiceNumber = null,
  }) {
    if (!reviewId) throw new Error("reviewId is required");

    try {
      const existing = await db.customerReviewSubmission.findUnique({
        where: { id: reviewId },
      });
      if (!existing) throw new Error("Review not found");

      const [updatedReview] = await db.$transaction([
        db.customerReviewSubmission.update({
          where: { id: reviewId },
          data: {
            isVerified: true,
            verificationBadge,
            verificationType,
            verifiedBy: adminName,
            verifiedAt: new Date(),
            verificationNotes: notes,
            verificationRequested: false,
            ...(orderId ? { orderId } : {}),
            ...(invoiceNumber ? { invoiceNumber } : {}),
          },
        }),
        db.reviewModerationHistory.create({
          data: {
            reviewId,
            action: "VERIFIED",
            oldStatus: existing.status,
            newStatus: existing.status,
            actionBy: adminName,
            role: "ADMIN",
            reason: `Manually verified as ${verificationBadge}. ${notes || ""}`.trim(),
            metadata: { verificationBadge, verificationType, notes, invoiceNumber },
          },
        }),
      ]);

      return { success: true, review: updatedReview };
    } catch (err) {
      console.error("[ReviewVerificationService.verifyReviewManually] Error:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Manager requests verification for an unverified review.
   */
  static async requestVerification({
    reviewId,
    managerName = "Showroom Manager",
    reason = "Customer confirmed order details at Solapur showroom.",
  }) {
    if (!reviewId) throw new Error("reviewId is required");

    try {
      const existing = await db.customerReviewSubmission.findUnique({
        where: { id: reviewId },
      });
      if (!existing) throw new Error("Review not found");

      const [updatedReview] = await db.$transaction([
        db.customerReviewSubmission.update({
          where: { id: reviewId },
          data: {
            verificationRequested: true,
            verificationRequestReason: reason,
            verificationRequestBy: managerName,
            verificationRequestAt: new Date(),
          },
        }),
        db.reviewModerationHistory.create({
          data: {
            reviewId,
            action: "VERIFICATION_REQUESTED",
            oldStatus: existing.status,
            newStatus: existing.status,
            actionBy: managerName,
            role: "MANAGER",
            reason: `Requested verification: ${reason}`,
            metadata: { managerName, reason },
          },
        }),
        db.enterpriseNotification.create({
          data: {
            type: "REVIEW_SUBMITTED",
            title: "Review Verification Requested",
            message: `${managerName} requested purchase verification for ${existing.reviewerName}'s review.`,
            severity: "INFO",
            targetRole: "SUPER_ADMIN",
            entityId: reviewId,
            actorName: managerName,
          },
        }),
      ]);

      return { success: true, review: updatedReview };
    } catch (err) {
      console.error("[ReviewVerificationService.requestVerification] Error:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Batch auto-verify all reviews in the database.
   */
  static async autoVerifyAllReviews() {
    try {
      const reviews = await db.customerReviewSubmission.findMany({
        select: { id: true },
      });

      let verifiedCount = 0;
      for (const r of reviews) {
        const res = await this.autoVerifyReview(r.id);
        if (res && res.isVerified) verifiedCount++;
      }

      return { success: true, total: reviews.length, verifiedCount };
    } catch (err) {
      console.error("[ReviewVerificationService.autoVerifyAllReviews] Error:", err.message);
      return { success: false, error: err.message };
    }
  }
}

export default ReviewVerificationService;
