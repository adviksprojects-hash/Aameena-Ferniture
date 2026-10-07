"use client";

import { Star, MapPin, ExternalLink } from "lucide-react";
import { GOOGLE_WRITE_REVIEW_URL, BUSINESS_NAME } from "./clipboard";

export default function ReviewHeader() {
  return (
    <div className="text-center space-y-2">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-bold uppercase tracking-wider shadow-2xs">
        <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" aria-hidden="true" />
        <span>Verified Patron Review Portal</span>
      </div>

      <div>
        <a
          href={GOOGLE_WRITE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-amber-950 dark:text-amber-200 font-bold bg-white dark:bg-stone-900 px-3.5 py-1.5 rounded-full border border-amber-300 dark:border-amber-800 shadow-2xs hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
          title="Open Solapur Google Maps Review Page directly"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <span>{BUSINESS_NAME}</span>
          <ExternalLink className="w-3 h-3 text-amber-600 dark:text-amber-400 ml-0.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
