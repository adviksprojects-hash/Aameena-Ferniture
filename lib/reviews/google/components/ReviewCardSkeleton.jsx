"use client";

/**
 * @file ReviewCardSkeleton.jsx
 * Accessible loading skeleton for review cards with smooth shimmer animation
 */

export function ReviewCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4 animate-pulse"
      aria-hidden="true"
    >
      {/* Top author row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-stone-200 dark:bg-stone-800 rounded-md" />
            <div className="h-3 w-20 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
          </div>
        </div>
        <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded-md" />
      </div>

      {/* Stars and badges */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 bg-amber-200 dark:bg-amber-900/50 rounded-md" />
        <div className="h-4 w-16 bg-stone-100 dark:bg-stone-800 rounded-full" />
        <div className="h-4 w-20 bg-stone-100 dark:bg-stone-800 rounded-full" />
      </div>

      {/* AI Summary Skeleton */}
      <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl space-y-2 border border-stone-100 dark:border-stone-800">
        <div className="h-3 w-24 bg-stone-200 dark:bg-stone-700 rounded-md" />
        <div className="h-3 w-full bg-stone-200 dark:bg-stone-700 rounded-md" />
      </div>

      {/* Body text lines */}
      <div className="space-y-2 pt-1">
        <div className="h-3.5 w-full bg-stone-200 dark:bg-stone-800 rounded-md" />
        <div className="h-3.5 w-11/12 bg-stone-200 dark:bg-stone-800 rounded-md" />
        <div className="h-3.5 w-4/5 bg-stone-200 dark:bg-stone-800 rounded-md" />
      </div>

      {/* Footer action row */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
        <div className="h-3 w-32 bg-stone-100 dark:bg-stone-800 rounded-md" />
        <div className="h-8 w-24 bg-stone-200 dark:bg-stone-800 rounded-lg" />
      </div>
    </div>
  );
}

export default ReviewCardSkeleton;
