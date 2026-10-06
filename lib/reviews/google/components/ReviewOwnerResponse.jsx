"use client";

/**
 * @file ReviewOwnerResponse.jsx
 * Verified Store Owner Response component.
 * Displays formal responses from AMEENA Distributors management with verified badge,
 * pinned status, and relative timestamp.
 */

import { CheckCircle2, ShieldCheck, CornerDownRight, Pin } from "lucide-react";
import { formatAbsoluteDate } from "../utils/relativeTime.js";

export function ReviewOwnerResponse({ ownerResponse }) {
  if (!ownerResponse || !ownerResponse.text) {
    return null;
  }

  const absoluteDate = formatAbsoluteDate(ownerResponse.responseDate);
  const isPinned = Boolean(ownerResponse.isPinned);

  return (
    <div
      className="mt-4 pt-4 border-t border-amber-200/60 dark:border-amber-900/40 relative"
      aria-label="Response from the owner"
    >
      <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/70 dark:border-amber-800/40 space-y-2">
        {/* Owner Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-sm ring-2 ring-amber-400/40 shrink-0">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Response from the Owner
                </span>
                <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                  — AMEENA Distributors
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/60 rounded-full">
                  <CheckCircle2 className="size-3 text-amber-700 dark:text-amber-400" />
                  Verified Store
                </span>
                {isPinned && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-amber-950 bg-amber-400 rounded-full shadow-2xs">
                    <Pin className="size-2.5" />
                    Pinned
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-[11px] text-stone-500 dark:text-stone-400" title={absoluteDate}>
            {ownerResponse.relativeTime || "Recently"}
          </div>
        </div>

        {/* Owner Text */}
        <div className="flex gap-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-1">
          <CornerDownRight className="size-4 text-amber-600/70 dark:text-amber-400/70 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="italic">
            &ldquo;{ownerResponse.text}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReviewOwnerResponse;
