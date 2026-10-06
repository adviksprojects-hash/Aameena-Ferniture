"use client";

/**
 * @file ReviewEmptyState.jsx
 * Dedicated UI for various empty state conditions:
 * - NO_SEARCH_RESULTS
 * - NO_LANGUAGE_MATCH
 * - NO_OWNER_REPLIES
 * - NO_REVIEWS
 * - API_UNAVAILABLE
 * - CACHE_EXPIRED
 */

import { SearchX, Globe, MessageSquareX, RotateCcw, AlertTriangle, CloudOff } from "lucide-react";
import { EMPTY_STATE_TYPES } from "../types/reviewTypes.js";

export function ReviewEmptyState({
  type = EMPTY_STATE_TYPES.NO_REVIEWS,
  searchQuery = "",
  onResetFilters,
  onRefresh,
}) {
  const configs = {
    [EMPTY_STATE_TYPES.NO_SEARCH_RESULTS]: {
      icon: SearchX,
      title: "No reviews matched your search",
      description: searchQuery
        ? `We couldn't find any reviews matching "${searchQuery}". Try searching for furniture types like 'sofa', 'dining', 'bed', or reviewer names.`
        : "No reviews found matching the specified search query.",
      actionLabel: "Clear search & filters",
      onAction: onResetFilters,
    },
    [EMPTY_STATE_TYPES.NO_LANGUAGE_MATCH]: {
      icon: Globe,
      title: "No reviews in selected language",
      description: "There are currently no reviews recorded in this specific language for the chosen filter criteria.",
      actionLabel: "Show all languages",
      onAction: onResetFilters,
    },
    [EMPTY_STATE_TYPES.NO_OWNER_REPLIES]: {
      icon: MessageSquareX,
      title: "No owner replies found",
      description: "None of the reviews matching your current rating or language filter currently have an owner reply.",
      actionLabel: "View all reviews",
      onAction: onResetFilters,
    },
    [EMPTY_STATE_TYPES.API_UNAVAILABLE]: {
      icon: CloudOff,
      title: "Google Reviews Service Offline",
      description: "The live Google Places review sync is currently undergoing maintenance. Showing cached verified showroom records.",
      actionLabel: "Retry connection",
      onAction: onRefresh || onResetFilters,
    },
    [EMPTY_STATE_TYPES.CACHE_EXPIRED]: {
      icon: AlertTriangle,
      title: "Refreshing review catalog...",
      description: "Review cache TTL has lapsed. Fetching fresh customer impressions and owner responses from the repository.",
      actionLabel: "Refresh now",
      onAction: onRefresh || onResetFilters,
    },
    [EMPTY_STATE_TYPES.NO_REVIEWS]: {
      icon: RotateCcw,
      title: "No reviews yet",
      description: "Be the first customer to share your verified craftsmanship review for Aameena Furniture.",
      actionLabel: "Reset all filters",
      onAction: onResetFilters,
    },
  };

  const config = configs[type] || configs[EMPTY_STATE_TYPES.NO_REVIEWS];
  const IconComponent = config.icon;

  return (
    <div
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-sm space-y-4"
      role="status"
      aria-live="polite"
    >
      <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto text-amber-700 dark:text-amber-400">
        <IconComponent className="size-8" aria-hidden="true" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
          {config.title}
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
          {config.description}
        </p>
      </div>

      {config.actionLabel && config.onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={config.onAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm hover:shadow transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {config.actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewEmptyState;
