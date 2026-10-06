"use client";

import { AlertTriangle, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ReviewGenerationError({ error, onRetry, onEditInputs }) {
  return (
    <div
      role="alert"
      className="p-6 sm:p-8 rounded-3xl bg-red-50/80 border-2 border-red-200/90 shadow-sm space-y-5 animate-in fade-in duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>

        <div className="space-y-1.5 flex-1">
          <h3 className="text-base sm:text-lg font-bold font-serif text-red-950">
            Unable to Generate Review Suggestions
          </h3>
          <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
            {error ||
              "An error occurred while synthesizing review variations. Your customer inputs are safely preserved."}
          </p>

          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>Form State Intact: No customer details were lost.</span>
          </div>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Retry Review Generation</span>
          </button>
        )}

        {onEditInputs && (
          <button
            type="button"
            onClick={onEditInputs}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-red-100 text-red-900 border border-red-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Edit Customer Details</span>
          </button>
        )}
      </div>
    </div>
  );
}
