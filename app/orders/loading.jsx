export default function OrdersLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-10 animate-pulse">
      {/* Banner Skeleton */}
      <div className="bg-gradient-to-r from-amber-950/80 to-amber-900/80 rounded-3xl p-8 lg:p-12 text-center max-w-4xl mx-auto space-y-4">
        <div className="h-4 w-36 bg-amber-800/60 rounded-full mx-auto" />
        <div className="h-10 w-3/4 max-w-md bg-amber-800/80 rounded-2xl mx-auto" />
        <div className="h-4 w-full max-w-lg bg-amber-800/50 rounded-lg mx-auto" />
        {/* Search Input Box */}
        <div className="h-14 max-w-xl mx-auto bg-amber-900/60 rounded-full border border-amber-800 mt-4" />
      </div>

      {/* Order Cards Skeleton */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-6 w-48 bg-slate-300 rounded" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-100">
              <div className="space-y-1.5">
                <div className="h-5 w-40 bg-slate-300 rounded" />
                <div className="h-3 w-28 bg-slate-200 rounded" />
              </div>
              <div className="h-7 w-28 bg-amber-200 rounded-full" />
            </div>

            {/* Stepper bar skeleton */}
            <div className="h-16 bg-amber-50 rounded-2xl border border-amber-100" />

            {/* Order item row skeleton */}
            <div className="flex items-center gap-4 pt-2">
              <div className="w-16 h-16 bg-amber-100 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 bg-slate-300 rounded" />
                <div className="h-3 w-1/4 bg-slate-200 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-300 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
