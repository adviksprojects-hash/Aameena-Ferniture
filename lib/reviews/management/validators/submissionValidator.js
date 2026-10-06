/**
 * @file submissionValidator.js
 * Review submission validation rules.
 *
 * STRICT GOVERNANCE:
 * - REQUIRED: Reviewer Name, Rating (1-5), Review Text.
 * - ALL other fields MUST remain strictly optional (Email, Phone, City, Products,
 *   Category, Dates, Budget, Customization, Images, Visited Showroom).
 * - Allows non-purchasing showroom visitors, design consultants, and browsers to submit feedback.
 */

export function validateReviewSubmission(payload = {}) {
  const errors = {};

  // 1. REQUIRED: Reviewer Name (min 2 chars)
  const name = String(payload.reviewerName || "").trim();
  if (!name) {
    errors.reviewerName = "Reviewer name is required. Please enter your name.";
  } else if (name.length < 2) {
    errors.reviewerName = "Reviewer name must be at least 2 characters long.";
  } else if (name.length > 80) {
    errors.reviewerName = "Reviewer name cannot exceed 80 characters.";
  }

  // 2. REQUIRED: Rating (1 to 5)
  const rating = Number(payload.rating);
  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    errors.rating = "Please select a rating between 1 and 5 stars.";
  }

  // 3. REQUIRED: Review Text (min 10 chars, max 2000 chars)
  const text = String(payload.reviewText || "").trim();
  if (!text) {
    errors.reviewText = "Please write your review feedback.";
  } else if (text.length < 10) {
    errors.reviewText = "Review text must be at least 10 characters long.";
  } else if (text.length > 2000) {
    errors.reviewText = "Review text cannot exceed 2,000 characters.";
  }

  // 4. OPTIONAL: Email validation (only if provided)
  if (payload.email && String(payload.email).trim()) {
    const email = String(payload.email).trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
  }

  // 5. OPTIONAL: Phone validation (only if provided)
  if (payload.phone && String(payload.phone).trim()) {
    const cleanPhone = String(payload.phone).replace(/[\s\-\(\)\+]/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone.slice(-10))) {
      errors.phone = "Please enter a valid 10-digit mobile number.";
    }
  }

  // 6. OPTIONAL: Images count check (max 6 images)
  const maxImages = Number(process.env.MAX_REVIEW_IMAGES) || 6;
  if (Array.isArray(payload.images) && payload.images.length > maxImages) {
    errors.images = `You can upload a maximum of ${maxImages} images.`;
  }

  const sanitized = {
    reviewerName: name,
    rating: isNaN(rating) ? 5 : rating,
    reviewText: text,
    email: payload.email ? String(payload.email).trim().toLowerCase() : null,
    phone: payload.phone ? String(payload.phone).trim() : null,
    city: payload.city ? String(payload.city).trim() : "Solapur",
    furniturePurchased: payload.furniturePurchased ? String(payload.furniturePurchased).trim() : null,
    furnitureCategory: payload.furnitureCategory ? String(payload.furnitureCategory).trim() : null,
    productName: payload.productName ? String(payload.productName).trim() : null,
    orderNumber: payload.orderNumber ? String(payload.orderNumber).trim() : null,
    images: Array.isArray(payload.images) ? payload.images.slice(0, maxImages) : [],
    language: payload.language ? String(payload.language).toLowerCase() : "en",
    wouldRecommend: payload.wouldRecommend !== undefined ? Boolean(payload.wouldRecommend) : true,
    visitedShowroom: Boolean(payload.visitedShowroom),
    purchaseDate: payload.purchaseDate || null,
    deliveryDate: payload.deliveryDate || null,
    customization: payload.customization ? String(payload.customization).trim() : null,
    woodType: payload.woodType ? String(payload.woodType).trim() : null,
    budget: payload.budget ? String(payload.budget).trim() : null,
    staffName: payload.staffName ? String(payload.staffName).trim() : null,
    additionalNotes: payload.additionalNotes ? String(payload.additionalNotes).trim() : null,
  };

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.values(errors),
    fieldErrors: errors,
    sanitized,
  };
}
