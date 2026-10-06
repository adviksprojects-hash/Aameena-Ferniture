"use client";

import { MessageSquare, RefreshCw } from "lucide-react";

export default function ReviewEmptyState({ onReload, rating = 5 }) {
  return (
    <div className="py-12 px-4 text-center space-y-4 rounded-3xl bg-amber-50/50 border border-amber-200">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
        <MessageSquare className="w-6 h-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-800 font-serif">
          No Review Suggestions Available for {rating} Stars
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          We couldn&apos;t find suggestions matching this rating. You can write your own custom feedback in the next step or reload suggestions.
        </p>
      </div>
      {onReload && (
        <button
          type="button"
          onClick={onReload}
          className="px-4 py-2 rounded-xl bg-amber-900 text-amber-50 text-xs font-bold hover:bg-amber-800 transition-colors inline-flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reload Suggestions</span>
        </button>
      )}
    </div>
  );
}
