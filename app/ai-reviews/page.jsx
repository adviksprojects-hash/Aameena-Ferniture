"use client";

import { useState, useEffect } from "react";
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
  ThumbsUp,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { getRandomFivePrompts, submitVerifiedReview } from "@/actions/reviewActions";
import { validatePhone, validateName } from "@/lib/validation";

export default function AiReviewsPage() {
  const [starRating, setStarRating] = useState(5);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(null);
  const [copiedReviewText, setCopiedReviewText] = useState("");
  const [copied, setCopied] = useState(false);
  const [redirectToast, setRedirectToast] = useState(false);
  const [customAuthor, setCustomAuthor] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [totalPoolCount, setTotalPoolCount] = useState(0);

  const PRIMARY_GOOGLE_PLACE_ID = "ChIJB1k-wjTbxTsR7dA3i-yPr4Y";
  const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PRIMARY_GOOGLE_PLACE_ID}`;

  // Fetch exactly 5 randomized prompts for selected star rating
  const loadPrompts = async (rating = starRating) => {
    setLoading(true);
    setSelectedPromptIndex(null);
    setCopied(false);

    const res = await getRandomFivePrompts(rating);
    if (res.success && Array.isArray(res.prompts)) {
      setPrompts(res.prompts);
      if (res.totalCount) setTotalPoolCount(res.totalCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPrompts(starRating);
  }, [starRating]);

  // Handle choosing one of the 5 prompts
  const handleSelectPrompt = async (prompt, index) => {
    setSelectedPromptIndex(index);
    setCopiedReviewText(prompt.quoteText);

    // 1. Copy to clipboard
    try {
      await navigator.clipboard.writeText(prompt.quoteText);
      setCopied(true);
    } catch (err) {
      console.error("Clipboard copy error:", err);
    }

    // 2. Trigger feedback toast
    setRedirectToast(true);

    // 3. Save submission to backend database in background
    submitVerifiedReview({
      author: customAuthor.trim() || "Verified Solapur Customer",
      phone: customPhone.trim() || null,
      rating: starRating,
      reviewText: prompt.quoteText,
      experienceType: prompt.experienceType || "PURCHASED",
      productPurchased: prompt.productPurchased || "Sagwan Teak Furniture",
    });
  };

  // Redirect to Google Maps Review
  const handleRedirectToGoogle = () => {
    if (customPhone.trim()) {
      const phoneCheck = validatePhone(customPhone);
      if (!phoneCheck.valid) {
        setPhoneError(phoneCheck.error);
        return;
      }
    }
    setPhoneError(null);

    // Re-copy in case user modified the text
    if (copiedReviewText) {
      navigator.clipboard.writeText(copiedReviewText);
    }

    window.open(GOOGLE_WRITE_REVIEW_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Google Review Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-slate-900">
            Share Your Craftsmanship Experience
          </h1>

          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Select your star rating below to see 5 authentic review suggestions curated from our workshop database. Click your favorite to copy automatically and submit on Google Maps with 1 tap.
          </p>

          <a
            href={GOOGLE_WRITE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-950 font-bold bg-white px-3.5 py-1.5 rounded-full border border-amber-200 shadow-sm hover:bg-amber-50 hover:border-amber-400 transition-colors"
            title="Open Solapur Google Maps Review Page"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span>AMEENA Distributors’s Sofa Set Furniture Company (Solapur Facility)</span>
            <ExternalLink className="w-3 h-3 text-amber-700 ml-0.5" />
          </a>
        </div>

        {/* STEP 1: Choose Star Rating */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Step 1 of 2
              </span>
              <h2 className="text-xl font-bold font-serif text-slate-900">
                Choose Your Star Rating
              </h2>
            </div>
            
            <span className="text-xs text-slate-500">
              {totalPoolCount > 0 ? `${totalPoolCount} review prompts in database` : "Curated review prompts"}
            </span>
          </div>

          {/* Interactive Star Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { stars: 5, label: "5 Stars", tag: "Exceptional Craft" },
              { stars: 4, label: "4 Stars", tag: "Very Good" },
              { stars: 3, label: "3 Stars", tag: "Satisfactory" },
              { stars: 2, label: "2 Stars", tag: "Need Improvement" },
              { stars: 1, label: "1 Star", tag: "Critical Feedback" },
            ].map((btn) => {
              const isSelected = starRating === btn.stars;
              return (
                <button
                  key={btn.stars}
                  type="button"
                  onClick={() => setStarRating(btn.stars)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    isSelected
                      ? "bg-amber-950 text-white border-amber-950 shadow-md ring-2 ring-amber-500/50 scale-[1.02]"
                      : "bg-amber-50/40 border-amber-200 text-slate-800 hover:bg-amber-100/60"
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    {[...Array(btn.stars)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          isSelected ? "fill-amber-400 text-amber-400" : "fill-amber-500 text-amber-500"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-xs block">{btn.label}</span>
                  <span className={`text-[10px] block ${isSelected ? "text-amber-200 font-medium" : "text-slate-500"}`}>
                    {btn.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: 5 Prompts Randomly Chosen from DB */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Step 2 of 2
              </span>
              <h2 className="text-xl font-bold font-serif text-slate-900">
                Pick 1 of 5 Review Suggestions
              </h2>
            </div>

            <button
              type="button"
              onClick={() => loadPrompts(starRating)}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-700" : ""}`} />
              <span>Shuffle (5 More)</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 border border-amber-200/80 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-700 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                Selecting 5 randomized review prompts from database...
              </p>
            </div>
          ) : prompts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-amber-200/80 text-center space-y-2">
              <p className="text-xs text-slate-600">No prompts found for {starRating} stars.</p>
              <button
                onClick={() => loadPrompts(starRating)}
                className="px-4 py-2 rounded-xl bg-amber-900 text-white font-bold text-xs"
              >
                Reload Prompts
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {prompts.map((prompt, idx) => {
                const isSelected = selectedPromptIndex === idx;
                return (
                  <div
                    key={prompt.id || idx}
                    onClick={() => handleSelectPrompt(prompt, idx)}
                    className={`cursor-pointer rounded-2xl p-5 border text-left transition-all relative flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "bg-amber-950 text-white border-amber-950 shadow-md ring-2 ring-amber-500/50"
                        : "bg-white border-amber-200/90 hover:border-amber-400 hover:shadow-sm"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected ? "bg-amber-900 text-amber-200" : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            Option #{idx + 1}
                          </span>
                          <span
                            className={`text-[10px] font-medium ${
                              isSelected ? "text-amber-200/80" : "text-slate-500"
                            }`}
                          >
                            {prompt.category?.replace(/_/g, " ") || "Hardwood Craft"}
                          </span>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isSelected ? "bg-amber-400 text-amber-950" : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <p
                        className={`text-xs sm:text-sm leading-relaxed font-sans font-medium ${
                          isSelected ? "text-amber-50" : "text-slate-800"
                        }`}
                      >
                        "{prompt.quoteText}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={isSelected ? "text-amber-300" : "text-amber-900 font-bold"}>
                        {prompt.authorHint ? `— ${prompt.authorHint}` : "— Verified Solapur Client"}
                      </span>

                      <span
                        className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                          isSelected ? "text-amber-200" : "text-amber-900"
                        }`}
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isSelected ? "Selected & Copied" : "Click to Choose & Copy"}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 3: Live Action & Google Maps Redirect */}
        {selectedPromptIndex !== null && (
          <div className="bg-amber-950 text-white rounded-3xl p-6 sm:p-8 border border-amber-900 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-900/60">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-slate-950">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                    Review Text Copied to Clipboard!
                  </h3>
                  <p className="text-xs text-amber-200/80">
                    Just click the button below, paste your review, and submit on Google Maps.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(copiedReviewText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-xs font-bold border border-amber-700/60 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied Again!" : "Copy Again"}</span>
              </button>
            </div>

            {/* Editable Review Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-200 flex items-center justify-between">
                <span>Selected Review Preview (You can personalize before posting):</span>
                <span className="text-[10px] text-amber-300/70 font-normal">Auto-copied to clipboard</span>
              </label>
              <textarea
                rows="3"
                value={copiedReviewText}
                onChange={(e) => setCopiedReviewText(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-amber-900/40 border border-amber-800 text-amber-50 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-400"
              ></textarea>
            </div>

            {/* Optional Customer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-amber-200 block mb-1">
                  Your Name (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Deshmukh"
                  value={customAuthor}
                  onChange={(e) => setCustomAuthor(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-amber-900/30 border border-amber-800 text-amber-50 text-xs placeholder:text-amber-300/40 focus:outline-none focus:ring-1 focus:ring-amber-400"
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
                  className={`w-full p-2.5 rounded-xl bg-amber-900/30 border text-amber-50 text-xs placeholder:text-amber-300/40 focus:outline-none focus:ring-1 ${
                    phoneError ? "border-red-500 focus:ring-red-400" : "border-amber-800 focus:ring-amber-400"
                  }`}
                />
                {phoneError && <p className="text-[10px] text-red-400 font-semibold mt-1">{phoneError}</p>}
              </div>
            </div>

            {/* Primary Action Button: 1-Tap Google Maps Redirect */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleRedirectToGoogle}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01]"
              >
                <span>Write Review on Google Maps (Solapur)</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(copiedReviewText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-amber-900/70 hover:bg-amber-900 text-amber-100 font-bold text-xs border border-amber-700/60 transition-colors"
              >
                Copy Review
              </button>
            </div>

            <p className="text-[11px] text-amber-300/70 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Redirects directly to AMEENA Distributors’s official Solapur Google Maps profile.</span>
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
            className="px-4 py-2 rounded-xl bg-amber-900 text-amber-50 text-xs font-bold hover:bg-amber-800 transition-colors whitespace-nowrap"
          >
            Browse Products
          </Link>
        </div>

      </div>
    </div>
  );
}
