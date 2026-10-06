"use client";

/**
 * @file ReviewSubmissionForm.jsx
 * Public review submission form for /review.
 * Enforces minimal required fields (Name, Rating, Text) while welcoming
 * visitors, browsers, and buyers alike. Integrates Gemini AI Writer and Image Uploader.
 */

import React from "react";
import {
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  HeartHandshake,
  Building,
  Wand2,
} from "lucide-react";
import { useReviewSubmission } from "../hooks/useReviewSubmission.js";
import { ImageUploader } from "./ImageUploader.jsx";
import { AiReviewWriterModal } from "./AiReviewWriterModal.jsx";

export function ReviewSubmissionForm() {
  const {
    formData,
    isSubmitting,
    isSuccess,
    errors,
    fieldErrors,
    submittedReview,
    duplicateWarning,
    showOptionalDetails,
    setShowOptionalDetails,
    isAiWriterOpen,
    setIsAiWriterOpen,
    isAutoFilling,
    submitBtnRef,
    updateField,
    addImages,
    removeImage,
    applyGeneratedReview,
    handleAutoFill,
    resetForm,
    submitForm,
  } = useReviewSubmission();

  // If successfully submitted, render celebration view
  if (isSuccess && submittedReview) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
            Thank You for Your Feedback!
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto">
            Your review for <strong>Aameena Furniture</strong> has been received. Our team values every genuine visitor and customer experience.
          </p>
        </div>

        {duplicateWarning && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        {/* Review summary preview */}
        <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-900 dark:text-white text-sm">
              {submittedReview.reviewerName}
            </span>
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= submittedReview.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300 dark:text-stone-600"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
            &ldquo;{submittedReview.reviewText}&rdquo;
          </p>
          {submittedReview.images?.length > 0 && (
            <div className="text-[11px] text-stone-400">
              {submittedReview.images.length} photo(s) attached
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="px-6 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Submit Another Review
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={submitForm}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        {/* Form Title & Subtitle */}
        <div className="space-y-1.5 border-b border-stone-100 dark:border-stone-800 pb-5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>Community Feedback</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Share Your Experience
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Purchased furniture, browsed our showroom, or spoke with our team? We welcome all genuine reviews.
          </p>
        </div>

        {/* ⚡ AI AUTO FILL — Primary CTA, first interactive element */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                Need help writing a review?
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Click once to auto-generate a complete, natural-sounding review with AI.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isAutoFilling || isSubmitting}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all"
            >
              {isAutoFilling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Auto Fill with AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Top-level error summary */}
        {errors.length > 0 && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-400 space-y-1">
            <strong>Please resolve the following:</strong>
            <ul className="list-disc list-inside">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 1. Rating Selector (REQUIRED) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200 flex items-center justify-between">
            <span>Overall Rating *</span>
            <span className="text-amber-600 font-semibold lowercase">
              {formData.rating === 5
                ? "Excellent (5/5)"
                : formData.rating === 4
                ? "Very Good (4/5)"
                : formData.rating === 3
                ? "Average (3/5)"
                : formData.rating === 2
                ? "Needs Improvement (2/5)"
                : "Disappointed (1/5)"}
            </span>
          </label>
          <div className="flex items-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateField("rating", star)}
                className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform"
                title={`${star} Star`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                    star <= formData.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300 dark:text-stone-700"
                  }`}
                />
              </button>
            ))}
          </div>
          {fieldErrors.rating && (
            <p className="text-xs text-red-500">{fieldErrors.rating}</p>
          )}
        </div>

        {/* 2. Reviewer Name (REQUIRED) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200">
            Your Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.reviewerName}
            onChange={(e) => updateField("reviewerName", e.target.value)}
            placeholder="e.g. Ramesh Kulkarni"
            className="w-full text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 p-3 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 dark:text-white"
          />
          {fieldErrors.reviewerName && (
            <p className="text-xs text-red-500">{fieldErrors.reviewerName}</p>
          )}
        </div>

        {/* 3. Review Text (REQUIRED) + AI Writer Button */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200">
              Your Review *
            </label>
            <button
              type="button"
              onClick={() => setIsAiWriterOpen(true)}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Review Assistant</span>
            </button>
          </div>
          <textarea
            required
            rows={4}
            value={formData.reviewText}
            onChange={(e) => updateField("reviewText", e.target.value)}
            placeholder="Tell us what you liked about our showroom, furniture quality, wood finishing, or customer service..."
            className="w-full text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 p-3.5 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 dark:text-white leading-relaxed"
          />
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>Minimum 10 characters</span>
            <span>{formData.reviewText.length} characters</span>
          </div>
          {fieldErrors.reviewText && (
            <p className="text-xs text-red-500">{fieldErrors.reviewText}</p>
          )}
        </div>

        {/* 4. Image Upload (OPTIONAL) */}
        <ImageUploader
          images={formData.images}
          onImagesChange={(newImgs) => updateField("images", newImgs)}
          disabled={isSubmitting}
        />

        {/* 5. Collapsible Optional Details Accordion */}
        <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowOptionalDetails(!showOptionalDetails)}
            className="w-full px-4 py-3 bg-stone-50/80 dark:bg-stone-800/60 hover:bg-stone-100/80 dark:hover:bg-stone-800 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-stone-400" />
              <span>Add Visit & Product Details (Optional)</span>
            </div>
            {showOptionalDetails ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {showOptionalDetails && (
            <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 text-xs">
              <p className="text-stone-500 text-[11px]">
                None of these are required. Fill only what is relevant to your visit or order.
              </p>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-600 dark:text-stone-300 font-medium">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 p-2 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-600 dark:text-stone-300 font-medium">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="9876543210"
                    className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 p-2 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-600 dark:text-stone-300 font-medium">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Solapur"
                    className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 p-2 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Purchase / Experience details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-600 dark:text-stone-300 font-medium">
                    Furniture Purchased / Viewed
                  </label>
                  <input
                    type="text"
                    value={formData.furniturePurchased}
                    onChange={(e) => updateField("furniturePurchased", e.target.value)}
                    placeholder="e.g. Teak Wood Dining Table, Sofa Set, Wardrobe"
                    className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 p-2 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-600 dark:text-stone-300 font-medium">
                    Wood Type / Material
                  </label>
                  <input
                    type="text"
                    value={formData.woodType}
                    onChange={(e) => updateField("woodType", e.target.value)}
                    placeholder="e.g. Pure Teak, Sheesham, Engineered"
                    className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 p-2 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-600 dark:text-stone-300 font-medium">Order Number</label>
                  <input
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => updateField("orderNumber", e.target.value)}
                    placeholder="e.g. ORD-2024-889"
                    className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 p-2 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-600 dark:text-stone-300 font-medium">Staff Member Name</label>
                  <input
                    type="text"
                    value={formData.staffName}
                    onChange={(e) => updateField("staffName", e.target.value)}
                    placeholder="e.g. Imran Bhai"
                    className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 p-2 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-600 dark:text-stone-300 font-medium">Budget</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => updateField("budget", e.target.value)}
                    placeholder="e.g. ₹45,000"
                    className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 p-2 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Checkbox toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visitedShowroom}
                    onChange={(e) => updateField("visitedShowroom", e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-stone-700 dark:text-stone-300">
                    I personally visited the Solapur showroom
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.wouldRecommend}
                    onChange={(e) => updateField("wouldRecommend", e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-stone-700 dark:text-stone-300">
                    I would recommend Aameena Furniture to friends & family
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          ref={submitBtnRef}
          type="submit"
          disabled={isSubmitting || isAutoFilling}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying & Submitting Review...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Review</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-stone-400">
          Reviews are checked for authentic community standards prior to public display.
        </p>
      </form>

      {/* AI Assistant Modal */}
      <AiReviewWriterModal
        isOpen={isAiWriterOpen}
        onClose={() => setIsAiWriterOpen(false)}
        onApply={applyGeneratedReview}
        currentRating={formData.rating}
      />
    </div>
  );
}
