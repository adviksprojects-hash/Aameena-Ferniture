"use client";

import { Globe, Check, AlertCircle } from "lucide-react";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧", desc: "Standard International Review" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳", desc: "शुद्ध व प्रमाणिक हिंदी समीक्षा" },
  { code: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳", desc: "स्थानिक सोलापूरी मराठी समीक्षा" },
];

export default function LanguageSelector({ value = "en", onChange, error }) {
  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = (index + 1) % SUPPORTED_LANGUAGES.length;
      onChange(SUPPORTED_LANGUAGES[nextIdx].code);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = (index - 1 + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length;
      onChange(SUPPORTED_LANGUAGES[prevIdx].code);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label
          id="language-selector-label"
          className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Globe className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>
            Preferred Language <span className="text-red-500">*</span>
          </span>
        </label>
        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
          AI Generation Ready
        </span>
      </div>

      {/* Language Option Cards */}
      <div
        role="radiogroup"
        aria-labelledby="language-selector-label"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
      >
        {SUPPORTED_LANGUAGES.map((lang, idx) => {
          const isSelected = value === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(lang.code)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer ${
                isSelected
                  ? "bg-amber-950 text-white border-amber-950 shadow-md ring-2 ring-amber-400/60 scale-[1.01]"
                  : "bg-white border-amber-200/90 text-slate-800 hover:bg-amber-50/60 hover:border-amber-400 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0" role="img" aria-label={lang.label}>
                  {lang.flag}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-bold truncate ${
                        isSelected ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {lang.native}
                    </span>
                    {lang.code !== "en" && (
                      <span
                        className={`text-[10px] ${
                          isSelected ? "text-amber-200" : "text-slate-500"
                        }`}
                      >
                        ({lang.label})
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[10px] truncate ${
                      isSelected ? "text-amber-200/80" : "text-slate-400"
                    }`}
                  >
                    {lang.desc}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-amber-500 text-amber-950 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                </div>
              )}
            </button>
          );
        })}
      </div>

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
