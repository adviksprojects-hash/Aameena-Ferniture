"use client";

/**
 * @file ReviewStatsSkeleton.jsx
 * Skeleton loader for the top statistics hero section
 */

export function ReviewStatsSkeleton() {
  return (
    <div
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm animate-pulse space-y-8"
      aria-hidden="true"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left score column */}
        <div className="lg:col-span-4 space-y-3">
          <div className="h-4 w-32 bg-stone-200 dark:bg-stone-800 rounded-md" />
          <div className="h-16 w-32 bg-stone-200 dark:bg-stone-800 rounded-xl" />
          <div className="h-5 w-40 bg-stone-200 dark:bg-stone-800 rounded-md" />
          <div className="h-4 w-48 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
        </div>

        {/* Center rating bars column */}
        <div className="lg:col-span-5 space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <div className="h-3 w-6 bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="h-3 flex-1 bg-stone-100 dark:bg-stone-800 rounded-full" />
              <div className="h-3 w-8 bg-stone-200 dark:bg-stone-800 rounded-md" />
            </div>
          ))}
        </div>

        {/* Right metrics breakdown column */}
        <div className="lg:col-span-3 space-y-3">
          <div className="h-12 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
          <div className="h-12 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
          <div className="h-12 w-full bg-stone-100 dark:bg-stone-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default ReviewStatsSkeleton;
