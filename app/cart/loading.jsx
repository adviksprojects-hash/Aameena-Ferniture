export default function CartLoading() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. Breadcrumb Navigation Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-stone-800 rounded" />
          <div className="h-3 w-3 bg-stone-800 rounded-full" />
          <div className="h-4 w-28 bg-stone-800 rounded" />
          <div className="h-3 w-3 bg-stone-800 rounded-full" />
          <div className="h-4 w-24 bg-amber-500/40 rounded" />
        </div>

        {/* 2. Header Title Bar Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/30 rounded-xl" />
              <div className="h-8 w-48 bg-stone-700 rounded-xl" />
              <div className="h-6 w-20 bg-amber-500/20 rounded-full" />
            </div>
            <div className="h-4 w-72 bg-stone-800 rounded" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-36 bg-stone-800 rounded-xl border border-stone-700" />
            <div className="h-10 w-36 bg-amber-950/60 rounded-xl border border-amber-800/40" />
          </div>
        </div>

        {/* 3. Main Two-Column Layout (Left 8 cols, Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Cols: Delivery banner & Item cards */}
          <div className="lg:col-span-8 space-y-4">
            {/* Delivery location banner */}
            <div className="bg-stone-850 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="h-4 w-64 bg-stone-800 rounded" />
              <div className="h-4 w-52 bg-emerald-950/60 rounded" />
            </div>

            {/* Cart Items List */}
            <div className="bg-stone-850 border border-stone-800 rounded-2xl divide-y divide-stone-800/80 overflow-hidden">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-36 h-40 sm:h-36 rounded-xl bg-stone-800 border border-stone-750 shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-stone-750/60" />
                  </div>

                  {/* Info and Actions */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5 flex-1">
                        <div className="h-5 w-3/4 bg-stone-700 rounded-lg" />
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-28 bg-amber-900/40 rounded-full" />
                          <div className="h-4 w-24 bg-stone-800 rounded-full" />
                        </div>
                      </div>
                      <div className="h-6 w-24 bg-amber-400/30 rounded-lg shrink-0" />
                    </div>

                    <div className="h-4 w-40 bg-stone-800 rounded" />

                    {/* Stepper + Save for Later + Remove */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      {/* Quantity Stepper Skeleton */}
                      <div className="h-9 w-28 bg-stone-800 rounded-xl border border-stone-700" />

                      <div className="flex items-center gap-2">
                        <div className="h-9 w-32 bg-stone-800/80 rounded-xl border border-stone-700" />
                        <div className="h-9 w-24 bg-red-950/40 rounded-xl border border-red-900/30" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Saved for Later Section Skeleton */}
            <div className="bg-stone-850 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-amber-500/30 rounded" />
                <div className="h-6 w-44 bg-stone-700 rounded-lg" />
              </div>
              <div className="h-20 bg-stone-800/50 rounded-xl border border-stone-800" />
            </div>
          </div>

          {/* Right 4 Cols: Order Summary Card Skeleton */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-stone-850 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="h-6 w-32 bg-stone-700 rounded-lg border-b border-stone-800 pb-2" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-28 bg-stone-800 rounded" />
                  <div className="h-4 w-20 bg-stone-700 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-stone-800 rounded" />
                  <div className="h-4 w-20 bg-emerald-900/60 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-36 bg-stone-800 rounded" />
                  <div className="h-4 w-14 bg-emerald-900/60 rounded" />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-between items-baseline">
                <div className="h-5 w-28 bg-stone-700 rounded" />
                <div className="h-7 w-24 bg-amber-400/40 rounded-lg" />
              </div>

              {/* Checkout CTA Skeleton */}
              <div className="h-12 w-full bg-gradient-to-r from-amber-500/60 to-amber-600/60 rounded-xl" />

              {/* WhatsApp Inquiry CTA Skeleton */}
              <div className="h-11 w-full bg-emerald-700/50 rounded-xl" />

              {/* Purity Guarantee Badges Skeleton */}
              <div className="pt-4 border-t border-stone-800 space-y-2">
                <div className="h-3.5 w-full bg-stone-800/80 rounded" />
                <div className="h-3.5 w-4/5 bg-stone-800/80 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
