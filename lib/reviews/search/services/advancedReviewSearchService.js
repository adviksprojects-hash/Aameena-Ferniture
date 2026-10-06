/**
 * @file advancedReviewSearchService.js
 * Advanced Multi-Dimensional Review Search Engine V2 for Aameena Furniture.
 * Queries PostgreSQL with 18+ concurrent filter dimensions:
 * Review ID, Customer, Phone, Email, City, Product, Wood, Category, Staff, Rating,
 * Date Range, Order Number, Invoice Number, Status, Fraud Status, Verification,
 * Health Grade, Language, Owner Reply, and Media.
 */

import { db } from "@/lib/prisma.js";

export class AdvancedReviewSearchService {
  /**
   * Execute multi-dimensional search across PostgreSQL customer reviews.
   */
  static async searchReviews(params = {}) {
    const {
      query = "",
      reviewId = "",
      customerName = "",
      phone = "",
      email = "",
      city = "",
      product = "",
      woodType = "",
      category = "",
      staffName = "",
      minRating,
      maxRating,
      startDate,
      endDate,
      orderNumber = "",
      invoiceNumber = "",
      status = "ALL",
      moderationStatus = "ALL",
      isVerified = "ALL", // "ALL", "TRUE", "FALSE"
      verificationBadge = "ALL",
      healthGrade = "ALL",
      language = "ALL",
      hasOwnerReply = "ALL", // "ALL", "YES", "NO"
      hasImages = "ALL", // "ALL", "YES", "NO"
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const take = Number(limit);

    const where = {};
    const andClauses = [];

    // 1. General free-text query
    if (query && query.trim().length > 0) {
      const q = query.trim();
      andClauses.push({
        OR: [
          { reviewerName: { contains: q, mode: "insensitive" } },
          { reviewText: { contains: q, mode: "insensitive" } },
          { furniturePurchased: { contains: q, mode: "insensitive" } },
          { woodType: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { staffName: { contains: q, mode: "insensitive" } },
          { orderNumber: { contains: q, mode: "insensitive" } },
          { invoiceNumber: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    // 2. Specific field filters
    if (reviewId && reviewId.trim()) {
      andClauses.push({ id: { contains: reviewId.trim(), mode: "insensitive" } });
    }
    if (customerName && customerName.trim()) {
      andClauses.push({ reviewerName: { contains: customerName.trim(), mode: "insensitive" } });
    }
    if (phone && phone.trim()) {
      andClauses.push({ phone: { contains: phone.trim(), mode: "insensitive" } });
    }
    if (email && email.trim()) {
      andClauses.push({ email: { contains: email.trim(), mode: "insensitive" } });
    }
    if (city && city.trim() && city !== "ALL") {
      andClauses.push({ city: { contains: city.trim(), mode: "insensitive" } });
    }
    if (product && product.trim()) {
      andClauses.push({
        OR: [
          { furniturePurchased: { contains: product.trim(), mode: "insensitive" } },
          { productName: { contains: product.trim(), mode: "insensitive" } },
        ],
      });
    }
    if (woodType && woodType.trim() && woodType !== "ALL") {
      andClauses.push({ woodType: { contains: woodType.trim(), mode: "insensitive" } });
    }
    if (category && category.trim() && category !== "ALL") {
      andClauses.push({ furnitureCategory: { contains: category.trim(), mode: "insensitive" } });
    }
    if (staffName && staffName.trim()) {
      andClauses.push({ staffName: { contains: staffName.trim(), mode: "insensitive" } });
    }
    if (orderNumber && orderNumber.trim()) {
      andClauses.push({ orderNumber: { contains: orderNumber.trim(), mode: "insensitive" } });
    }
    if (invoiceNumber && invoiceNumber.trim()) {
      andClauses.push({ invoiceNumber: { contains: invoiceNumber.trim(), mode: "insensitive" } });
    }

    // 3. Rating bounds
    if (minRating !== undefined && minRating !== null && minRating !== "") {
      andClauses.push({ rating: { gte: Number(minRating) } });
    }
    if (maxRating !== undefined && maxRating !== null && maxRating !== "") {
      andClauses.push({ rating: { lte: Number(maxRating) } });
    }

    // 4. Date range
    if (startDate) {
      andClauses.push({ createdAt: { gte: new Date(startDate) } });
    }
    if (endDate) {
      andClauses.push({ createdAt: { lte: new Date(endDate) } });
    }

    // 5. Status & Moderation
    if (status && status !== "ALL") {
      andClauses.push({ status });
    }
    if (moderationStatus && moderationStatus !== "ALL") {
      andClauses.push({ moderationStatus });
    }

    // 6. Verification
    if (isVerified === "TRUE" || isVerified === true) {
      andClauses.push({ isVerified: true });
    } else if (isVerified === "FALSE" || isVerified === false) {
      andClauses.push({ isVerified: false });
    }
    if (verificationBadge && verificationBadge !== "ALL") {
      andClauses.push({ verificationBadge });
    }

    // 7. Health Grade & Language
    if (healthGrade && healthGrade !== "ALL") {
      andClauses.push({ healthGrade });
    }
    if (language && language !== "ALL") {
      andClauses.push({ language });
    }

    // 8. Owner Reply filter
    if (hasOwnerReply === "YES") {
      andClauses.push({ ownerReply: { not: null } });
    } else if (hasOwnerReply === "NO") {
      andClauses.push({ ownerReply: null });
    }

    // 9. Images filter
    if (hasImages === "YES") {
      andClauses.push({ images: { isEmpty: false } });
    } else if (hasImages === "NO") {
      andClauses.push({ images: { isEmpty: true } });
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    try {
      const [reviews, total] = await Promise.all([
        db.customerReviewSubmission.findMany({
          where,
          include: {
            customer: { select: { fullName: true, vipLevel: true, city: true } },
            product: { select: { title: true, woodType: true } },
            order: { select: { orderNumber: true, totalAmount: true, status: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take,
        }),
        db.customerReviewSubmission.count({ where }),
      ]);

      return {
        success: true,
        reviews,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / take) || 1,
        filtersApplied: andClauses.length,
      };
    } catch (err) {
      console.error("[AdvancedReviewSearchService.searchReviews] Error:", err.message);
      return {
        success: false,
        error: err.message,
        reviews: [],
        total: 0,
        page: 1,
        totalPages: 1,
        filtersApplied: 0,
      };
    }
  }
}

export default AdvancedReviewSearchService;
