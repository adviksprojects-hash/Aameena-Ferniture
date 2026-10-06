"use client";

/**
 * @file AiReviewWriterModal.jsx
 * Modal dialog enabling customers to convert brief bullet points into
 * natural, authentic reviews across tones, lengths, and languages using Gemini AI.
 */

import React, { useState } from "react";
import { Sparkles, X, Check, Loader2, RefreshCw } from "lucide-react";
import { generateAiReviewAction } from "../actions/reviewManagementActions.js";
import {
  GENERATION_LENGTH,
  GENERATION_TONE,
  GENERATION_LANGUAGES,
} from "../types/managementTypes.js";

export function AiReviewWriterModal({
  isOpen,
  onClose,
  onApply,
  currentRating = 5,
}) {
  const [prompt, setPrompt] = useState("");
  const [rating, setRating] = useState(currentRating || 5);
  const [length, setLength] = useState(GENERATION_LENGTH.MEDIUM);
  const [tone, setTone] = useState(GENERATION_TONE.FRIENDLY);
  const [language, setLanguage] = useState("en");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a few bullet points or key details.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await generateAiReviewAction({
        prompt: prompt.trim(),
        rating,
        length,
        tone,
        language,
      });

      if (typeof res === "string" && res.length > 0) {
        setGeneratedText(res);
      } else if (res?.text) {
        setGeneratedText(res.text);
      } else {
        setError(res?.error || "Could not generate review. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate review");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedText) {
      onApply(generatedText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-white">
                AI Review Assistant
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Type rough bullet points — Gemini will craft an authentic review.
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

        {/* Input prompt */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            What was your experience?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Purchased teak dining table, delivered in 4 days, very good finishing, courteous staff..."
            className="w-full text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 p-3 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 dark:text-white"
          />
        </div>

        {/* Configurations grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Rating */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-2 dark:text-white"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
              <option value={4}>⭐⭐⭐⭐ (4)</option>
              <option value={3}>⭐⭐⭐ (3)</option>
              <option value={2}>⭐⭐ (2)</option>
              <option value={1}>⭐ (1)</option>
            </select>
          </div>

          {/* Length */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Length</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-2 dark:text-white"
            >
              <option value={GENERATION_LENGTH.SHORT}>Short (30-50 words)</option>
              <option value={GENERATION_LENGTH.MEDIUM}>Medium (60-90 words)</option>
              <option value={GENERATION_LENGTH.LONG}>Long (120-160 words)</option>
            </select>
          </div>

          {/* Tone */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-2 dark:text-white"
            >
              <option value={GENERATION_TONE.FRIENDLY}>Friendly</option>
              <option value={GENERATION_TONE.PROFESSIONAL}>Professional</option>
              <option value={GENERATION_TONE.CASUAL}>Casual</option>
              <option value={GENERATION_TONE.FORMAL}>Formal</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-2 dark:text-white"
            >
              {Object.entries(GENERATION_LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating genuine review...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Review with AI</span>
            </>
          )}
        </button>

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

        {/* Output area */}
        {generatedText && (
          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                Generated Suggestion:
              </span>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            </div>
            <p className="text-sm text-stone-800 dark:text-stone-200 whitespace-pre-line leading-relaxed italic">
              &ldquo;{generatedText}&rdquo;
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Use this Review</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
