"use client";

import { Star, MapPin, ExternalLink } from "lucide-react";
import { GOOGLE_WRITE_REVIEW_URL, BUSINESS_NAME } from "./clipboard";

export default function ReviewHeader() {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
        <Star className="w-3.5 h-3.5 text-amber-700 fill-amber-700" aria-hidden="true" />
        <span>Verified Patron Review Assistant</span>
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-slate-900">
        Share Your Craftsmanship Experience
      </h1>

      <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Follow our multi-step assistant to prepare and publish your feedback. Choose your rating, select your purchased furniture, review personalized suggestions, and submit directly to Google Maps.
      </p>

      <a
        href={GOOGLE_WRITE_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-amber-950 font-bold bg-white px-4 py-2 rounded-full border border-amber-300 shadow-sm hover:bg-amber-50 hover:border-amber-500 transition-colors"
        title="Open Solapur Google Maps Review Page directly"
      >
        <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" aria-hidden="true" />
        <span>{BUSINESS_NAME}</span>
        <ExternalLink className="w-3 h-3 text-amber-700 ml-0.5" aria-hidden="true" />
      </a>
    </div>
  );
}
