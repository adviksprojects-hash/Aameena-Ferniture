"use client";

import { MessageSquareText, AlertCircle } from "lucide-react";

const FEEDBACK_INSPIRATIONS = [
  "Delivery was quick.",
  "Very comfortable sofa.",
  "Owner explained everything properly.",
  "Finishing was excellent.",
];

export default function FeedbackTextarea({
  value = "",
  onChange,
  maxLength = 1000,
  error,
}) {
  const currentLength = value ? value.length : 0;
  const isNearLimit = currentLength > maxLength * 0.9;
  const isOverLimit = currentLength > maxLength;

  const handleAddInspiration = (snippet) => {
    if (!value.trim()) {
      onChange(snippet);
    } else {
      onChange(`${value.trim()} ${snippet}`);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Label and Character Count */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="additional-feedback-input"
          className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>
            Optional Feedback / Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </span>
        </label>

        <span
          className={`text-[11px] font-semibold ${
            isOverLimit
              ? "text-red-600"
              : isNearLimit
              ? "text-amber-700"
              : "text-slate-400"
          }`}
        >
          {currentLength} / {maxLength}
        </span>
      </div>

      {/* Large Textarea */}
      <div className="relative">
        <textarea
          id="additional-feedback-input"
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tell us anything about your experience... (e.g. Delivery was quick. Very comfortable sofa. Owner explained everything properly. Finishing was excellent.)"
          className={`w-full p-3.5 sm:p-4 rounded-2xl bg-white border text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium transition-all shadow-inner leading-relaxed ${
            error || isOverLimit
              ? "border-red-400 ring-1 ring-red-400/40"
              : "border-amber-200/90 hover:border-amber-400"
          }`}
          aria-label="Additional optional feedback"
        />
      </div>

      {/* Quick Example Snippets */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Inspiration Examples (Click to append):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {FEEDBACK_INSPIRATIONS.map((snippet) => (
            <button
              key={snippet}
              type="button"
              onClick={() => handleAddInspiration(snippet)}
              className="px-2.5 py-1 text-xs rounded-lg bg-amber-50 text-amber-950 border border-amber-200/80 hover:bg-amber-100 hover:border-amber-400 transition-colors font-medium cursor-pointer shadow-2xs"
            >
              &ldquo;{snippet}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Length or Validation Error */}
      {error && (
        <p
          role="alert"
          className="text-xs text-red-600 font-medium flex items-center gap-1.5 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
