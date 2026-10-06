"use client";

/**
 * @file PublicReviewsContainer.jsx
 * Top-level public reviews browsing container.
 * Assembles the hero statistics, real-time search/filters, review cards list,
 * pagination, and dedicated empty/error states.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, PenTool } from "lucide-react";
import Link from "next/link";
import { useGoogleReviews } from "../hooks/useGoogleReviews.js";
import { PublicReviewsHero } from "./PublicReviewsHero.jsx";
import { ReviewSearchAndFilters } from "./ReviewSearchAndFilters.jsx";
import { ReviewCard } from "./ReviewCard.jsx";
import { ReviewEmptyState } from "./ReviewEmptyState.jsx";
import { ReviewErrorState } from "./ReviewErrorState.jsx";
import { ReviewCardSkeleton } from "./ReviewCardSkeleton.jsx";

export function PublicReviewsContainer({
  initialReviews = [],
  initialStats = null,
  recommendations = null,
  pageSize = 6,
}) {
  const {
    reviews,
    allFilteredCount,
    totalReviewsCount,
    stats,
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
    toggleOwnerReplyFilter,
    toggleOnlyPositive,
    toggleOnlyNegative,
    toggleOnlyLongReviews,
    toggleVerified,
    toggleWithImages,
    setWoodTypeFilter,
    setCityFilter,
    setCategoryFilter,
    setSortBy,
    toggleExpandReview,
    toggleHelpful,
    resetAllFilters,
    loadMore,
  } = useGoogleReviews({
    initialReviews,
    initialStats,
    pageSize,
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Statistics Hero */}
      <PublicReviewsHero
        stats={stats}
        activeRatingFilter={filters.rating}
        onRatingFilterClick={setRatingFilter}
      />

      {/* 2. Real-time Search and Filter Panel */}
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
        onWoodTypeFilter={setWoodTypeFilter}
        onCityFilter={setCityFilter}
        onCategoryFilter={setCategoryFilter}
        onToggleOwnerReply={toggleOwnerReplyFilter}
        onToggleOnlyPositive={toggleOnlyPositive}
        onToggleOnlyNegative={toggleOnlyNegative}
        onToggleOnlyLongReviews={toggleOnlyLongReviews}
        onToggleVerified={toggleVerified}
        onToggleWithImages={toggleWithImages}
        onSortChange={setSortBy}
        onResetAllFilters={resetAllFilters}
      />

      {/* 3. Empty State (if zero matching reviews) */}
      {emptyStateType ? (
        <ReviewEmptyState
          type={emptyStateType}
          searchQuery={filters.search}
          onResetFilters={resetAllFilters}
        />
      ) : (
        /* 4. Responsive Review Cards Grid */
        <section aria-label="Customer Reviews List" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ReviewCard
                    review={review}
                    isExpanded={expandedReviews.has(review.id)}
                    isHelpfulVoted={helpfulVotes.has(review.id)}
                    onToggleExpand={toggleExpandReview}
                    onToggleHelpful={toggleHelpful}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 5. Load More Pagination */}
          {hasMore && (
            <div className="text-center pt-4 pb-8">
              <button
                type="button"
                onClick={loadMore}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <span>Load More Reviews</span>
                <ChevronDown className="size-4" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* 6. Bottom Banner: AI Review Assistant Link */}
      <aside
        aria-label="Contribute a Review"
        className="bg-gradient-to-r from-amber-100 via-stone-100 to-amber-50 dark:from-stone-900 dark:via-stone-900 dark:to-amber-950/40 rounded-3xl p-6 sm:p-8 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              Patron Assistant
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
            Have you visited our Solapur workshop or purchased our furniture?
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl">
            Our Humanized AI Review Assistant helps you articulate your timber specifications, cushioning feedback, and delivery experience directly to Google Maps in under 60 seconds.
          </p>
        </div>

        <Link
          href="/ai-reviews"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-700 hover:bg-amber-800 text-white shadow-md hover:shadow-lg transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <PenTool className="size-4" />
          <span>Write a Review</span>
        </Link>
      </aside>
    </div>
  );
}

export default PublicReviewsContainer;
