"use client";

/**
 * @file CustomerReviewsSection.jsx
 * Unified Public Customer Reviews Section (Phase 8.5.1 Part 4).
 * Clean furniture brand header:
 * - Customer Reviews
 * - ★★★★☆ 4.9 out of 5 based on X reviews
 * - Trusted reviews from our customers
 * Clean filter bar (Search, Sort, Rating, Verified, With Images, Language).
 * Modern, collapsed-by-default review cards with in-place expansion.
 * Zero hero widgets (no Smart Spotlight, no Trending, no Photo Review hero, no Most Trusted).
 */

import { useMemo } from "react";
import { Star, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useGoogleReviews } from "@/lib/reviews/google/hooks/useGoogleReviews.js";
import { ReviewSearchAndFilters } from "@/lib/reviews/google/components/ReviewSearchAndFilters.jsx";
import { ReviewCard } from "@/lib/reviews/google/components/ReviewCard.jsx";
import { ReviewEmptyState } from "@/lib/reviews/google/components/ReviewEmptyState.jsx";

export function CustomerReviewsSection({
  initialReviews = [],
  initialStats = null,
  pageSize = 10,
}) {
  const {
    reviews,
    allFilteredCount,
    totalReviewsCount,
    stats,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    filters,
    searchInput,
    activeFiltersCount,
    emptyStateType,
    expandedReviews,
    helpfulVotes,
    hasMore,
    setSearchQuery,
    clearSearch,
    setRatingFilter,
    setLanguageFilter,
    toggleVerified,
    toggleWithImages,
    setSortBy,
    toggleExpandReview,
    toggleHelpful,
    resetAllFilters,
    loadMore,
    goToNextPage,
    goToPrevPage,
    setPage,
  } = useGoogleReviews({
    initialReviews,
    initialStats,
    pageSize,
  });

  // Calculate live average and count from active review dataset
  const computedStats = useMemo(() => {
    if (stats && stats.totalReviews > 0) {
      return stats;
    }
    const total = reviews.length;
    if (total === 0) {
      return { averageRating: 5.0, totalReviews: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return {
      averageRating: Math.round((sum / total) * 10) / 10,
      totalReviews: total,
    };
  }, [stats, reviews]);

  const avgScore = computedStats.averageRating || 5.0;
  const count = computedStats.totalReviews || reviews.length;

  return (
    <section id="customer-reviews-section" aria-label="Customer Reviews" className="space-y-6 pt-4 scroll-mt-6">
      {/* 1. Clean, Simple Furniture Brand Header (Part 4) */}
      <div className="text-center space-y-2 py-4 border-b border-amber-200/60 dark:border-stone-800">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
          Customer Reviews
        </h2>

        {/* Rating Summary: ★★★★☆ 4.9 out of 5 based on X reviews */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 text-amber-500" aria-label={`Rating ${avgScore.toFixed(1)} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`size-4 sm:size-5 ${
                  s <= Math.round(avgScore)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-stone-200 text-stone-200 dark:fill-stone-800 dark:text-stone-800"
                }`}
              />
            ))}
          </div>

          <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
            {avgScore.toFixed(1)} out of 5
          </span>

          <span className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            based on <strong className="font-semibold text-stone-800 dark:text-stone-200">{count} reviews</strong>
          </span>
        </div>

        {/* Tagline */}
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
          Trusted reviews from our customers
        </p>
      </div>

      {/* 2. Simple Filter Bar (Part 5) */}
      <ReviewSearchAndFilters
        searchInput={searchInput}
        filters={filters}
        activeFiltersCount={activeFiltersCount}
        totalReviewsCount={totalReviewsCount}
        allFilteredCount={allFilteredCount}
        onSearchChange={setSearchQuery}
        onClearSearch={clearSearch}
        onRatingFilter={setRatingFilter}
        onLanguageFilter={setLanguageFilter}
        onToggleVerified={toggleVerified}
        onToggleWithImages={toggleWithImages}
        onSortChange={setSortBy}
        onResetAllFilters={resetAllFilters}
      />

      {/* 3. Empty State or Review Cards Grid */}
      {emptyStateType ? (
        <ReviewEmptyState
          type={emptyStateType}
          searchQuery={filters.search}
          onResetFilters={resetAllFilters}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isExpanded={expandedReviews.has(review.id)}
                isHelpfulVoted={helpfulVotes.has(review.id)}
                onToggleExpand={toggleExpandReview}
                onToggleHelpful={toggleHelpful}
              />
            ))}
          </div>

          {/* 4. Page-based Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs">
            {/* Format: Showing 10 of 12 reviews • Page 1 of 2 */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              <div>
                Showing{" "}
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {reviews.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {allFilteredCount}
                </span>{" "}
                reviews
              </div>
              <span className="hidden sm:inline text-stone-300 dark:text-stone-700">•</span>
              <div className="text-amber-700 dark:text-amber-400 font-semibold">
                Page {currentPage} of {totalPages}
              </div>
            </div>

            {/* Previous, Page Numbers, Next */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => {
                    goToPrevPage();
                    document.getElementById("customer-reviews-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  disabled={!hasPrevPage}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Previous</span>
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPage(p);
                        document.getElementById("customer-reviews-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        currentPage === p
                          ? "bg-amber-600 text-white shadow-xs"
                          : "border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    goToNextPage();
                    document.getElementById("customer-reviews-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  disabled={!hasNextPage}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default CustomerReviewsSection;
