"use client";

/**
 * @file AiImprovementModal.jsx
 * Modal dialog allowing admins or reviewers to refine review text with Gemini AI:
 * fix grammar, improve readability, translate, summarize, or change tone while keeping meaning identical.
 */

import React, { useState } from "react";
import { Wand2, X, Check, Loader2, ArrowRight } from "lucide-react";
import { improveAiReviewAction } from "../actions/reviewManagementActions.js";
import {
  GENERATION_TONE,
  GENERATION_LANGUAGES,
} from "../types/managementTypes.js";

export function AiImprovementModal({
  isOpen,
  onClose,
  originalText = "",
  onApply,
}) {
  const [action, setAction] = useState("grammar");
  const [targetTone, setTargetTone] = useState(GENERATION_TONE.PROFESSIONAL);
  const [targetLanguage, setTargetLanguage] = useState("en");

  const [isProcessing, setIsProcessing] = useState(false);
  const [improvedText, setImprovedText] = useState("");
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleImprove = async () => {
    if (!originalText?.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await improveAiReviewAction({
        text: originalText,
        action,
        targetTone,
        targetLanguage,
      });

      if (typeof res === "string" && res.length > 0) {
        setImprovedText(res);
      } else if (res?.text) {
        setImprovedText(res.text);
      } else {
        setError(res?.error || "Could not improve review. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to process text");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (improvedText) {
      onApply?.(improvedText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-white">
                AI Review Refinement
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Enhance grammar, change tone, or translate with Gemini AI while preserving genuine customer feedback.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            Select Refinement Action
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: "grammar", label: "Fix Grammar" },
              { id: "readability", label: "Enhance Flow" },
              { id: "translate", label: "Translate" },
              { id: "change_tone", label: "Change Tone" },
              { id: "summarize", label: "Summarize" },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setAction(btn.id)}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  action === btn.id
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-xs"
                    : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contextual options for tone or language */}
        {action === "change_tone" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-500">Target Tone</label>
            <select
              value={targetTone}
              onChange={(e) => setTargetTone(e.target.value)}
              className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-2 dark:text-white"
            >
              <option value={GENERATION_TONE.PROFESSIONAL}>Professional & Articulate</option>
              <option value={GENERATION_TONE.CASUAL}>Casual & Relatable</option>
              <option value={GENERATION_TONE.FORMAL}>Formal & Respectful</option>
              <option value={GENERATION_TONE.FRIENDLY}>Warm & Friendly</option>
            </select>
          </div>
        )}

        {action === "translate" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-500">Target Language</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-2 dark:text-white"
            >
              {Object.entries(GENERATION_LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Side-by-side or stacked view */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Original Text
            </span>
            <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-xs sm:text-sm text-stone-700 dark:text-stone-300 min-h-[120px] max-h-[220px] overflow-y-auto whitespace-pre-line leading-relaxed">
              {originalText}
            </div>
          </div>

          {/* Improved */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-1">
              <span>AI Refined Text</span>
              <ArrowRight className="w-3 h-3" />
            </span>
            <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 text-xs sm:text-sm text-stone-800 dark:text-stone-200 min-h-[120px] max-h-[220px] overflow-y-auto whitespace-pre-line leading-relaxed">
              {improvedText ? (
                improvedText
              ) : (
                <span className="text-stone-400 italic">
                  Click &ldquo;Process with AI&rdquo; to generate improved version...
                </span>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprove}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Process with AI</span>
                </>
              )}
            </button>

            {improvedText && (
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Refinement</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
