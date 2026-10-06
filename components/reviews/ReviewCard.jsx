"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Copy,
  Check,
  ChevronDown,
  Clock,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { copyToClipboard } from "@/utils/clipboard";

const LANGUAGE_FLAGS = {
  en: { label: "English", flag: "🇬🇧" },
  hi: { label: "हिन्दी", flag: "🇮🇳" },
  mr: { label: "मराठी", flag: "🇮🇳" },
};

export default function ReviewCard({
  review = "",
  rating = 5,
  language = "en",
  estimatedLength = "Standard",
  tone = "Very Happy",
  isSelected = false,
  onSelect,
  onDoubleClick,
  onCopySuccess,
  onCopyError,
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const starCount = Math.max(1, Math.min(5, Number(rating) || 5));
  const langMeta = LANGUAGE_FLAGS[language] || LANGUAGE_FLAGS.en;

  const charCount = review.length;
  const wordCount = review.trim().split(/\s+/).filter(Boolean).length;
  // Estimated reading time at ~200 wpm (minimum ~10s)
  const readSeconds = Math.max(8, Math.round(wordCount / (200 / 60)));
  const isLong = charCount > 230;

  const handleCopyClick = async (e) => {
    e.stopPropagation();
    const result = await copyToClipboard(review);
    if (result.success) {
      setIsCopied(true);
      if (onCopySuccess) {
        onCopySuccess(review);
      }
      setTimeout(() => setIsCopied(false), 2500);
    } else {
      if (onCopyError) {
        onCopyError(result.error || "Failed to copy text");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onSelect) onSelect();
    }
  };

  return (
    <motion.div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      title="Single click to highlight • Double click to proceed to Step 4"
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.995 }}
      className={`relative p-5 sm:p-6 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        isSelected
          ? "bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/60 border-emerald-600 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10"
          : "bg-white border-amber-200/90 hover:border-amber-400 hover:bg-amber-50/30 hover:shadow-md shadow-2xs"
      }`}
    >
      {/* Top Header: Star Rating, Language Badge, Reading Time */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 5-Star Row */}
          <div
            className="flex items-center gap-0.5"
            aria-label={`${starCount} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= starCount
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-200 text-slate-200"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Language Flag Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-slate-800 border border-amber-200">
            <span>{langMeta.flag}</span>
            <span>{langMeta.label}</span>
          </span>

          {/* Reading Time Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span>~{readSeconds}s read</span>
          </span>
        </div>

        {/* Copy Button with Framer Motion Icon Animation */}
        <motion.button
          type="button"
          onClick={handleCopyClick}
          whileTap={{ scale: 0.94 }}
          aria-label="Copy this review text only"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            isCopied
              ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300"
              : "bg-white hover:bg-amber-100 text-amber-950 border-amber-300"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCopied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.6, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                <span>Copied!</span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Review Text Body with Expand / Collapse */}
      <div className="space-y-1.5">
        <p
          className={`text-sm sm:text-[15px] text-slate-900 leading-relaxed font-sans transition-all ${
            !isExpanded && isLong ? "line-clamp-3" : ""
          }`}
        >
          &ldquo;{review}&rdquo;
        </p>

        {isLong && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-0.5 underline cursor-pointer"
          >
            <span>{isExpanded ? "Show Less" : "Read Full Review"}</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Card Footer: Character Count, Word Count, and Selection State with Animated Checkmark */}
      <div className="pt-2.5 border-t border-amber-100/80 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1 text-slate-400">
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            {charCount} characters • {wordCount} words
          </span>
        </div>

        {/* Selection Status Button / Indicator */}
        <div className="flex items-center gap-1.5 font-bold">
          {isSelected ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className="text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-300 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>Selected Review</span>
            </motion.div>
          ) : (
            <button
              type="button"
              onClick={onSelect}
              className="text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full border border-amber-200 transition-colors cursor-pointer"
            >
              Select Review →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
