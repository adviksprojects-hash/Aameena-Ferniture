"use client";

/**
 * @file ReviewSearchAndFilters.jsx
 * Clean, simplified filter bar (Phase 8.5.1 Part 5).
 * Contains ONLY: Search, Sort, Rating, Verified, With Images, Language.
 */

import { Search, X, Star, ArrowUpDown, RotateCcw, ShieldCheck, Camera } from "lucide-react";
import { SORT_OPTIONS } from "../types/reviewTypes.js";

export function ReviewSearchAndFilters({
  searchInput,
  filters,
  activeFiltersCount,
  totalReviewsCount,
  allFilteredCount,
  onSearchChange,
  onClearSearch,
  onRatingFilter,
  onLanguageFilter,
  onToggleVerified,
  onToggleWithImages,
  onSortChange,
  onResetAllFilters,
}) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Top Search and Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="size-4" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reviews by customer, product, or keyword..."
            aria-label="Search customer reviews"
            className="w-full pl-10 pr-10 py-2.5 rounded-full text-xs sm:text-sm bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Sort and Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative inline-flex items-center">
            <label htmlFor="sort-reviews-select" className="sr-only">
              Sort reviews
            </label>
            <div className="absolute left-3 pointer-events-none text-stone-400">
              <ArrowUpDown className="size-3.5" aria-hidden="true" />
            </div>
            <select
              id="sort-reviews-select"
              value={filters.sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 rounded-full text-xs font-semibold bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer transition-all"
            >
              <option value={SORT_OPTIONS.NEWEST}>Newest First</option>
              <option value={SORT_OPTIONS.HIGHEST}>Highest Rated</option>
              <option value={SORT_OPTIONS.LOWEST}>Lowest Rated</option>
              <option value={SORT_OPTIONS.OLDEST}>Oldest First</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-stone-400">
              <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetAllFilters}
              aria-label="Reset all filters"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Rating, Verified, With Images, Language */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
        {/* Star Rating Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
            Rating:
          </span>
          <button
            type="button"
            onClick={() => onRatingFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filters.rating === "all"
                ? "bg-amber-900 text-white font-semibold shadow-xs"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingFilter(star)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                filters.rating === star
                  ? "bg-amber-600 text-white font-semibold shadow-xs"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              <span>{star}</span>
              <Star className="size-3 fill-current" />
            </button>
          ))}
        </div>

        {/* Verified & With Images Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Verified Toggle */}
          <button
            type="button"
            onClick={onToggleVerified}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border cursor-pointer ${
              filters.onlyVerified
                ? "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700 font-semibold shadow-xs"
                : "bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-100"
            }`}
          >
            <ShieldCheck className="size-3 text-blue-600 dark:text-blue-400" />
            <span>Verified Purchase</span>
          </button>

          {/* With Images Toggle */}
          <button
            type="button"
            onClick={onToggleWithImages}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border cursor-pointer ${
              filters.withImages
                ? "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-700 font-semibold shadow-xs"
                : "bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-100"
            }`}
          >
            <Camera className="size-3 text-purple-600 dark:text-purple-400" />
            <span>With Images</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1 pl-1">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
              Lang:
            </span>
            {[
              { code: "all", label: "All" },
              { code: "en", label: "EN" },
              { code: "mr", label: "मराठी" },
              { code: "hi", label: "हिंदी" },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onLanguageFilter(lang.code)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  filters.language === lang.code
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-semibold"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewSearchAndFilters;
