"use client";

import { useState } from "react";
import { Star, Check, Sparkles } from "lucide-react";

const RATING_TIERS = {
  5: {
    label: "Excellent",
    starsSymbol: "★★★★★",
    color: "text-amber-500",
    bgBadge: "bg-amber-100 text-amber-950 border-amber-300",
    description: "Flawless Handcrafted Sagwan Teak Quality & Exceptional Service",
  },
  4: {
    label: "Very Good",
    starsSymbol: "★★★★☆",
    color: "text-amber-500",
    bgBadge: "bg-amber-50 text-amber-900 border-amber-200",
    description: "Superior Solid Wood Construction & Courteous Guidance",
  },
  3: {
    label: "Good",
    starsSymbol: "★★★☆☆",
    color: "text-amber-600",
    bgBadge: "bg-slate-100 text-slate-800 border-slate-200",
    description: "Satisfactory Furniture Craftsmanship & Timely Consultation",
  },
  2: {
    label: "Average",
    starsSymbol: "★★☆☆☆",
    color: "text-amber-700",
    bgBadge: "bg-orange-50 text-orange-900 border-orange-200",
    description: "Acceptable Furniture Build, Needs Improvement on Polish or Timeline",
  },
  1: {
    label: "Poor",
    starsSymbol: "★☆☆☆☆",
    color: "text-red-500",
    bgBadge: "bg-red-50 text-red-900 border-red-200",
    description: "Critical Observations for Our Master Carpenters & Management",
  },
};

export default function RatingSelector({ value = 5, onChange, onNext, onQuickReview, errorMessage }) {
  const [hoverRating, setHoverRating] = useState(0);

  const activeStarCount = hoverRating || value || 0;
  const currentTier = RATING_TIERS[activeStarCount] || RATING_TIERS[5];

  const handleSelect = (num) => {
    const valid = Math.max(1, Math.min(5, Number(num)));
    onChange(valid);
  };

  const handleKeyDown = (e, num) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(num);
    } else if (e.key === "ArrowRight" && num < 5) {
      e.preventDefault();
      handleSelect(num + 1);
    } else if (e.key === "ArrowLeft" && num > 1) {
      e.preventDefault();
      handleSelect(num - 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
            Step 1: Overall Rating
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
            How Would You Rate Your Experience?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a star rating from 1 to 5 to guide our master woodworkers.
          </p>
        </div>

        {value && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
            <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>{value} Stars Selected</span>
          </span>
        )}
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        {/* Interactive 5-Star Row */}
        <div
          role="radiogroup"
          aria-label="Star rating from 1 to 5"
          className="flex items-center gap-2 sm:gap-4 p-2"
        >
          {[1, 2, 3, 4, 5].map((starVal) => {
            const isFilled = starVal <= activeStarCount;
            return (
              <button
                key={starVal}
                type="button"
                role="radio"
                aria-checked={value === starVal}
                aria-label={`${starVal} Star${starVal > 1 ? "s" : ""} - ${RATING_TIERS[starVal].label}`}
                onClick={() => handleSelect(starVal)}
                onMouseEnter={() => setHoverRating(starVal)}
                onMouseLeave={() => setHoverRating(0)}
                onKeyDown={(e) => handleKeyDown(e, starVal)}
                className="group p-2 rounded-2xl transition-all duration-200 transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <Star
                  className={`w-10 h-10 sm:w-14 sm:h-14 transition-all duration-200 ${
                    isFilled
                      ? "fill-amber-400 text-amber-400 drop-shadow-md scale-105"
                      : "text-amber-200 fill-transparent group-hover:text-amber-300"
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        {/* Dynamic Tier Indicator Pill */}
        <div className="flex flex-col items-center gap-1 text-center animate-in fade-in duration-200">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold font-serif shadow-sm transition-colors ${currentTier.bgBadge}`}
          >
            <span className="tracking-widest">{currentTier.starsSymbol}</span>
            <span>•</span>
            <span>{currentTier.label}</span>
          </div>
          <p className="text-xs text-slate-600 max-w-md mt-1 leading-relaxed">
            {currentTier.description}
          </p>
        </div>

        {/* Quick Direct Number Buttons (1 to 5) */}
        <div className="space-y-2 text-center pt-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Or click numeric rating directly:
          </span>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleSelect(num)}
                aria-label={`Select ${num} Star Rating`}
                className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all flex flex-col items-center justify-center border shadow-sm cursor-pointer ${
                  value === num
                    ? "bg-amber-950 text-amber-100 border-amber-950 scale-110 shadow-md ring-2 ring-amber-400/60"
                    : "bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100 hover:scale-105"
                }`}
              >
                <span className="text-xs leading-none font-sans">{num} ★</span>
                <span className="text-[9px] font-normal opacity-80 mt-0.5">
                  {RATING_TIERS[num].label.slice(0, 4)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <p className="text-xs text-red-600 font-semibold animate-in fade-in" role="alert">
            {errorMessage}
          </p>
        )}

        {/* Next Step Action Buttons */}
        {value && (
          <div className="pt-4 w-full max-w-md flex flex-col gap-2.5 items-center">
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <span>Continue with Furniture Details</span>
                <span aria-hidden="true">→</span>
              </button>
            )}

            {onQuickReview && (
              <button
                type="button"
                onClick={onQuickReview}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Direct Showroom Review (Rating Only)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
