export default function CareersLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-10 space-y-10 animate-pulse">
      {/* 1. Recruitment Hero Banner Skeleton */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-8 lg:p-12 text-amber-50 shadow-xl space-y-4 relative overflow-hidden">
        <div className="h-6 w-48 bg-amber-800/80 rounded-full" />
        <div className="h-10 w-3/4 max-w-lg bg-amber-800/80 rounded-2xl" />
        <div className="h-4 w-full max-w-xl bg-amber-800/50 rounded-lg" />
      </div>

      {/* 2. Job Openings List Skeleton */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-7 w-48 bg-slate-300 rounded-xl" />
            <div className="h-3.5 w-64 bg-slate-200 rounded" />
          </div>
          <div className="h-9 w-9 bg-amber-100 rounded-xl" />
        </div>

        {/* 3 Job Cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="bg-white rounded-3xl p-6 lg:p-8 border border-amber-200/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-2xl flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-5 w-28 bg-amber-100 rounded-full" />
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>

                <div className="h-6 w-3/5 bg-slate-300 rounded-xl" />
                <div className="h-4 w-full bg-slate-200 rounded" />

                <div className="pt-2 flex flex-wrap gap-2">
                  <div className="h-6 w-32 bg-amber-50 rounded-lg border border-amber-200/60" />
                  <div className="h-6 w-28 bg-slate-100 rounded-lg" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
                <div className="h-7 w-28 bg-emerald-100 rounded-full" />
                <div className="h-11 w-36 bg-amber-900/40 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
