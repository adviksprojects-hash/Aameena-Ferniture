"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Star,
  Sparkles,
  MapPin,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  MessageSquare,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { getRandomFivePrompts, submitVerifiedReview } from "@/actions/reviewActions";
import { validatePhone } from "@/lib/validation";

/**
 * Universal cross-device clipboard copy (Mobile iOS Safari, Android, PC Chrome/Firefox/Edge)
 */
async function copyToClipboardUniversal(text) {
  if (typeof window === "undefined" || !text) return false;

  // 1. Try modern navigator.clipboard
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Proceed to fallback
    }
  }

  // 2. Fallback for iOS Safari, older WebViews, and non-HTTPS local contexts
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return Boolean(successful);
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
}

export default function AiReviewsPage() {
  // Step 1: Star Rating (null initially until chosen by user)
  const [starRating, setStarRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);

  // Step 2: Swipe Prompts
  const [prompts, setPrompts] = useState([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [copiedReviewText, setCopiedReviewText] = useState("");
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const carouselRef = useRef(null);

  // Step 3: Combined Save & Redirect Action
  const [customAuthor, setCustomAuthor] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const PRIMARY_GOOGLE_PLACE_ID = "ChIJB1k-wjTbxTsR7dA3i-yPr4Y";
  const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PRIMARY_GOOGLE_PLACE_ID}`;

  // Load 5+ prompts whenever a star rating is chosen
  const loadPromptsForRating = async (rating) => {
    if (!rating) return;
    setLoadingPrompts(true);
    setSelectedPromptIndex(null);
    setSelectedPrompt(null);
    setCopiedFeedback(false);

    const res = await getRandomFivePrompts(rating, 6);
    if (res.success && Array.isArray(res.prompts)) {
      setPrompts(res.prompts);
    }
    setLoadingPrompts(false);
  };

  // Handler for Star selection (via direct star click or numeric input)
  const handleSelectStar = (ratingNum) => {
    const valid = Math.max(1, Math.min(5, Number(ratingNum)));
    setStarRating(valid);
    loadPromptsForRating(valid);
  };

  // Scroll horizontal swipe carousel left/right
  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 340;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Handler for picking a prompt from the side-swipe carousel
  const handleSelectPrompt = async (prompt, index) => {
    setSelectedPromptIndex(index);
    setSelectedPrompt(prompt);
    setCopiedReviewText(prompt.quoteText);

    // Auto-copy to clipboard on mobile, PC, and all devices
    const copied = await copyToClipboardUniversal(prompt.quoteText);
    if (copied) {
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 3000);
    }
  };

  // ONE-BUTTON Combined Action: Save to DB + Copy + Open Google Maps Review
  const handleSaveAndRedirectToGoogle = async () => {
    if (customPhone.trim()) {
      const phoneCheck = validatePhone(customPhone);
      if (!phoneCheck.valid) {
        setPhoneError(phoneCheck.error);
        return;
      }
    }
    setPhoneError(null);
    setIsSubmitting(true);

    const finalReviewText = copiedReviewText.trim() || selectedPrompt?.quoteText || "Excellent handcrafted furniture quality from Solapur workshop.";

    // 1. Ensure clipboard has the final text
    await copyToClipboardUniversal(finalReviewText);

    // 2. Save directly to Postgres database in background
    try {
      await submitVerifiedReview({
        author: customAuthor.trim() || "Verified Solapur Client",
        phone: customPhone.trim() || null,
        rating: starRating || 5,
        reviewText: finalReviewText,
        experienceType: selectedPrompt?.experienceType || "PURCHASED",
        productPurchased: selectedPrompt?.productPurchased || "Sagwan Teak Furniture",
        locationName: "AMEENA Distributors’s Sofa Set Furniture Company, Solapur",
      });
      setSubmissionSuccess(true);
    } catch (err) {
      console.error("Error saving review to database:", err);
    }

    setIsSubmitting(false);

    // 3. Launch Google Maps Solapur review dialog in new tab
    if (typeof window !== "undefined") {
      window.open(GOOGLE_WRITE_REVIEW_URL, "_blank", "noopener,noreferrer");
    }
  };

  const activeStarCount = hoverRating || starRating || 0;

  const RATING_DESCRIPTIONS = {
    5: "⭐⭐⭐⭐⭐ Exceptional Artisanal Craftsmanship & Flawless Finish",
    4: "⭐⭐⭐⭐ Very Good Hardwood Quality & Courteous Service",
    3: "⭐⭐⭐ Satisfactory Showroom Visit / In-Progress Consultation",
    2: "⭐⭐ Needs Improvement on Timeline / Polish",
    1: "⭐ Critical Feedback for Master Craftsmen",
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
            <span>Verified Patron Review Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-slate-900">
            Share Your Craftsmanship Experience
          </h1>

          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Follow the steps below to craft and share your genuine review. Pick your rating, swipe through authentic prompts, and submit directly to Google Maps in one tap.
          </p>

          <a
            href={GOOGLE_WRITE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-950 font-bold bg-white px-4 py-2 rounded-full border border-amber-300 shadow-sm hover:bg-amber-50 hover:border-amber-500 transition-colors"
            title="Open Solapur Google Maps Review Page"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span>AMEENA Distributors’s Sofa Set Furniture Company (Solapur Facility)</span>
            <ExternalLink className="w-3 h-3 text-amber-700 ml-0.5" />
          </a>
        </div>

        {/* STEP 1: CHOOSE STAR RATING (Initial View - Only this appears at start) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                Step 1: Rating
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
                Choose Your Star Rating (1 to 5)
              </h2>
            </div>

            {starRating && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {starRating} Stars Selected
              </span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center space-y-5 py-4">
            {/* Interactive Stars that Automatically Fill */}
            <div className="flex items-center gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = starVal <= activeStarCount;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => handleSelectStar(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="group p-2 rounded-2xl transition-all transform hover:scale-125 focus:outline-none"
                    aria-label={`Select ${starVal} Stars`}
                  >
                    <Star
                      className={`w-9 h-9 sm:w-12 sm:h-12 transition-all duration-200 ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-md scale-105"
                          : "text-amber-200 fill-transparent group-hover:text-amber-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick Number Selector (1 to 5) with Automatic Star Filling */}
            <div className="space-y-2 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Or select number directly (stars automatically fill):
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSelectStar(num)}
                    className={`w-11 h-11 rounded-2xl font-bold text-sm transition-all flex items-center justify-center border shadow-sm ${
                      starRating === num
                        ? "bg-amber-950 text-amber-100 border-amber-950 scale-110 shadow-md ring-2 ring-amber-400/50"
                        : "bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100 hover:scale-105"
                    }`}
                  >
                    {num} ★
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Description Label */}
            {starRating ? (
              <div className="text-center p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-semibold text-amber-950 max-w-md animate-in fade-in duration-300">
                {RATING_DESCRIPTIONS[starRating]}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Tap any star above or click a number (1-5) to reveal review suggestions.
              </p>
            )}
          </div>
        </div>

        {/* STEP 2: SIDE-SWIPE REVIEW PROMPTS (Appears ONLY after star rating is selected) */}
        {starRating !== null && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                  Step 2: Swipe & Choose
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
                  Side-Swipe to Choose Your Review ({prompts.length}+ Options)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Swipe horizontally on mobile or use arrows. Tap any card to auto-copy to clipboard.
                </p>
              </div>

              {/* Carousel Navigation Buttons & Shuffle */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => scrollCarousel("left")}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel("right")}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => loadPromptsForRating(starRating)}
                  disabled={loadingPrompts}
                  className="px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPrompts ? "animate-spin text-amber-200" : ""}`} />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>

            {/* Copied Feedback Floating Toast */}
            {copiedFeedback && (
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Review Copied to Clipboard! (Mobile & PC)</span>
              </div>
            )}

            {/* Horizontal Swipe Carousel Track */}
            {loadingPrompts ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-800 mx-auto" />
                <p className="text-xs text-slate-500">Loading authentic {starRating}-star review prompts...</p>
              </div>
            ) : prompts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-xs text-slate-600">No review prompts found for {starRating} stars.</p>
                <button
                  onClick={() => loadPromptsForRating(starRating)}
                  className="px-4 py-2 rounded-xl bg-amber-900 text-amber-50 text-xs font-bold"
                >
                  Reload Prompts
                </button>
              </div>
            ) : (
              <div
                ref={carouselRef}
                className="flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-1 scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: "thin" }}
              >
                {prompts.map((prompt, idx) => {
                  const isSelected = selectedPromptIndex === idx;
                  return (
                    <div
                      key={prompt.id || idx}
                      onClick={() => handleSelectPrompt(prompt, idx)}
                      className={`min-w-[280px] sm:min-w-[340px] max-w-[380px] shrink-0 snap-center rounded-3xl p-5 sm:p-6 border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 relative ${
                        isSelected
                          ? "bg-amber-950 text-white border-amber-950 shadow-xl ring-2 ring-amber-400 scale-[1.02]"
                          : "bg-amber-50/30 border-amber-200/90 hover:bg-white hover:border-amber-400 hover:shadow-md"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(starRating)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  isSelected ? "fill-amber-400 text-amber-400" : "fill-amber-500 text-amber-500"
                                }`}
                              />
                            ))}
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected ? "bg-amber-900 text-amber-200" : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            Option #{idx + 1}
                          </span>
                        </div>

                        <p
                          className={`text-xs sm:text-sm leading-relaxed font-sans font-medium line-clamp-4 ${
                            isSelected ? "text-amber-50" : "text-slate-800"
                          }`}
                        >
                          "{prompt.quoteText}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-amber-200/40 flex items-center justify-between text-[11px]">
                        <span className={isSelected ? "text-amber-300 font-medium" : "text-slate-500"}>
                          {prompt.authorHint ? `— ${prompt.authorHint}` : "— Verified Solapur Client"}
                        </span>

                        <div
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors ${
                            isSelected
                              ? "bg-amber-400 text-amber-950 shadow-sm"
                              : "bg-white text-amber-900 border border-amber-200 shadow-sm"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Selected & Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Tap to Choose</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SUBMIT TO DB & LAUNCH GOOGLE MAPS (Appears ONLY after user picks a prompt) */}
        {selectedPromptIndex !== null && (
          <div className="bg-amber-950 text-white rounded-3xl p-6 sm:p-8 border border-amber-900 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-900/60">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                    Step 3: Save & Post
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                    Review Text Ready! 1-Button Submission
                  </h3>
                  <p className="text-xs text-amber-200/80">
                    Click the button below to store your feedback in our database AND launch Google Maps review page.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await copyToClipboardUniversal(copiedReviewText);
                  setCopiedFeedback(true);
                  setTimeout(() => setCopiedFeedback(false), 2500);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-xs font-bold border border-amber-700/60 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Re-Copy Text</span>
              </button>
            </div>

            {/* Editable Review Preview Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-200 flex items-center justify-between">
                <span>Selected Review Content (Already copied to clipboard, feel free to edit):</span>
                <span className="text-[10px] text-amber-400 font-normal">Auto-copied ✓</span>
              </label>
              <textarea
                rows="3"
                value={copiedReviewText}
                onChange={(e) => setCopiedReviewText(e.target.value)}
                className="w-full p-4 rounded-2xl bg-amber-900/40 border border-amber-800 text-amber-50 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-400"
              ></textarea>
            </div>

            {/* Optional Customer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-amber-200 block mb-1">
                  Your Name (Optional, for database record):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Deshmukh"
                  value={customAuthor}
                  onChange={(e) => setCustomAuthor(e.target.value)}
                  className="w-full p-3 rounded-xl bg-amber-900/30 border border-amber-800 text-amber-50 text-xs placeholder:text-amber-300/40 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-200 block mb-1">
                  Phone (Optional):
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9820112345"
                  value={customPhone}
                  onChange={(e) => {
                    setCustomPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  className={`w-full p-3 rounded-xl bg-amber-900/30 border text-amber-50 text-xs placeholder:text-amber-300/40 focus:outline-none focus:ring-1 ${
                    phoneError ? "border-red-500 focus:ring-red-400" : "border-amber-800 focus:ring-amber-400"
                  }`}
                />
                {phoneError && <p className="text-[10px] text-red-400 font-semibold mt-1">{phoneError}</p>}
              </div>
            </div>

            {/* Success notification if saved */}
            {submissionSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Review record successfully saved in database! Google Maps tab opened.</span>
              </div>
            )}

            {/* ONE COMBINED BUTTON: Save to DB + Redirect to Google Maps */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveAndRedirectToGoogle}
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                <ExternalLink className="w-5 h-5" />
                <span>
                  {isSubmitting
                    ? "Saving & Opening Google Maps..."
                    : "Save to Database & Post on Google Maps"}
                </span>
              </button>
            </div>

            <p className="text-[11px] text-amber-300/70 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Saves feedback to AMEENA database & opens Google Maps Solapur review window directly. Just press paste (Ctrl+V) and Submit.
              </span>
            </p>
          </div>
        )}

        {/* Bottom Trust Banner */}
        <div className="bg-white rounded-3xl p-6 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-amber-100 text-amber-900">
              <HeartHandshake className="w-6 h-6" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-serif">
                Direct Solapur Hardwood Manufacturer
              </h4>
              <p className="text-xs text-slate-600">
                100% Seasoned Grade-A Sagwan Teak & Sheesham furniture. Direct factory warranty.
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="px-5 py-2.5 rounded-xl bg-amber-900 text-amber-50 text-xs font-bold hover:bg-amber-800 transition-colors whitespace-nowrap"
          >
            Browse Products
          </Link>
        </div>

      </div>
    </div>
  );
}
