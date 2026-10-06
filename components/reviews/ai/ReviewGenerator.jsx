"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Edit2,
} from "lucide-react";
import ReviewLoadingState from "./ReviewLoadingState";
import ReviewGenerationError from "./ReviewGenerationError";
import ReviewSuggestionList from "./ReviewSuggestionList";
import {
  getOrCreateReviewGenerationSessionAction,
  updateSessionSelectedReviewAction,
} from "@/actions/reviewActions";

const SESSION_STORAGE_KEY = "aameena_review_session_id";

export default function ReviewGenerator({
  validatedPayload,
  onSelectReview,
  onBackToInput,
  onProceedToPreview,
}) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  // Store callbacks in refs to avoid useEffect triggering on inline function identity changes
  const onSelectReviewRef = useRef(onSelectReview);
  const onProceedToPreviewRef = useRef(onProceedToPreview);

  useEffect(() => {
    onSelectReviewRef.current = onSelectReview;
    onProceedToPreviewRef.current = onProceedToPreview;
  });

  // Load existing session from PostgreSQL or create new one once per session
  useEffect(() => {
    let ignore = false;

    async function initializeSession() {
      setLoading(true);
      setError(null);

      try {
        const storedSessionId =
          typeof window !== "undefined"
            ? sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY)
            : null;

        const res = await getOrCreateReviewGenerationSessionAction({
          sessionId: storedSessionId,
          payload: validatedPayload,
          forceNew: false,
        });

        if (!ignore) {
          if (res.success && Array.isArray(res.suggestions) && res.suggestions.length > 0) {
            setSuggestions(res.suggestions);
            setSessionId(res.sessionId);

            if (typeof window !== "undefined" && res.sessionId) {
              sessionStorage.setItem(SESSION_STORAGE_KEY, res.sessionId);
              localStorage.setItem(SESSION_STORAGE_KEY, res.sessionId);
            }

            const activeChoice = res.selectedReview || res.suggestions[0];
            setSelectedSuggestion(activeChoice);

            if (onSelectReviewRef.current) {
              onSelectReviewRef.current(activeChoice);
            }

            setError(null);
          } else {
            setError(res.error || "Unable to load review generation session.");
          }
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Session load error:", err);
          setError("Failed to initialize review generation session.");
          setLoading(false);
        }
      }
    }

    initializeSession();

    return () => {
      ignore = true;
    };
  }, [
    validatedPayload?.rating,
    validatedPayload?.language,
    validatedPayload?.category,
    validatedPayload?.product,
    validatedPayload?.isShowroomOnly,
    JSON.stringify(validatedPayload?.experience || []),
    validatedPayload?.additionalFeedback,
  ]);

  // User-driven "Generate New Reviews" action
  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const storedSessionId =
        typeof window !== "undefined"
          ? sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY)
          : null;

      const res = await getOrCreateReviewGenerationSessionAction({
        sessionId: storedSessionId,
        payload: validatedPayload,
        forceNew: true,
      });

      if (res.success && Array.isArray(res.suggestions) && res.suggestions.length > 0) {
        setSuggestions(res.suggestions);
        setSessionId(res.sessionId);

        if (typeof window !== "undefined" && res.sessionId) {
          sessionStorage.setItem(SESSION_STORAGE_KEY, res.sessionId);
          localStorage.setItem(SESSION_STORAGE_KEY, res.sessionId);
        }

        const firstItem = res.suggestions[0];
        setSelectedSuggestion(firstItem);

        if (onSelectReviewRef.current) {
          onSelectReviewRef.current(firstItem);
        }

        setError(null);
      } else {
        setError(res.error || "Failed to generate new review variations.");
      }
    } catch (err) {
      console.error("Regenerate error:", err);
      setError("Failed to create new review variations.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setSelectedSuggestion(suggestion);

    if (onSelectReviewRef.current) {
      onSelectReviewRef.current(suggestion);
    }

    if (sessionId) {
      updateSessionSelectedReviewAction({ sessionId, selectedReview: suggestion }).catch((e) =>
        console.warn("Session update notice:", e.message)
      );
    }
  };

  const handleDoubleClickSuggestion = async (suggestion) => {
    setSelectedSuggestion(suggestion);

    if (onSelectReviewRef.current) {
      onSelectReviewRef.current(suggestion);
    }

    if (sessionId) {
      updateSessionSelectedReviewAction({ sessionId, selectedReview: suggestion }).catch((e) =>
        console.warn("Session update notice:", e.message)
      );
    }

    if (onProceedToPreviewRef.current) {
      onProceedToPreviewRef.current();
    }
  };

  const targetProductName =
    validatedPayload?.customProduct ||
    validatedPayload?.product ||
    (validatedPayload?.category ? `${validatedPayload.category} Furniture` : null);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100 dark:border-stone-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 rounded">
            Step 3: Choose Review
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-1">
            Choose Your Craftsmanship Review
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {targetProductName ? (
              <>
                Authentic reviews crafted for{" "}
                <strong className="text-amber-950 dark:text-amber-300">{targetProductName}</strong>.
              </>
            ) : (
              <>Authentic customer reviews generated for your visit.</>
            )}
          </p>
        </div>

        {onBackToInput && (
          <button
            type="button"
            onClick={onBackToInput}
            className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 text-amber-900 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Edit Details</span>
          </button>
        )}
      </div>

      {/* State Transitions: Loading vs Error vs Suggestion Cards */}
      {loading ? (
        <ReviewLoadingState
          language={validatedPayload?.language || "en"}
          estimatedSeconds={2}
        />
      ) : error ? (
        <ReviewGenerationError
          error={error}
          onRetry={handleRegenerate}
          onEditInputs={onBackToInput}
        />
      ) : (
        <div className="space-y-6">
          {/* List of Suggestions with single-click & double-click support */}
          <ReviewSuggestionList
            suggestions={suggestions}
            selectedId={selectedSuggestion?.id}
            onSelectSuggestion={handleSelectSuggestion}
            onDoubleClickSuggestion={handleDoubleClickSuggestion}
            onRegenerate={handleRegenerate}
            isRegenerating={loading}
          />

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-amber-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {onBackToInput && (
              <button
                type="button"
                onClick={onBackToInput}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Back to Customer Inputs</span>
              </button>
            )}

            {onProceedToPreview && (
              <button
                type="button"
                onClick={onProceedToPreview}
                disabled={!selectedSuggestion}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-amber-50 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Proceed to Final Preview</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
