"use client";

import { Sparkles, Check, X } from "lucide-react";

export const EXPERIENCE_ASPECTS = [
  "Product Quality",
  "Wood Quality",
  "Finishing",
  "Comfort",
  "Design",
  "Durability",
  "Value for Money",
  "Delivery",
  "Packaging",
  "Installation",
  "Staff Behaviour",
  "Owner Behaviour",
  "Customization",
  "Overall Experience",
  "Customer Service",
  "Showroom Experience",
  "Easy Communication",
  "Good Pricing",
  "On-time Delivery",
  "Professional Guidance",
];

export default function ExperienceSelector({ selectedAspects = [], onChange }) {
  const toggleAspect = (aspect) => {
    if (selectedAspects.includes(aspect)) {
      onChange(selectedAspects.filter((item) => item !== aspect));
    } else {
      onChange([...selectedAspects, aspect]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label
          id="experience-aspects-label"
          className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>
            What Stood Out in Your Experience? <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
            {selectedAspects.length} Selected
          </span>
          {selectedAspects.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-slate-500 hover:text-amber-900 flex items-center gap-0.5 underline"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Choose any aspects that made your experience memorable. You can select multiple.
      </p>

      {/* Selectable Chips Grid */}
      <div
        role="group"
        aria-labelledby="experience-aspects-label"
        className="flex flex-wrap gap-2 pt-1"
      >
        {EXPERIENCE_ASPECTS.map((aspect) => {
          const isSelected = selectedAspects.includes(aspect);
          return (
            <button
              key={aspect}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleAspect(aspect)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 select-none ${
                isSelected
                  ? "bg-amber-950 text-amber-100 border-amber-950 shadow-md ring-1 ring-amber-400/50 scale-[1.02]"
                  : "bg-white text-slate-700 border-amber-200/90 hover:bg-amber-50 hover:border-amber-400 shadow-2xs"
              }`}
            >
              {isSelected ? (
                <div className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                </div>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-300/80 shrink-0" aria-hidden="true" />
              )}
              <span>{aspect}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
