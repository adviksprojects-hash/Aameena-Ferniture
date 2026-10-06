"use client";

/**
 * @file useReviewSubmission.js
 * Client hook managing state, validation, AI assistance, image uploads,
 * and submission lifecycle for the public /review page.
 */

import { useState, useCallback, useRef } from "react";
import {
  submitCustomerReviewAction,
  autoFillReviewAction,
} from "../actions/reviewManagementActions.js";

const INITIAL_FORM_STATE = {
  // Required fields (ONLY 3)
  reviewerName: "",
  rating: 5,
  reviewText: "",

  // Optional personal & visit details
  email: "",
  phone: "",
  city: "Solapur",
  visitedShowroom: false,
  wouldRecommend: true,
  language: "en",

  // Optional purchase / product details (if applicable)
  furniturePurchased: "",
  furnitureCategory: "",
  productName: "",
  orderNumber: "",
  woodType: "",
  customization: "",
  budget: "",
  staffName: "",
  purchaseDate: "",
  deliveryDate: "",
  additionalNotes: "",

  // Optional uploaded images
  images: [],
};

export function useReviewSubmission(initialValues = {}) {
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM_STATE,
    ...initialValues,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedReview, setSubmittedReview] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Modals state
  const [isAiWriterOpen, setIsAiWriterOpen] = useState(false);
  const [isAiImproveOpen, setIsAiImproveOpen] = useState(false);

  // Accordion state for optional details to keep form ultra-clean
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);

  // AI Auto Fill state
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const submitBtnRef = useRef(null);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear specific field error when user modifies
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  const addImages = useCallback((newImages) => {
    setFormData((prev) => {
      const merged = [...prev.images, ...(Array.isArray(newImages) ? newImages : [newImages])];
      return { ...prev, images: merged.slice(0, 6) };
    });
  }, []);

  const removeImage = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const applyGeneratedReview = useCallback((text) => {
    if (text) {
      setFormData((prev) => ({ ...prev, reviewText: text }));
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.reviewText;
        return copy;
      });
    }
  }, []);

  /**
   * Single-click AI Auto Fill — generates name, rating, review text in one action.
   * Each click produces a unique, immutable result.
   */
  const handleAutoFill = useCallback(async () => {
    if (isAutoFilling) return;
    setIsAutoFilling(true);
    setErrors([]);
    setFieldErrors({});

    try {
      const result = await autoFillReviewAction({ language: formData.language });

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          reviewerName: result.reviewerName || prev.reviewerName,
          rating: result.rating || prev.rating,
          reviewText: result.reviewText || prev.reviewText,
        }));

        // Auto-scroll to submit button so user can see the filled form
        setTimeout(() => {
          submitBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      } else {
        setErrors([result.error || "Auto fill failed. Please try again."]);
      }
    } catch (err) {
      setErrors([err.message || "Auto fill encountered an error."]);
    } finally {
      setIsAutoFilling(false);
    }
  }, [isAutoFilling, formData.language]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setErrors([]);
    setFieldErrors({});
    setIsSuccess(false);
    setSubmittedReview(null);
    setDuplicateWarning(null);
  }, []);

  const submitForm = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();

      // Client-side quick check on the 3 required fields
      const errMap = {};
      if (!formData.reviewerName?.trim()) {
        errMap.reviewerName = "Reviewer name is required";
      }
      if (!formData.reviewText?.trim()) {
        errMap.reviewText = "Review text is required";
      } else if (formData.reviewText.trim().length < 10) {
        errMap.reviewText = "Please write at least 10 characters";
      }
      if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
        errMap.rating = "Rating must be between 1 and 5 stars";
      }

      if (Object.keys(errMap).length > 0) {
        setFieldErrors(errMap);
        setErrors(Object.values(errMap));
        return { success: false, errors: Object.values(errMap) };
      }

      setIsSubmitting(true);
      setErrors([]);
      setFieldErrors({});
      setDuplicateWarning(null);

      try {
        const response = await submitCustomerReviewAction(formData);

        if (response.success) {
          setIsSuccess(true);
          setSubmittedReview(response.review);
          if (response.duplicateWarning) {
            setDuplicateWarning(response.duplicateWarning);
          }
          return response;
        } else {
          setErrors(response.errors || ["Failed to submit review. Please try again."]);
          return response;
        }
      } catch (err) {
        const msg = err.message || "An unexpected network error occurred";
        setErrors([msg]);
        return { success: false, errors: [msg] };
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData]
  );

  return {
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
    isAiImproveOpen,
    setIsAiImproveOpen,
    isAutoFilling,
    submitBtnRef,
    updateField,
    addImages,
    removeImage,
    applyGeneratedReview,
    handleAutoFill,
    resetForm,
    submitForm,
  };
}
