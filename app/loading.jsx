import Image from "next/image";

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="relative flex flex-col items-center space-y-6 max-w-sm text-center">
        {/* Glowing luxury spinner */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-amber-900/20" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="w-14 h-14 rounded-2xl overflow-hidden p-0.5 bg-slate-950 border border-emerald-500/40 shadow-xl flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Aameena Distributors"
              width={52}
              height={52}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Text feedback */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white tracking-wide">
            Aameena Distributors
          </h2>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Furniture & Furnishing Company
          </p>
          <p className="text-xs font-medium text-amber-800/80 animate-pulse">
            Loading handcrafted collections from Solapur facility...
          </p>
        </div>

        {/* Horizontal Glowing Loading Bar */}
        <div className="w-56 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-400 rounded-full w-full animate-[progress_1.6s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
