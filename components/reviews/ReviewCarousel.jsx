"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import ReviewCard from "./ReviewCard";

export default function ReviewCarousel({
  prompts = [],
  rating = 5,
  selectedPromptIndex,
  onSelectPrompt,
  onShuffle,
  loading = false,
}) {
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 340;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Controls for Carousel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900">
            Swipe Through Suggested Reviews ({prompts.length} Options)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Swipe horizontally or use arrows. Tap any card to copy its text and proceed to preview.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => scrollCarousel("left")}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            title="Scroll Left"
            aria-label="Scroll left in review suggestions"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel("right")}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            title="Scroll Right"
            aria-label="Scroll right in review suggestions"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
          {onShuffle && (
            <button
              type="button"
              onClick={onShuffle}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-200" : ""}`}
                aria-hidden="true"
              />
              <span>Shuffle</span>
            </button>
          )}
        </div>
      </div>

      {/* Snap Track */}
      <div
        ref={carouselRef}
        tabIndex={0}
        aria-label="Review suggestions carousel"
        className="flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-1 scroll-smooth focus:outline-none focus:ring-1 focus:ring-amber-300 rounded-2xl"
        style={{ scrollbarWidth: "thin" }}
      >
        {prompts.map((prompt, idx) => (
          <ReviewCard
            key={prompt.id || idx}
            prompt={prompt}
            index={idx}
            rating={rating}
            isSelected={selectedPromptIndex === idx}
            onSelect={onSelectPrompt}
          />
        ))}
      </div>
    </div>
  );
}
