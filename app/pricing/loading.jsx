export default function PricingLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-12 animate-pulse">
      {/* Banner Skeleton */}
      <div className="bg-gradient-to-r from-amber-950/80 to-amber-900/80 rounded-3xl p-8 lg:p-12 text-center max-w-4xl mx-auto space-y-4">
        <div className="h-4 w-32 bg-amber-800/60 rounded-full mx-auto" />
        <div className="h-10 w-3/4 max-w-lg bg-amber-800/80 rounded-2xl mx-auto" />
        <div className="h-4 w-full max-w-md bg-amber-800/50 rounded-lg mx-auto" />
      </div>

      {/* PDF Rate Card Skeleton */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-amber-50 border border-amber-300/70 rounded-3xl p-6 sm:p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-900/30 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-4 w-36 bg-amber-200 rounded" />
              <div className="h-6 w-64 bg-slate-300 rounded" />
              <div className="h-3 w-48 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-10 w-32 bg-amber-800/40 rounded-full" />
        </div>
      </div>

      {/* Calculator Skeleton */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 border border-amber-200 space-y-6">
        <div className="h-6 w-48 bg-slate-300 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 bg-amber-50 rounded-xl border border-amber-200" />
          <div className="h-12 bg-amber-50 rounded-xl border border-amber-200" />
        </div>
        <div className="h-20 bg-amber-900/10 rounded-2xl" />
      </div>

      {/* Packages Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[1, 2, 3].map((pkg) => (
          <div
            key={pkg}
            className="rounded-3xl border border-amber-200 bg-white p-8 space-y-6 shadow-sm flex flex-col"
          >
            <div className="space-y-2">
              <div className="h-6 w-40 bg-slate-300 rounded" />
              <div className="h-4 w-28 bg-slate-200 rounded" />
            </div>
            <div className="h-9 w-32 bg-amber-600/30 rounded-lg" />
            <div className="space-y-2 py-4 border-t border-amber-100 flex-1">
              {[1, 2, 3, 4].map((f) => (
                <div key={f} className="h-4 w-full bg-slate-100 rounded" />
              ))}
            </div>
            <div className="h-12 bg-amber-800/70 rounded-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
