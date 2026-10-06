export default function ReviewsLoading() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-10 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* 1. Review Header Skeleton */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="h-6 w-60 bg-amber-200/80 rounded-full mx-auto" />
          <div className="h-10 w-3/4 bg-slate-300 dark:bg-stone-800 rounded-2xl mx-auto" />
          <div className="h-4 w-full bg-slate-200 dark:bg-stone-800 rounded-lg mx-auto" />
          <div className="h-9 w-52 bg-white dark:bg-stone-900 rounded-full border border-amber-200/80 mx-auto" />
        </div>

        {/* 2. Review Wizard Card Skeleton */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-amber-100 dark:border-stone-800">
            <div className="h-5 w-44 bg-slate-300 dark:bg-stone-800 rounded" />
            <div className="h-4 w-28 bg-amber-200/70 rounded-full" />
          </div>

          <div className="space-y-4">
            <div className="h-4 w-72 bg-slate-200 dark:bg-stone-800 rounded" />
            <div className="flex justify-center gap-3 py-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className="w-12 h-12 rounded-2xl bg-amber-100/80 dark:bg-stone-800 border border-amber-200/60"
                />
              ))}
            </div>
            <div className="h-12 w-full bg-amber-50 dark:bg-stone-850 rounded-2xl border border-amber-100 dark:border-stone-800" />
          </div>
        </div>

        {/* 3. Customer Reviews Section Skeleton */}
        <div className="space-y-6 pt-4 border-t border-amber-200/60 dark:border-stone-800">
          <div className="text-center space-y-3 py-4">
            <div className="h-8 w-56 bg-slate-300 dark:bg-stone-800 rounded-xl mx-auto" />
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-32 bg-amber-300/80 rounded-full" />
              <div className="h-5 w-48 bg-slate-200 dark:bg-stone-800 rounded" />
            </div>
          </div>

          {/* Rating Breakdown Card Skeleton */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-amber-200/80 dark:border-stone-800 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto">
            <div className="md:col-span-4 text-center md:border-r border-amber-100 dark:border-stone-800 md:pr-6 space-y-2">
              <div className="h-14 w-24 bg-amber-300/80 rounded-2xl mx-auto" />
              <div className="h-4 w-32 bg-amber-200/80 rounded mx-auto" />
              <div className="h-3 w-40 bg-slate-200 dark:bg-stone-800 rounded mx-auto" />
            </div>

            <div className="md:col-span-8 space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <div className="h-3 w-10 bg-slate-200 dark:bg-stone-800 rounded shrink-0" />
                  <div className="h-2.5 flex-1 bg-slate-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400/60 h-full rounded-full"
                      style={{ width: `${stars === 5 ? 85 : stars === 4 ? 12 : 3}%` }}
                    />
                  </div>
                  <div className="h-3 w-8 bg-slate-200 dark:bg-stone-800 rounded shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filters Bar Skeleton */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="h-11 w-full sm:w-72 bg-white dark:bg-stone-900 rounded-full border border-amber-200 dark:border-stone-800" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="h-10 w-28 bg-white dark:bg-stone-900 rounded-full border border-amber-200 dark:border-stone-800" />
              <div className="h-10 w-28 bg-white dark:bg-stone-900 rounded-full border border-amber-200 dark:border-stone-800" />
            </div>
          </div>

          {/* Review Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-amber-200/70 dark:border-stone-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-stone-800 border border-amber-200 shrink-0" />
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-slate-300 dark:bg-stone-700 rounded" />
                      <div className="h-3 w-24 bg-emerald-200/70 rounded-full" />
                    </div>
                  </div>
                  <div className="h-3 w-20 bg-slate-200 dark:bg-stone-800 rounded" />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="h-4 w-24 bg-amber-300/80 rounded" />
                  <div className="h-4 w-36 bg-amber-100/70 dark:bg-stone-800 rounded-full" />
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="h-3.5 w-full bg-slate-200 dark:bg-stone-800 rounded" />
                  <div className="h-3.5 w-5/6 bg-slate-200 dark:bg-stone-800 rounded" />
                  <div className="h-3.5 w-2/3 bg-slate-200 dark:bg-stone-800 rounded" />
                </div>

                <div className="pt-2 border-t border-amber-100 dark:border-stone-800 flex justify-between items-center">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-stone-800 rounded" />
                  <div className="h-7 w-20 bg-amber-50 dark:bg-stone-800 rounded-lg border border-amber-200 dark:border-stone-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
