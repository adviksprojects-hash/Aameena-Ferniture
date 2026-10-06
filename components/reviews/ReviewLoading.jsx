"use client";

import { RefreshCw, Sparkles } from "lucide-react";

export default function ReviewLoading({ message = "Loading review suggestions..." }) {
  return (
    <div className="py-16 text-center space-y-4 animate-in fade-in duration-300" role="status" aria-live="polite">
      <div className="relative w-12 h-12 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-amber-800 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-amber-700">
          <Sparkles className="w-5 h-5 animate-pulse" aria-hidden="true" />
        </div>
      </div>
      <p className="text-xs sm:text-sm font-semibold text-slate-700">{message}</p>
      <p className="text-[11px] text-slate-400">
        AMEENA Distributors’s Sofa Set Furniture Company • Solapur Workshop
      </p>
    </div>
  );
}
