"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Star,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Globe,
  MessageSquareText,
  ChevronDown,
  Check,
  RotateCcw,
  Edit2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import ReviewProgress from "./ReviewProgress";
import RatingSelector from "./RatingSelector";
import CategorySelector from "./CategorySelector";
import ProductSelector from "./ProductSelector";
import LanguageSelector, { SUPPORTED_LANGUAGES } from "./LanguageSelector";
import ExperienceSelector from "./ExperienceSelector";
import FeedbackTextarea from "./FeedbackTextarea";
import ReviewGenerator from "./ai/ReviewGenerator";
import ReviewCarousel from "./ReviewCarousel";
import ReviewLoading from "./ReviewLoading";
import ReviewEmptyState from "./ReviewEmptyState";
import ReviewErrorState from "./ReviewErrorState";
import ReviewPreview from "./ReviewPreview";
import QuickReviewCard from "./QuickReviewCard";
import {
  BUSINESS_NAME,
  openGoogleReview,
  GOOGLE_WRITE_REVIEW_URL,
  copyToClipboard,
} from "./clipboard";
import { getRandomFivePrompts, submitVerifiedReview } from "@/actions/reviewActions";
import { validatePhone } from "@/lib/validation";

export default function ReviewWizard() {
  // Review Mode: 'quick' (mobile-first 1-click submit) vs 'detailed' (4-step custom furniture wizard)
  const [reviewMode, setReviewMode] = useState("quick");

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepReached, setHighestStepReached] = useState(1);

  // ============================================================
  // PHASE 2 STATE MANAGEMENT (STEP 10)
  // No localStorage. No database persistence on input.
  // ============================================================
  const [rating, setRating] = useState(5);

  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");

  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customProduct, setCustomProduct] = useState("");

  const [language, setLanguage] = useState("en");
  const [experience, setExperience] = useState([]);
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [isDirectShowroom, setIsDirectShowroom] = useState(false);

  // Validation state (Step 9)
  const [validationErrors, setValidationErrors] = useState({});
  const [validationBanner, setValidationBanner] = useState(null);
  const formTopRef = useRef(null);

  // Step 3 / 4 Legacy Suggestion and Preview pipeline (preserved without regressions)
  const [prompts, setPrompts] = useState([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptsError, setPromptsError] = useState(null);

  const [reviewText, setReviewText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorError, setAuthorError] = useState(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // ============================================================
  // STEP 14: FUTURE COMPATIBILITY DATA OBJECT FOR AI GENERATOR
  // ============================================================
  const aiReadyPayload = useMemo(() => {
    if (isDirectShowroom) {
      return {
        rating: Number(rating) || 5,
        category: "Showroom Visit",
        categoryId: "showroom-visit",
        product: "Showroom & Store Visit",
        productId: null,
        customProduct: null,
        language: language || "en",
        experience: Array.isArray(experience) ? experience : [],
        additionalFeedback: additionalFeedback ? additionalFeedback.trim() : null,
        isShowroomOnly: true,
        isRatingOnly: true,
      };
    }

    const hasCategory = Boolean(categoryName || categorySlug);
    const effectiveCategory = hasCategory ? (categoryName || categorySlug) : "Furniture Craftsmanship";

    let effectiveProduct = null;
    if (isCustomMode && customProduct && customProduct.trim()) {
      effectiveProduct = customProduct.trim();
    } else if (productName && productName !== "Other / Custom Furniture") {
      effectiveProduct = productName;
    } else {
      effectiveProduct = "Sagwan Teak Furniture";
    }

    return {
      rating: Number(rating) || 5,
      category: effectiveCategory,
      categoryId: categoryId || categorySlug || null,
      product: effectiveProduct,
      productId: isCustomMode ? null : productId || null,
      customProduct: isCustomMode && customProduct ? customProduct.trim() : null,
      language: language || "en",
      experience: Array.isArray(experience) ? experience : [],
      additionalFeedback: additionalFeedback ? additionalFeedback.trim() : null,
      isShowroomOnly: false,
      isRatingOnly: false,
    };
  }, [
    isDirectShowroom,
    rating,
    categoryName,
    categorySlug,
    categoryId,
    isCustomMode,
    customProduct,
    productName,
    productId,
    language,
    experience,
    additionalFeedback,
  ]);

  const [isHydrated, setIsHydrated] = useState(false);

  // Restore wizard state across page refresh or back/forward navigation
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved =
          sessionStorage.getItem("aameena_wizard_state") ||
          localStorage.getItem("aameena_wizard_state");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.reviewMode) setReviewMode(parsed.reviewMode);
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
          if (parsed.highestStepReached) setHighestStepReached(parsed.highestStepReached);
          if (parsed.rating) setRating(parsed.rating);
          if (parsed.categoryId !== undefined) setCategoryId(parsed.categoryId);
          if (parsed.categoryName !== undefined) setCategoryName(parsed.categoryName);
          if (parsed.categorySlug !== undefined) setCategorySlug(parsed.categorySlug);
          if (parsed.productId !== undefined) setProductId(parsed.productId);
          if (parsed.productName !== undefined) setProductName(parsed.productName);
          if (parsed.isCustomMode !== undefined) setIsCustomMode(parsed.isCustomMode);
          if (parsed.customProduct !== undefined) setCustomProduct(parsed.customProduct);
          if (parsed.language) setLanguage(parsed.language);
          if (Array.isArray(parsed.experience)) setExperience(parsed.experience);
          if (parsed.additionalFeedback !== undefined) setAdditionalFeedback(parsed.additionalFeedback);
          if (parsed.reviewText) setReviewText(parsed.reviewText);
          if (parsed.authorName !== undefined) setAuthorName(parsed.authorName);
          if (parsed.phone !== undefined) setPhone(parsed.phone);
        }
      }
    } catch (e) {
      console.warn("Failed to restore wizard state:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist wizard state on state changes after initial hydration
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    try {
      const stateToSave = {
        reviewMode,
        currentStep,
        highestStepReached,
        rating,
        categoryId,
        categoryName,
        categorySlug,
        productId,
        productName,
        isCustomMode,
        customProduct,
        language,
        experience,
        additionalFeedback,
        reviewText,
        authorName,
        phone,
      };
      sessionStorage.setItem("aameena_wizard_state", JSON.stringify(stateToSave));
      localStorage.setItem("aameena_wizard_state", JSON.stringify(stateToSave));
    } catch (e) {
      console.warn("Failed to persist wizard state:", e);
    }
  }, [
    isHydrated,
    currentStep,
    highestStepReached,
    rating,
    categoryId,
    categoryName,
    categorySlug,
    productId,
    productName,
    isCustomMode,
    customProduct,
    language,
    experience,
    additionalFeedback,
    reviewText,
    authorName,
    phone,
    reviewMode,
  ]);

  // Derived effective product name for display
  const effectiveDisplayProductName = isCustomMode
    ? customProduct.trim() || "Custom Furniture Piece"
    : productName || "Solapur Hardwood Piece";

  // Pre-load suggestions pool for Step 3
  const loadPrompts = async (targetRating) => {
    const starVal = Number(targetRating) || rating || 5;
    setLoadingPrompts(true);
    setPromptsError(null);

    try {
      const res = await getRandomFivePrompts(starVal, 6);
      if (res.success && Array.isArray(res.prompts)) {
        setPrompts(res.prompts);
        if (res.prompts.length > 0) {
          setSelectedPromptIndex(0);
          setSelectedPrompt(res.prompts[0]);
          setReviewText((prev) => prev || res.prompts[0].quoteText);
        }
      } else {
        setPrompts([]);
      }
    } catch (err) {
      console.error("Error loading review pool:", err);
      setPromptsError("Unable to load review suggestions pool.");
    } finally {
      setLoadingPrompts(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function initPrompts() {
      try {
        const res = await getRandomFivePrompts(rating, 6);
        if (!ignore && res.success && Array.isArray(res.prompts)) {
          setPrompts(res.prompts);
          if (res.prompts.length > 0) {
            setSelectedPromptIndex(0);
            setSelectedPrompt(res.prompts[0]);
            setReviewText((prev) => prev || res.prompts[0].quoteText);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Suggestions init error:", err);
        }
      }
    }
    initPrompts();
    return () => {
      ignore = true;
    };
  }, [rating]);

  // Navigate safely between wizard steps
  const goToStep = async (stepNumber) => {
    const validStep = Math.max(1, Math.min(4, stepNumber));
    setCurrentStep(validStep);
    if (validStep > highestStepReached) {
      setHighestStepReached(validStep);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 160, behavior: "smooth" });
    }
  };

  // Step 1 Rating Selection
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (validationErrors.rating) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated.rating;
        return updated;
      });
    }
    loadPrompts(newRating);
  };

  // Step 2 Category Selection
  const handleCategoryChange = (slug, categoryObj) => {
    setCategorySlug(slug);
    setCategoryId(categoryObj?.id || slug);
    setCategoryName(categoryObj?.name || slug);
    // Reset product when category changes
    setProductId("");
    setProductName("");

    if (validationErrors.category) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated.category;
        return updated;
      });
    }
  };

  // Step 2 Product Selection
  const handleProductChange = (id, productObj) => {
    setProductId(id);
    setProductName(productObj?.title || "");

    if (validationErrors.product) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated.product;
        return updated;
      });
    }
  };

  // Step 2 Custom Product Text Change
  const handleCustomProductChange = (text) => {
    setCustomProduct(text);
    if (validationErrors.product && text.trim()) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated.product;
        return updated;
      });
    }
  };

  // Step 2 Language Selection
  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    if (validationErrors.language) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated.language;
        return updated;
      });
    }
  };

  // ============================================================
  // STEP 9: VALIDATION LOGIC (PHASE 5)
  // Rating: mandatory
  // Category & Product: optional (if omitted, switches to Showroom Review)
  // Custom Product: mandatory ONLY if custom mode toggled ON
  // Language: mandatory (defaults to 'en')
  // ============================================================
  const validateStep2Inputs = () => {
    const errors = {};

    // 1. Rating mandatory
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      errors.rating = "Please select an overall star rating (1 to 5).";
    }

    // 2. Custom Product mandatory ONLY if user switched to custom product mode
    if (isCustomMode && (!customProduct || !customProduct.trim())) {
      errors.product = "Please enter the name of your custom furniture item.";
    }

    // 3. Language mandatory
    if (!language || !["en", "hi", "mr"].includes(language)) {
      errors.language = "Please select your preferred review language.";
    }

    // 4. Optional feedback length check
    if (additionalFeedback && additionalFeedback.length > 1000) {
      errors.additionalFeedback = "Feedback note is too long (maximum 1,000 characters).";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setValidationBanner(
        "Please complete the highlighted field before continuing."
      );
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return false;
    }

    setValidationBanner(null);
    return true;
  };

  // Continue button handler on Step 2
  const handleContinueFromInputForm = () => {
    const isValid = validateStep2Inputs();
    if (isValid) {
      setIsDirectShowroom(false);
      goToStep(3);
    }
  };

  // Prompt Selection in Step 3
  const handleSelectPrompt = (prompt, index) => {
    setSelectedPromptIndex(index);
    setSelectedPrompt(prompt);
    setReviewText(prompt.quoteText || prompt.review || "");
    goToStep(4);
  };

  // Reset wizard completely and wipe persisted session
  const handleStartOver = () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("aameena_wizard_state");
        localStorage.removeItem("aameena_wizard_state");
        sessionStorage.removeItem("aameena_review_session_id");
        localStorage.removeItem("aameena_review_session_id");
      }
    } catch (e) {
      console.warn("Storage reset notice:", e);
    }
    setReviewMode("quick");
    setCurrentStep(1);
    setHighestStepReached(1);
    setRating(5);
    setCategoryId("");
    setCategoryName("");
    setCategorySlug("");
    setProductId("");
    setProductName("");
    setIsCustomMode(false);
    setCustomProduct("");
    setExperience([]);
    setAdditionalFeedback("");
    setReviewText("");
    setAuthorName("");
    setAuthorError(null);
    setPhone("");
    setPhoneError(null);
    setSubmissionSuccess(false);
    setSelectedPrompt(null);
    setSelectedPromptIndex(null);
  };

  // Phase 8.5.3: Direct Submit Review into PostgreSQL (CustomerReviewSubmission)
  const handleDirectSubmitReview = async () => {
    if (!authorName || !authorName.trim()) {
      setAuthorError("Please enter your Customer Name (Compulsory).");
      return;
    }
    setAuthorError(null);

    if (phone.trim()) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.valid) {
        setPhoneError(phoneCheck.error);
        return;
      }
    }
    setPhoneError(null);

    const finalText = reviewText.trim() || selectedPrompt?.quoteText || "";
    if (finalText.length < 5) {
      setPhoneError("Please enter review text before submitting.");
      return;
    }

    setIsSubmitting(true);

    // 1. Automatically copy review text to clipboard for immediate Google Reviews pasting
    try {
      await copyToClipboard(finalText);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3500);
    } catch (copyErr) {
      console.warn("Clipboard copy notice:", copyErr);
    }

    // 2. Open Google Review in a new tab immediately within user gesture context
    openGoogleReview(GOOGLE_WRITE_REVIEW_URL);

    try {
      const sessionId =
        typeof window !== "undefined"
          ? sessionStorage.getItem("aameena_review_session_id") ||
            localStorage.getItem("aameena_review_session_id")
          : null;

      const isShowroom = Boolean(isDirectShowroom || aiReadyPayload.isShowroomOnly);
      const effectiveProduct = isShowroom ? "Showroom & Store Visit" : effectiveDisplayProductName;
      const effectiveCategory = isShowroom ? "Showroom Visit" : (categoryName || categorySlug || "Living Room");
      const experienceType = isShowroom ? "VISITED" : "PURCHASED";
      const verificationBadge = isShowroom ? "SHOWROOM_VISIT" : "VERIFIED_PURCHASE";

      const res = await submitVerifiedReview({
        author: authorName.trim() || "Verified Solapur Patron",
        phone: phone.trim() || null,
        rating: Number(rating) || 5,
        reviewText: finalText,
        experienceType,
        productPurchased: effectiveProduct,
        categoryName: effectiveCategory,
        language: language || "en",
        city: "Solapur",
        locationName: BUSINESS_NAME,
        sessionId,
        woodType: isShowroom ? undefined : (selectedPrompt?.woodType || undefined),
        deliveryDate: isShowroom ? undefined : (selectedPrompt?.deliveryDate || undefined),
        visitedShowroom: isShowroom,
        verificationBadge,
      });

      if (res && res.success) {
        setSubmissionSuccess(true);

        try {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("aameena_wizard_state");
            localStorage.removeItem("aameena_wizard_state");
            sessionStorage.removeItem("aameena_review_session_id");
            localStorage.removeItem("aameena_review_session_id");
          }
        } catch (cleanErr) {}

        if (typeof window !== "undefined" && res.review) {
          try {
            const raw = localStorage.getItem("aameena_optimistic_reviews");
            const stored = raw ? JSON.parse(raw) : [];
            const updated = [res.review, ...stored.filter((r) => r.id !== res.review.id)];
            localStorage.setItem("aameena_optimistic_reviews", JSON.stringify(updated));

            if ("BroadcastChannel" in window) {
              const bc = new BroadcastChannel("aameena_reviews_sync");
              bc.postMessage({ type: "NEW_REVIEW", review: res.review });
              bc.close();
            }
          } catch (syncErr) {
            console.warn("Realtime sync warning:", syncErr);
          }

          setTimeout(() => {
            const section =
              document.getElementById("customer-reviews-section") ||
              document.getElementById(`review-${res.review?.id}`);
            if (section) {
              section.scrollIntoView({ behavior: "smooth" });
            }
          }, 350);
        }
      } else {
        setPhoneError(res.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setPhoneError("Something went wrong while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLanguageObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="space-y-8" ref={formTopRef}>
      {reviewMode === "quick" ? (
        <QuickReviewCard
          initialRating={rating}
          onRatingChange={(newRating) => setRating(newRating)}
          onOpenDetailed={() => {
            setReviewMode("detailed");
            goToStep(1);
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Detailed Mode Header with switch back button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 dark:bg-stone-900 border border-amber-200 dark:border-amber-900/60 shadow-2xs">
            <button
              type="button"
              onClick={() => setReviewMode("quick")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold transition-all shadow-xs cursor-pointer w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Switch back to 1-Click Quick Review</span>
            </button>

            <span className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Detailed 4-Step Furniture Review
            </span>
          </div>

          {/* 4-Step Progress Navigation */}
          <ReviewProgress
            currentStep={currentStep}
            onStepClick={goToStep}
            highestStepReached={highestStepReached}
          />

          {/* ============================================================ */}
          {/* STEP 1: STAR RATING (STEP 2 OF REQUIREMENTS)                 */}
          {/* ============================================================ */}
          {currentStep === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <RatingSelector
            value={rating}
            onChange={handleRatingChange}
            onNext={() => {
              setIsDirectShowroom(false);
              goToStep(2);
            }}
            onQuickReview={() => {
              setIsDirectShowroom(true);
              setCategoryId("");
              setCategoryName("Showroom Visit");
              setCategorySlug("showroom-visit");
              setProductId("");
              setProductName("Showroom & Store Visit");
              setIsCustomMode(false);
              setCustomProduct("");
              setExperience([]);
              setAdditionalFeedback("");
              setValidationErrors({});
              setValidationBanner(null);
              try {
                if (typeof window !== "undefined") {
                  sessionStorage.removeItem("aameena_review_session_id");
                  localStorage.removeItem("aameena_review_session_id");
                }
              } catch (e) {}
              goToStep(3);
            }}
            errorMessage={validationErrors.rating}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: COMPLETE CUSTOMER INPUT SYSTEM (STEPS 3 - 9)         */}
      {/* ============================================================ */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-amber-200/90 shadow-sm space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                Step 2: Customer Input Form
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
                Share Your Purchase & Experience Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every detail helps train our craftsmanship review generator and future buyers.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-amber-950 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 self-start sm:self-auto shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating} Stars Selected</span>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="text-amber-800 underline text-[11px] ml-1 hover:text-amber-950"
              >
                Change
              </button>
            </div>
          </div>

          {/* Validation Banner if errors exist */}
          {validationBanner && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
              <span>{validationBanner}</span>
            </div>
          )}

          {/* 1. Category Selector (Step 3) */}
          <CategorySelector
            value={categorySlug || categoryId}
            onChange={handleCategoryChange}
            error={validationErrors.category}
          />

          {/* 2. Product Selector & Other Product Option (Step 4 & 5) */}
          <ProductSelector
            categorySlug={categorySlug}
            categoryName={categoryName}
            selectedProductId={productId}
            onProductChange={handleProductChange}
            customProductName={customProduct}
            onCustomProductChange={handleCustomProductChange}
            isCustomMode={isCustomMode}
            onToggleCustomMode={(active) => {
              setIsCustomMode(active);
              if (validationErrors.product) {
                setValidationErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.product;
                  return updated;
                });
              }
            }}
            error={validationErrors.product}
          />

          {/* 3. Language Selector (Step 6) */}
          <LanguageSelector
            value={language}
            onChange={handleLanguageChange}
            error={validationErrors.language}
          />

          {/* 4. Experience Aspect Chips (Step 7) */}
          <ExperienceSelector
            selectedAspects={experience}
            onChange={setExperience}
          />

          {/* 5. Optional Feedback Textarea (Step 8) */}
          <FeedbackTextarea
            value={additionalFeedback}
            onChange={setAdditionalFeedback}
            maxLength={1000}
            error={validationErrors.additionalFeedback}
          />

          {/* Step 2 Form Action Buttons */}
          <div className="pt-4 border-t border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to Rating</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setIsDirectShowroom(true);
                  setCategoryId("");
                  setCategoryName("Showroom Visit");
                  setCategorySlug("showroom-visit");
                  setProductId("");
                  setProductName("Showroom & Store Visit");
                  setIsCustomMode(false);
                  setCustomProduct("");
                  setExperience([]);
                  setAdditionalFeedback("");
                  setValidationErrors({});
                  setValidationBanner(null);
                  try {
                    if (typeof window !== "undefined") {
                      sessionStorage.removeItem("aameena_review_session_id");
                      localStorage.removeItem("aameena_review_session_id");
                    }
                  } catch (e) {}
                  goToStep(3);
                }}
                className="text-xs text-amber-900/80 hover:text-amber-950 underline font-medium cursor-pointer"
              >
                Skip furniture details & continue
              </button>

              <button
                type="button"
                onClick={handleContinueFromInputForm}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: COMPLETE AI REVIEW GENERATION LAYER (PHASE 3)         */}
      {/* ============================================================ */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-amber-200/90 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Phase 2 Captured Input Summary Card */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Validated Customer Review Profile
                </span>
              </div>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="text-xs font-bold text-amber-900 underline hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Inputs</span>
              </button>
            </div>

            {/* Grid of structured captured fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Rating */}
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Rating:</span>
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rating} Stars</span>
                </span>
              </div>

              {/* Category */}
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Category:</span>
                <span className="font-bold text-slate-800 truncate block">
                  {isDirectShowroom ? "Showroom & Workshop Visit" : (aiReadyPayload.category || "Living Room")}
                </span>
              </div>

              {/* Product */}
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {isDirectShowroom ? "Review Subject:" : "Furniture Item:"}
                </span>
                <span className="font-bold text-slate-800 truncate block">
                  {isDirectShowroom ? "Solapur Showroom & Store Experience" : (aiReadyPayload.product || effectiveDisplayProductName)}
                </span>
              </div>

              {/* Language */}
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Language:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{selectedLanguageObj.flag}</span>
                  <span>{selectedLanguageObj.native}</span>
                </span>
              </div>

              {/* Experience Chips Count */}
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-0.5 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Experience Highlights:
                </span>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {experience.length > 0 ? (
                    experience.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">
                      {isDirectShowroom ? "Direct Showroom & Workshop Walkthrough" : "None selected (optional)"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Feedback Display */}
            {additionalFeedback && (
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Additional Notes / Feedback:
                </span>
                <p className="text-xs text-slate-700 italic">
                  &ldquo;{additionalFeedback}&rdquo;
                </p>
              </div>
            )}

          </div>

          {/* Dedicated AI Review Generation Layer Component */}
          <ReviewGenerator
            validatedPayload={aiReadyPayload}
            onSelectReview={(suggestion) => {
              setSelectedPrompt(suggestion);
              setReviewText(suggestion.review);
            }}
            onBackToInput={() => goToStep(2)}
            onProceedToPreview={() => goToStep(4)}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: PREVIEW & SUBMIT REVIEW (SIMPLIFIED)                  */}
      {/* ============================================================ */}
      {currentStep === 4 && (
        <div className="bg-amber-950 text-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-amber-900 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
              Step 4: Final Step
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white mt-0.5">
              Preview Your Review
            </h2>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Review and edit your text below, then submit directly to our website.
            </p>
          </div>

          {/* Success Banner if submitted */}
          {submissionSuccess ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 space-y-4 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white font-serif">
                  Review Published & Google Reviews Opened!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/90 max-w-lg mx-auto leading-relaxed">
                  Thank you! Your verified review has been saved in our database with an official owner response and is live on our website below.
                </p>
              </div>

              {/* Instructions for Google Review */}
              <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-600/50 text-amber-200 text-xs sm:text-sm space-y-2 text-left max-w-lg mx-auto shadow-md">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Google Reviews Opened in New Tab</span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  Your review text has been <strong>copied to your clipboard</strong>!
                  Switch to the newly opened Google Review tab, <strong>paste (Ctrl+V)</strong> your text, and click <strong>Post</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openGoogleReview(GOOGLE_WRITE_REVIEW_URL)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Re-open Google Review Tab</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await copyToClipboard(reviewText);
                    setCopiedToast(true);
                    setTimeout(() => setCopiedToast(false), 2500);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
                  <span>{copiedToast ? "Copied to Clipboard!" : "Copy Text Again"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartOver}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Write Another Review
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Editable Preview & Attribution Form */}
              <ReviewPreview
                reviewText={reviewText}
                onReviewTextChange={setReviewText}
                author={authorName}
                onAuthorChange={(val) => {
                  setAuthorName(val);
                  if (authorError) setAuthorError(null);
                }}
                authorError={authorError}
                phone={phone}
                onPhoneChange={(val) => {
                  setPhone(val);
                  if (phoneError) setPhoneError(null);
                }}
                phoneError={phoneError}
              />

              {/* Submit Review Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDirectSubmitReview}
                  disabled={isSubmitting || !reviewText.trim()}
                  className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>

              {/* Back to Step 3 and Start Over Navigation Links */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="text-amber-300 hover:text-white underline font-medium cursor-pointer"
                >
                  ← Back to Review Suggestions
                </button>
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="text-amber-400/70 hover:text-amber-200 font-medium cursor-pointer"
                >
                  Start Over with New Rating
                </button>
              </div>
            </>
          )}
        </div>
      )}
        </div>
      )}
    </div>
  );
}
