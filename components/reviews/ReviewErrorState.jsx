"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function ReviewErrorState({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium space-y-2"
    >
      <div className="flex items-center gap-2 font-bold text-red-950">
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
        <span>Something went wrong</span>
      </div>
      <p className="text-red-800">{error || "Unable to complete request. Please try again."}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-3 py-1.5 rounded-lg bg-red-900 text-white text-xs font-bold hover:bg-red-800 transition-colors inline-flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3 h-3" aria-hidden="true" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
