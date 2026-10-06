"use client";

import { Sparkles, Brain, Clock } from "lucide-react";

export default function ReviewLoadingState({ language = "en", estimatedSeconds = 2 }) {
  const languageNames = {
    en: "English",
    hi: "हिन्दी (Hindi)",
    mr: "मराठी (Marathi)",
  };

  const selectedLangName = languageNames[language] || "English";

  return (
    <div className="space-y-6 py-4 animate-in fade-in duration-300" role="status" aria-live="polite">
      {/* Animated Typing & Status Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 border border-amber-200/90 shadow-sm flex flex-col items-center text-center space-y-4">
        {/* Pulsing AI Brain Icon */}
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-amber-950 text-amber-300 flex items-center justify-center shadow-lg ring-4 ring-amber-400/30 animate-pulse">
            <Sparkles className="w-7 h-7 text-amber-300" aria-hidden="true" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
        </div>

        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
            Synthesizing Human-like Reviews
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Crafting 5–6 unique perspectives in{" "}
            <span className="font-bold text-amber-950">{selectedLangName}</span> based strictly on your
            experience without any marketing clichés.
          </p>
        </div>

        {/* Typing Dots Animation */}
        <div className="flex items-center gap-1.5 py-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-700 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" />
        </div>

        {/* Estimated Time Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-[11px] font-semibold border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>Estimated Generation Time: ~{estimatedSeconds}s</span>
        </div>
      </div>

      {/* Skeleton Suggestion Cards (Varying Short, Medium, Long) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
          <span>PREPARING CARDS</span>
          <span>FILTERING DUPLICATES...</span>
        </div>

        {[1, 2, 3].map((cardIdx) => (
          <div
            key={cardIdx}
            className="p-5 rounded-2xl bg-white border border-amber-100 shadow-2xs space-y-3 animate-pulse"
          >
            {/* Top Badges Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-16 h-5 bg-amber-100/70 rounded-full" />
                <div className="w-14 h-5 bg-amber-100/60 rounded-full" />
              </div>
              <div className="w-20 h-7 bg-amber-100/60 rounded-xl" />
            </div>

            {/* Content Lines Skeleton */}
            <div className="space-y-2">
              <div className="h-3.5 bg-amber-100/70 rounded w-11/12" />
              <div className="h-3.5 bg-amber-100/50 rounded w-10/12" />
              {cardIdx > 1 && <div className="h-3.5 bg-amber-100/40 rounded w-8/12" />}
            </div>

            {/* Footer Skeleton */}
            <div className="flex items-center justify-between pt-1 border-t border-amber-50">
              <div className="w-20 h-3 bg-amber-100/50 rounded" />
              <div className="w-24 h-3 bg-amber-100/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
