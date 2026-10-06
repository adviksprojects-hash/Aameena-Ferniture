"use client";

/**
 * @file QuickRemoveByReviewText.jsx
 * Quick Remove by Review Text moderation module.
 * Admin or manager pastes any excerpt/paragraph from a customer review.
 * Matches instantly by Exact, Whitespace-insensitive, Substring, or Semantic similarity.
 * Displays matching cards with one-click moderation actions:
 * [Approve], [Reject], [Hide from Website], [Delete from Website], and [Permanent Delete (Admin only)].
 */

import React, { useState, useTransition } from "react";
import {
  Search,
  Sparkles,
  Trash2,
  EyeOff,
  CheckCircle2,
  XCircle,
  Archive,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Star,
  Check,
} from "lucide-react";
import {
  quickFindReviewByTextAction,
  adminApproveReviewAction,
  adminRejectReviewAction,
  adminHideReviewAction,
  adminSoftDeleteReviewAction,
  adminDeleteReviewAction,
} from "../actions/reviewManagementActions.js";

export function QuickRemoveByReviewText({ isSuperAdmin = true, role = "ADMIN", onActionComplete }) {
  const allowPermanent = isSuperAdmin && role !== "MANAGER";
  const [inputText, setInputText] = useState("");
  const [matches, setMatches] = useState([]);
  const [isSearching, startSearching] = useTransition();
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSearch = (textToSearch) => {
    const query = typeof textToSearch === "string" ? textToSearch : inputText;
    if (!query || !query.trim()) {
      setMatches([]);
      return;
    }

    startSearching(async () => {
      setStatusMessage(null);
      const res = await quickFindReviewByTextAction(query);
      if (res.success) {
        setMatches(res.matches || []);
        if (res.matches?.length === 0) {
          setStatusMessage({
            type: "info",
            text: "No matching reviews found. Try a different sentence or snippet.",
          });
        }
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Search failed. Please try again.",
        });
      }
    });
  };

  const executeAction = async (reviewId, actionType) => {
    setActionLoadingId(`${reviewId}-${actionType}`);
    setStatusMessage(null);

    try {
      let result;
      if (actionType === "APPROVE") {
        result = await adminApproveReviewAction(reviewId);
      } else if (actionType === "REJECT") {
        result = await adminRejectReviewAction(reviewId, "Rejected via quick text moderation");
      } else if (actionType === "HIDE" || actionType === "ARCHIVE") {
        result = await adminHideReviewAction(reviewId);
      } else if (actionType === "SOFT_DELETE") {
        result = await adminSoftDeleteReviewAction(reviewId);
      } else if (actionType === "PERMANENT_DELETE") {
        if (!confirm("Are you sure you want to permanently delete this review from the database?")) {
          setActionLoadingId(null);
          return;
        }
        result = await adminDeleteReviewAction(reviewId);
      }

      if (result && result.success) {
        setStatusMessage({
          type: "success",
          text: `Review successfully updated: ${actionType.replace("_", " ")} applied.`,
        });

        // Re-run search to update match cards
        handleSearch(inputText);
        onActionComplete?.();
      } else {
        setStatusMessage({
          type: "error",
          text: result?.error || "Action could not be executed.",
        });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Fast Moderation Engine</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mt-0.5">
            Remove by Review Text
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Copy any text or excerpt from a review and paste it here. System instantly finds matching reviews with exact, partial, or semantic similarity.
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (e.target.value.length > 5) {
                handleSearch(e.target.value);
              } else {
                setMatches([]);
              }
            }}
            placeholder="Paste any review text here... (e.g. 'Exceptional craftsmanship! We purchased the 7-seater Sagwan sofa...')"
            className="w-full text-xs sm:text-sm rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/50 p-4 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-hidden dark:text-white resize-y"
          />
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-stone-400">
          <div className="flex items-center gap-3">
            <span>Supports: Exact Text • Partial Text • Semantic Similarity • Case & Whitespace Insensitive</span>
          </div>

          <div className="flex items-center gap-2">
            {inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputText("");
                  setMatches([]);
                  setStatusMessage(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSearch(inputText)}
              disabled={isSearching || !inputText.trim()}
              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Search className={`w-3.5 h-3.5 ${isSearching ? "animate-spin" : ""}`} />
              <span>{isSearching ? "Searching..." : "Find Matches"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
              : statusMessage.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
              : "bg-stone-50 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700"
          }`}
        >
          {statusMessage.type === "success" && <Check className="w-4 h-4 shrink-0 text-emerald-600" />}
          {statusMessage.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          {statusMessage.type === "info" && <ShieldAlert className="w-4 h-4 shrink-0 text-stone-400" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Matched Cards List */}
      {matches.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Found {matches.length} Matching Review{matches.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {matches.map(({ review, matchType, confidencePercent }) => {
              const isDeletingWebsite = actionLoadingId === `${review.id}-SOFT_DELETE`;
              const isHiding = actionLoadingId === `${review.id}-HIDE`;
              const isRejecting = actionLoadingId === `${review.id}-REJECT`;
              const isApproving = actionLoadingId === `${review.id}-APPROVE`;
              const isDeletingDb = actionLoadingId === `${review.id}-PERMANENT_DELETE`;

              return (
                <div
                  key={review.id}
                  className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850 space-y-3 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  {/* Top card row: Confidence Badge, Status Badge, Reviewer Name */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-stone-900 dark:text-white">
                        {review.reviewerName}
                      </span>
                      <span className="text-xs text-stone-400">
                        ({review.city || "Solapur"})
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold">{review.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Match Confidence Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          matchType === "EXACT" || matchType === "WHITESPACE_EXACT"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : matchType === "SUBSTRING_PARTIAL"
                            ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {matchType.replace("_", " ")} ({confidencePercent}%)
                      </span>

                      {/* Current Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                          review.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                            : review.status === "DELETED"
                            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400"
                            : review.status === "ARCHIVED"
                            ? "bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                  </div>

                  {/* Review text snippet */}
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                    &ldquo;{review.reviewText}&rdquo;
                  </p>

                  {/* Quick Moderation Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200/60 dark:border-stone-800">
                    <span className="text-[11px] text-stone-400">
                      ID: {review.id}
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Approve Button */}
                      {review.status !== "APPROVED" && (
                        <button
                          type="button"
                          onClick={() => executeAction(review.id, "APPROVE")}
                          disabled={Boolean(actionLoadingId)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Approve and show on /reviews"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isApproving ? "Approving..." : "Approve"}</span>
                        </button>
                      )}

                      {/* Hide / Archive Button */}
                      {review.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          onClick={() => executeAction(review.id, "HIDE")}
                          disabled={Boolean(actionLoadingId)}
                          className="px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-50 text-stone-700 dark:text-stone-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Hide from /reviews (Archive)"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>{isHiding ? "Hiding..." : "Hide"}</span>
                        </button>
                      )}

                      {/* Reject Button */}
                      {review.status !== "REJECTED" && (
                        <button
                          type="button"
                          onClick={() => executeAction(review.id, "REJECT")}
                          disabled={Boolean(actionLoadingId)}
                          className="px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Reject review"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>{isRejecting ? "Rejecting..." : "Reject"}</span>
                        </button>
                      )}

                      {/* Delete from Website (Soft Delete: status = DELETED) */}
                      {review.status !== "DELETED" && (
                        <button
                          type="button"
                          onClick={() => executeAction(review.id, "SOFT_DELETE")}
                          disabled={Boolean(actionLoadingId)}
                          className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs"
                          title="Remove from /reviews while keeping in DB with status DELETED"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{isDeletingWebsite ? "Removing..." : "Delete from Website"}</span>
                        </button>
                      )}

                      {/* Permanent Delete from Database (Super Admin only, blocked for Manager) */}
                      {allowPermanent && (
                        <button
                          type="button"
                          onClick={() => executeAction(review.id, "PERMANENT_DELETE")}
                          disabled={Boolean(actionLoadingId)}
                          className="px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs"
                          title="Permanently remove from PostgreSQL database"
                        >
                          <Trash2 className="w-3 h-3 text-rose-200" />
                          <span>{isDeletingDb ? "Deleting DB..." : "Permanent Delete"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickRemoveByReviewText;
