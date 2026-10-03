export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-10 space-y-10 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-5 w-32 bg-amber-200/60 rounded-full" />

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Gallery Skeleton */}
        <div className="space-y-4">
          <div className="w-full h-96 sm:h-[480px] bg-gradient-to-tr from-amber-100 to-amber-50 rounded-3xl overflow-hidden border border-amber-200 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
          </div>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-24 h-20 bg-amber-100 rounded-2xl border border-amber-200" />
            ))}
          </div>
        </div>

        {/* Right: Details & Order Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-amber-200 rounded-full" />
            <div className="h-10 w-4/5 bg-slate-300 rounded-2xl" />
            <div className="h-4 w-1/2 bg-amber-100 rounded" />
          </div>

          <div className="h-12 w-48 bg-slate-300 rounded-xl" />

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-amber-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-amber-200 space-y-2">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-4 w-28 bg-slate-300 rounded" />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
            <div className="h-4 w-3/4 bg-slate-100 rounded" />
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 pt-4">
            <div className="h-14 flex-1 bg-amber-900/80 rounded-2xl" />
            <div className="h-14 flex-1 bg-emerald-700/80 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
