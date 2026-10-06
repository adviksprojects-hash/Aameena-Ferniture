"use client";

import { Check, Star, Package, Sparkles, Send } from "lucide-react";

export default function ReviewProgress({ currentStep, onStepClick, highestStepReached }) {
  const steps = [
    { number: 1, label: "Rating", icon: Star },
    { number: 2, label: "Product & Experience", icon: Package },
    { number: 3, label: "Review Suggestions", icon: Sparkles },
    { number: 4, label: "Preview & Post", icon: Send },
  ];

  return (
    <nav aria-label="Review wizard progress" className="w-full">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-sm">
        <ol className="flex items-center justify-between gap-2 sm:gap-4 relative">
          {steps.map((step, idx) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isClickable = step.number <= highestStepReached;
            const Icon = step.icon;

            return (
              <li key={step.number} className="flex-1 flex items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.number)}
                  disabled={!isClickable}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`w-full flex items-center gap-2 sm:gap-3 text-left transition-all p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isClickable ? "cursor-pointer hover:bg-amber-50/70" : "cursor-not-allowed opacity-60"
                  }`}
                >
                  {/* Step circle / icon */}
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all ${
                      isCompleted
                        ? "bg-emerald-600 text-white shadow-sm"
                        : isCurrent
                        ? "bg-amber-950 text-amber-100 ring-2 ring-amber-400 shadow-md scale-105"
                        : "bg-amber-100/70 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
                    )}
                  </div>

                  {/* Step label text */}
                  <div className="hidden sm:block min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Step {step.number}
                    </span>
                    <span
                      className={`block text-xs font-bold truncate ${
                        isCurrent
                          ? "text-amber-950 font-serif"
                          : isCompleted
                          ? "text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </button>

                {/* Connector line between steps */}
                {idx < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={`h-0.5 flex-1 mx-1 sm:mx-2 rounded transition-colors hidden md:block ${
                      idx + 1 < currentStep ? "bg-emerald-500" : "bg-amber-200/60"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
