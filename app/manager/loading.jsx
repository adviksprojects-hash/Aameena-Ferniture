export default function ManagerLoading() {
  return (
    <div className="space-y-8 pb-10 animate-pulse">
      {/* 1. Header Banner Skeleton */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-48 bg-amber-200/80 rounded-full" />
            <div className="h-5 w-36 bg-emerald-200/60 rounded-full" />
          </div>
          <div className="h-9 w-80 max-w-full bg-slate-300 rounded-2xl" />
          <div className="h-4 w-96 max-w-full bg-slate-200 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-11 w-36 bg-amber-900/30 rounded-2xl" />
          <div className="h-11 w-36 bg-amber-200/60 rounded-2xl" />
        </div>
      </div>

      {/* 2. 4 Metric KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-10 w-10 bg-amber-100 rounded-2xl" />
            </div>
            <div className="space-y-1.5">
              <div className="h-8 w-28 bg-slate-300 rounded-xl" />
              <div className="h-3 w-40 bg-slate-200 rounded" />
            </div>
            <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
              <div className="h-3 w-20 bg-amber-200 rounded" />
              <div className="h-3 w-3 bg-amber-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Portals Grid Skeleton */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
        <div className="h-5 w-44 bg-slate-300 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-3">
              <div className="h-9 w-9 bg-amber-200/70 rounded-xl" />
              <div className="space-y-1">
                <div className="h-3.5 w-20 bg-slate-300 rounded" />
                <div className="h-2.5 w-14 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Funnel & Timber Mix Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
          <div className="h-5 w-48 bg-slate-300 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="p-3 rounded-2xl bg-slate-50 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
          <div className="h-5 w-36 bg-slate-300 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="p-3.5 rounded-2xl bg-amber-50/50 space-y-2 border border-amber-100">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-3 w-12 bg-amber-200 rounded" />
                </div>
                <div className="h-2 bg-amber-200/50 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
