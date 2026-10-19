export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-8 animate-pulse">
      {/* Horizontal glowing bar */}
      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-full w-full animate-[progress_1.4s_ease-in-out_infinite]" />
      </div>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-300 dark:bg-slate-700 rounded-xl" />
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-32 bg-emerald-500/40 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-7 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="h-6 w-40 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
