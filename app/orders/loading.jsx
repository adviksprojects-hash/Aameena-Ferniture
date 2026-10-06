export default function OrdersLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-10 space-y-10 animate-pulse">
      {/* 1. Hero Tracker Banner Skeleton */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="h-6 w-52 bg-amber-800/80 rounded-full" />
          <div className="h-5 w-40 bg-amber-800/50 rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="h-10 w-3/4 max-w-lg bg-amber-800/80 rounded-2xl" />
          <div className="h-4 w-full max-w-xl bg-amber-800/50 rounded-lg" />
        </div>

        {/* Search & Token Tracking Input Skeleton */}
        <div className="pt-4 max-w-xl flex items-center gap-2">
          <div className="h-13 flex-1 bg-amber-900/80 rounded-full border border-amber-700/80" />
          <div className="h-13 w-24 bg-amber-500/70 rounded-full shrink-0" />
        </div>
      </div>

      {/* 2. Orders Cards List Skeleton */}
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="h-7 w-64 bg-slate-300 rounded-xl" />
          <div className="h-5 w-24 bg-slate-200 rounded-full" />
        </div>

        {[1, 2].map((card) => (
          <div
            key={card}
            className="bg-white rounded-3xl p-6 lg:p-8 border border-amber-200/80 shadow-sm space-y-6"
          >
            {/* Order Card Top Bar */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-amber-100 pb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-36 bg-slate-300 rounded-lg" />
                  <div className="h-6 w-32 bg-amber-200/80 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                </div>
              </div>

              <div className="space-y-1.5 sm:text-right">
                <div className="h-3 w-24 bg-slate-200 rounded sm:ml-auto" />
                <div className="h-8 w-32 bg-slate-300 rounded-xl sm:ml-auto" />
                <div className="h-3 w-28 bg-slate-200 rounded sm:ml-auto" />
              </div>
            </div>

            {/* 7-Stage Artisanal Stepper Skeleton */}
            <div className="space-y-3 bg-amber-50/40 p-5 rounded-2xl border border-amber-200/70">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-amber-200/70 rounded" />
                <div className="h-4 w-32 bg-amber-300/70 rounded-full" />
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400/60 h-full w-2/5 rounded-full" />
              </div>

              {/* Stepper Steps (7-stage) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <div
                    key={s}
                    className="p-2.5 rounded-xl border border-amber-100 bg-white/70 space-y-1.5 text-center"
                  >
                    <div className="h-4 w-4 bg-amber-200 rounded-full mx-auto" />
                    <div className="h-2.5 w-14 bg-slate-200 rounded mx-auto" />
                    <div className="h-2 w-10 bg-slate-100 rounded mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items Breakdown Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-40 bg-slate-300 rounded" />
              <div className="divide-y divide-slate-100 rounded-2xl border border-amber-200/70 overflow-hidden bg-white">
                {[1, 2].map((item) => (
                  <div key={item} className="p-4 flex items-center gap-4">
                    <div className="w-20 h-20 bg-amber-100/80 rounded-2xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/5 bg-slate-300 rounded" />
                      <div className="flex gap-2">
                        <div className="h-3.5 w-24 bg-amber-100 rounded-md" />
                        <div className="h-3.5 w-20 bg-amber-100 rounded-md" />
                      </div>
                      <div className="h-3 w-16 bg-slate-200 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-slate-300 rounded text-right shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons Skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="h-10 w-48 bg-emerald-100 rounded-xl" />
              <div className="h-10 w-36 bg-slate-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
