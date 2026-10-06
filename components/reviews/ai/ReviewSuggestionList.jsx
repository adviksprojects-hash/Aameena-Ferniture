"use client";

import { useState, useMemo } from "react";
import { Sparkles, RefreshCw, Filter, Layers, MousePointerClick, Zap } from "lucide-react";
import ReviewSuggestionCard from "./ReviewSuggestionCard";

export default function ReviewSuggestionList({
  suggestions = [],
  selectedId,
  onSelectSuggestion,
  onDoubleClickSuggestion,
  onRegenerate,
  isRegenerating = false,
  onCopyToast,
}) {
  const [filterLength, setFilterLength] = useState("all");

  // Filter suggestions by selected length filter
  const filteredSuggestions = useMemo(() => {
    if (filterLength === "all") return suggestions;
    return suggestions.filter((s) => s.estimatedLength === filterLength);
  }, [suggestions, filterLength]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Interaction Guide Banner (Phase 8.3 Issue 3) */}
      <div className="p-3 bg-amber-100/70 border border-amber-300/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-950 font-medium">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
          <span>
            <strong>Single Click:</strong> Highlight review card &bull; <strong>Double Click:</strong> Automatically proceed to Step 4!
          </span>
        </div>
      </div>

      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 px-1 shrink-0">
            <Filter className="w-3 h-3 text-amber-700" aria-hidden="true" />
            <span>Filter Length:</span>
          </span>

          {["all", "Compact", "Standard", "Detailed"].map((filter) => {
            const count =
              filter === "all"
                ? suggestions.length
                : suggestions.filter((s) => s.estimatedLength === filter).length;
            const isSelected = filterLength === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setFilterLength(filter)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-amber-950 text-white shadow-2xs"
                    : "bg-white text-slate-700 border border-amber-200 hover:bg-amber-100/70"
                }`}
              >
                <span>{filter === "all" ? "All Lengths" : filter}</span>
                <span className="ml-1 opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Regenerate Variations Button (Explicit user request only) */}
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="px-3.5 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-800 disabled:opacity-60 text-amber-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>{isRegenerating ? "Generating..." : "Generate New Reviews"}</span>
          </button>
        )}
      </div>

      {/* Suggestion Cards Stack */}
      <div
        role="radiogroup"
        aria-label="AI Generated Review Suggestions"
        className="space-y-4"
      >
        {filteredSuggestions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-amber-200">
            No suggestions match the selected &ldquo;{filterLength}&rdquo; filter.
            <button
              type="button"
              onClick={() => setFilterLength("all")}
              className="ml-2 font-bold text-amber-900 underline cursor-pointer"
            >
              Show all suggestions
            </button>
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <ReviewSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              isSelected={selectedId === suggestion.id}
              onSelect={() => onSelectSuggestion(suggestion)}
              onDoubleClick={() => onDoubleClickSuggestion && onDoubleClickSuggestion(suggestion)}
              onCopySuccess={onCopyToast}
            />
          ))
        )}
      </div>
    </div>
  );
}
