"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  MapPin,
} from "lucide-react";
import {
  GOOGLE_WRITE_REVIEW_URL,
  BUSINESS_NAME,
  copyToClipboard,
  openGoogleReview,
} from "./clipboard";
import { getRandomFivePrompts, submitVerifiedReview } from "@/actions/reviewActions";

const RATING_TIERS = {
  5: {
    label: "Excellent",
    starsSymbol: "★★★★★",
    color: "text-amber-500",
    bgBadge: "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700",
    description: "Flawless Sagwan Teakwood Quality & Courteous Guidance",
  },
  4: {
    label: "Very Good",
    starsSymbol: "★★★★☆",
    color: "text-amber-500",
    bgBadge: "bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800",
    description: "Superior Solid Wood Construction & Timely Consultation",
  },
  3: {
    label: "Good",
    starsSymbol: "★★★☆☆",
    color: "text-amber-600",
    bgBadge: "bg-slate-100 dark:bg-stone-800 text-slate-800 dark:text-stone-200 border-slate-200 dark:border-stone-700",
    description: "Satisfactory Furniture Craftsmanship & Store Visit",
  },
  2: {
    label: "Average",
    starsSymbol: "★★☆☆☆",
    color: "text-amber-700",
    bgBadge: "bg-orange-50 dark:bg-orange-950/60 text-orange-950 dark:text-orange-200 border-orange-200 dark:border-orange-800",
    description: "Acceptable Furniture Build, Suggestions for Polish / Delivery",
  },
  1: {
    label: "Poor",
    starsSymbol: "★☆☆☆☆",
    color: "text-red-500",
    bgBadge: "bg-red-50 dark:bg-red-950/60 text-red-950 dark:text-red-200 border-red-200 dark:border-red-800",
    description: "Critical Observations for Our Master Carpenters & Showroom",
  },
};

export default function QuickReviewCard({
  onOpenDetailed,
  initialRating = 5,
  onRatingChange,
}) {
  const [rating, setRatingState] = useState(initialRating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [customText, setCustomText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleRatingSelect = (newRating) => {
    setRatingState(newRating);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };
  const [authorName, setAuthorName] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const activeStarCount = hoverRating || rating || 5;
  const currentTier = RATING_TIERS[activeStarCount] || RATING_TIERS[5];

  // Sync with initialRating prop if provided externally
  useEffect(() => {
    if (initialRating && initialRating !== rating) {
      setRatingState(initialRating);
    }
  }, [initialRating]);

  // Fetch prompts whenever star rating changes
  useEffect(() => {
    let ignore = false;
    async function fetchPrompts() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await getRandomFivePrompts(rating, 5);
        if (!ignore && res.success && Array.isArray(res.prompts)) {
          setPrompts(res.prompts);
          setSelectedPromptIndex(0);
          if (res.prompts.length > 0) {
            setCustomText(res.prompts[0].quoteText);
          } else {
            setCustomText("");
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load prompts:", err);
          setErrorMessage("Could not load review prompts. You can still write your own.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchPrompts();
    return () => {
      ignore = true;
    };
  }, [rating]);

  // Handle prompt card selection
  const handleSelectPrompt = (index) => {
    setSelectedPromptIndex(index);
    if (prompts[index]) {
      setCustomText(prompts[index].quoteText);
    }
  };

  // Direct Submit Handler: Copies chosen review & redirects to Google Maps + persists to DB
  const handleDirectSubmit = async () => {
    if (!authorName || !authorName.trim()) {
      setErrorMessage("Please enter your Customer Name (Compulsory).");
      return;
    }

    const textToSubmit = (customText && customText.trim()) || prompts[selectedPromptIndex]?.quoteText || "";

    if (!textToSubmit || textToSubmit.trim().length < 5) {
      setErrorMessage("Please select or write a short review before submitting.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    // 1. Copy review text to clipboard
    try {
      await copyToClipboard(textToSubmit.trim());
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 4000);
    } catch (err) {
      console.warn("Clipboard notice:", err);
    }

    // 2. Open Google Review in new tab
    openGoogleReview(GOOGLE_WRITE_REVIEW_URL);

    // 3. Save to database in background
    try {
      const res = await submitVerifiedReview({
        author: authorName.trim() || "Verified Showroom Patron",
        rating: Number(rating) || 5,
        reviewText: textToSubmit.trim(),
        experienceType: "VISITED",
        productPurchased: "Showroom & Store Visit",
        categoryName: "Showroom Visit",
        city: "Solapur",
        locationName: BUSINESS_NAME,
        visitedShowroom: true,
        verificationBadge: "SHOWROOM_VISIT",
      });

      if (res && res.success) {
        setSubmittedSuccess(true);
        setTimeout(() => {
          const section = document.getElementById("customer-reviews-section");
          if (section) section.scrollIntoView({ behavior: "smooth" });
        }, 500);
      }
    } catch (dbErr) {
      console.warn("DB save notice:", dbErr);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-8 border border-amber-200/90 dark:border-amber-900/60 shadow-xl space-y-6 max-w-2xl mx-auto popup-animate">
      
      {/* ── 1. TAGLINE & SHOWROOM HEADER ── */}
      <div className="text-center space-y-2 pb-4 border-b border-amber-100 dark:border-amber-900/40">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[11px] font-extrabold uppercase tracking-wider border border-amber-300 dark:border-amber-800 shadow-2xs">
          <MapPin className="w-3 h-3 text-amber-700 dark:text-amber-400" />
          <span>Solapur Showroom & Manufacturing Unit</span>
        </div>

        <h2 className="text-xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white leading-snug">
          Give Your Review for Our Showroom
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
          Tap your rating below, select a review from the short area, and click submit to copy and post directly to Google Maps!
        </p>
      </div>

      {/* ── 2. FIVE STARS ONLY (1 TO 5 RATING SELECTOR) ── */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-1">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Choose Your Star Rating:
        </span>

        {/* Big 5-Star Row */}
        <div
          role="radiogroup"
          aria-label="Star rating 1 to 5"
          className="flex items-center justify-center gap-2 sm:gap-3 p-1"
        >
          {[1, 2, 3, 4, 5].map((starVal) => {
            const isFilled = starVal <= activeStarCount;
            return (
              <button
                key={starVal}
                type="button"
                role="radio"
                aria-checked={rating === starVal}
                aria-label={`${starVal} Star${starVal > 1 ? "s" : ""}`}
                onClick={() => handleRatingSelect(starVal)}
                onMouseEnter={() => setHoverRating(starVal)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 sm:p-2 rounded-2xl transition-all duration-150 transform hover:scale-120 active:scale-95 focus:outline-none cursor-pointer"
              >
                <Star
                  className={`w-9 h-9 sm:w-12 sm:h-12 transition-all duration-200 ${
                    isFilled
                      ? "fill-amber-400 text-amber-400 drop-shadow-md scale-105"
                      : "text-amber-200 dark:text-stone-700 fill-transparent hover:text-amber-300"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Selected Tier Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-xs font-bold font-serif shadow-2xs ${currentTier.bgBadge}`}>
            <span>{currentTier.starsSymbol}</span>
            <span>•</span>
            <span>{rating} Stars ({currentTier.label})</span>
          </span>
        </div>
      </div>

      {/* ── 3. SHORT AREA: CURATED REVIEW PROMPTS APPEAR HERE ── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Select Review Text to Submit:</span>
          </span>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-amber-800 dark:text-amber-400 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditing ? "Done Editing" : "Edit / Tweak Text"}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-6 rounded-2xl bg-amber-50/40 dark:bg-stone-800/60 border border-amber-200/80 dark:border-stone-700 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading {rating}-star showroom reviews...</span>
          </div>
        ) : prompts.length === 0 ? (
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700 text-center text-xs text-slate-600 dark:text-slate-300">
            No pre-saved quotes found for this rating. You can type your review directly below.
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {prompts.map((p, idx) => {
              const isSelected = selectedPromptIndex === idx;
              return (
                <div
                  key={p.id || idx}
                  onClick={() => handleSelectPrompt(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-600 dark:border-amber-500 ring-2 ring-amber-500/20 shadow-sm"
                      : "bg-slate-50/80 dark:bg-stone-800/60 hover:bg-amber-50/40 dark:hover:bg-stone-800 border-slate-200 dark:border-stone-700"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-amber-600 border-amber-600 text-white"
                      : "border-slate-400 bg-white dark:bg-stone-700"
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      "{p.quoteText}"
                    </p>
                    {p.authorHint && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                        — {p.authorHint}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Optional text editor */}
        {isEditing && (
          <div className="pt-1 animate-in fade-in duration-150">
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Edit your review here..."
              className="w-full p-3 rounded-2xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-stone-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Patron name (Compulsory) */}
        <div className="pt-1 space-y-1">
          <label className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
            <span>Your Name <span className="text-red-500">* (Compulsory)</span></span>
          </label>
          <input
            type="text"
            required
            placeholder="Enter your full name (e.g. Ramesh K., Solapur) *"
            value={authorName}
            onChange={(e) => {
              setAuthorName(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>
      </div>

      {/* Copy Toast Alert */}
      {copiedToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>✓ Review copied to clipboard! Opening Google Maps...</span>
          </span>
          <span className="text-[11px] underline">Paste on Google</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── 4. PRIMARY SUBMIT BUTTON: COPY REVIEW & POST TO GOOGLE ── */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleDirectSubmit}
          disabled={submitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2.5 btn-tactile cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Copying & Opening Google...</span>
            </>
          ) : (
            <>
              <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Copy Review & Submit on Google Maps ⭐</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

        {/* ── 5. SECONDARY BUTTON: DETAILED 4-STEP REVIEW ── */}
        <div className="pt-2 text-center border-t border-amber-100 dark:border-amber-900/40">
          <button
            type="button"
            onClick={onOpenDetailed}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-stone-800/80 hover:bg-amber-100 dark:hover:bg-stone-800 text-amber-950 dark:text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <span>✍️ Want to review a specific furniture piece? Give Detailed Review</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
