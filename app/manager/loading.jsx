export default function ManagerLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-10 space-y-8 animate-pulse">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-amber-200">
        <div className="space-y-2">
          <div className="h-8 w-60 bg-slate-300 rounded-xl" />
          <div className="h-4 w-44 bg-slate-200 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-amber-200 rounded-full" />
          <div className="h-10 w-32 bg-amber-800/60 rounded-full" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-7 w-20 bg-slate-300 rounded" />
            <div className="h-3 w-32 bg-amber-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-sm space-y-4">
        <div className="h-6 w-40 bg-slate-300 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-12 bg-amber-50/70 rounded-xl border border-amber-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
