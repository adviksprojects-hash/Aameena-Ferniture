export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="relative flex flex-col items-center space-y-6 max-w-sm text-center">
        {/* Glowing luxury spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-amber-900/20" />
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center shadow-lg text-amber-950 font-serif font-black text-lg">
            A
          </div>
        </div>

        {/* Text feedback */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-serif text-amber-950 tracking-wide">
            Aameena Furniture
          </h2>
          <p className="text-xs font-medium text-amber-800/80 animate-pulse">
            Loading handcrafted collections from Solapur facility...
          </p>
        </div>

        {/* Shimmering indicator line */}
        <div className="w-48 h-1 bg-amber-200/60 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
}
