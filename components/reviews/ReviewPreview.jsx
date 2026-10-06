"use client";

import { User, Phone, Edit3 } from "lucide-react";

export default function ReviewPreview({
  reviewText,
  onReviewTextChange,
  author,
  onAuthorChange,
  phone,
  onPhoneChange,
  phoneError,
}) {
  return (
    <div className="space-y-5">
      {/* Editable Review Textarea */}
      <div className="space-y-1.5">
        <label
          htmlFor="final-review-text"
          className="text-xs font-bold text-amber-200 flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span>Editable Review Text:</span>
        </label>
        <textarea
          id="final-review-text"
          rows={5}
          value={reviewText || ""}
          onChange={(e) => onReviewTextChange(e.target.value)}
          placeholder="Write or refine your customer review here..."
          className="w-full p-4 rounded-2xl bg-amber-900/40 border border-amber-800 text-amber-50 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-400 leading-relaxed"
        />
      </div>

      {/* Optional Customer Attribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label
            htmlFor="customer-name-input"
            className="text-[11px] font-bold text-amber-200 flex items-center gap-1"
          >
            <User className="w-3 h-3 text-amber-400" aria-hidden="true" />
            <span>Your Name (Optional):</span>
          </label>
          <input
            id="customer-name-input"
            type="text"
            placeholder="e.g. Rahul Deshmukh"
            value={author || ""}
            onChange={(e) => onAuthorChange(e.target.value)}
            className="w-full p-3 rounded-xl bg-amber-900/30 border border-amber-800 text-amber-50 text-xs placeholder:text-amber-300/40 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="customer-phone-input"
            className="text-[11px] font-bold text-amber-200 flex items-center gap-1"
          >
            <Phone className="w-3 h-3 text-amber-400" aria-hidden="true" />
            <span>Phone Number (Optional):</span>
          </label>
          <input
            id="customer-phone-input"
            type="tel"
            placeholder="e.g. 9820112345"
            value={phone || ""}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={`w-full p-3 rounded-xl bg-amber-900/30 border text-amber-50 text-xs placeholder:text-amber-300/40 focus:outline-none focus:ring-1 font-medium ${
              phoneError ? "border-red-500 focus:ring-red-400" : "border-amber-800 focus:ring-amber-400"
            }`}
          />
          {phoneError && (
            <p className="text-[10px] text-red-400 font-semibold">{phoneError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
