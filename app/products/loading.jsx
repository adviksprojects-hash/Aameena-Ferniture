export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-amber-950/80 to-amber-900/80 rounded-3xl p-8 lg:p-12 text-amber-50/70 shadow-lg space-y-3">
        <div className="h-4 w-36 bg-amber-800/60 rounded-full" />
        <div className="h-10 w-3/4 max-w-md bg-amber-800/80 rounded-2xl" />
        <div className="h-4 w-full max-w-xl bg-amber-800/50 rounded-lg" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills Skeleton */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-24 bg-amber-200/50 rounded-full" />
          ))}
        </div>

        {/* Search Input Skeleton */}
        <div className="h-11 w-full md:w-72 bg-amber-100/70 rounded-full border border-amber-200" />
      </div>

      {/* 8-Card Product Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((card) => (
          <div
            key={card}
            className="rounded-3xl border border-amber-200/60 bg-white overflow-hidden shadow-sm flex flex-col space-y-3 p-4"
          >
            {/* Image Placeholder */}
            <div className="relative w-full h-56 bg-gradient-to-tr from-amber-100 to-amber-50 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
            </div>

            {/* Badges / Category row */}
            <div className="flex items-center justify-between pt-1">
              <div className="h-4 w-20 bg-amber-100 rounded" />
              <div className="h-4 w-12 bg-amber-100 rounded" />
            </div>

            {/* Title */}
            <div className="h-5 w-4/5 bg-slate-200 rounded" />

            {/* Wood Type */}
            <div className="h-3 w-1/2 bg-amber-100/70 rounded" />

            {/* Price Row */}
            <div className="flex items-baseline gap-2 pt-1">
              <div className="h-6 w-24 bg-slate-300 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded line-through" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 mt-auto">
              <div className="h-9 bg-amber-100 rounded-xl" />
              <div className="h-9 bg-amber-800/80 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
