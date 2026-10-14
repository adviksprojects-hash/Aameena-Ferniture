"use client";

import { User, Phone, Edit3 } from "lucide-react";

export default function ReviewPreview({
  reviewText,
  onReviewTextChange,
  author,
  onAuthorChange,
  authorError,
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
          className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide"
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
          className="w-full p-4 rounded-2xl bg-slate-950/90 border border-amber-700/80 text-white placeholder:text-stone-400 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 leading-relaxed shadow-inner"
        />
      </div>

      {/* Customer Attribution (Name is Compulsory) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label
            htmlFor="customer-name-input"
            className="text-[11px] font-bold text-amber-300 flex items-center gap-1"
          >
            <User className="w-3 h-3 text-amber-400" aria-hidden="true" />
            <span>Customer Name <span className="text-red-400">* (Compulsory)</span>:</span>
          </label>
          <input
            id="customer-name-input"
            type="text"
            required
            placeholder="e.g. Rahul Deshmukh *"
            value={author || ""}
            onChange={(e) => onAuthorChange(e.target.value)}
            className={`w-full p-3 rounded-xl bg-slate-950/90 border text-white text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 font-medium transition-colors ${
              authorError
                ? "border-red-500 focus:ring-red-400"
                : "border-amber-700/80 focus:ring-amber-400 focus:border-amber-400"
            }`}
          />
          {authorError && (
            <p className="text-[10px] text-red-400 font-semibold">{authorError}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="customer-phone-input"
            className="text-[11px] font-bold text-amber-300 flex items-center gap-1"
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
            className={`w-full p-3 rounded-xl bg-slate-950/90 border text-white text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 font-medium transition-colors ${
              phoneError
                ? "border-red-500 focus:ring-red-400"
                : "border-amber-700/80 focus:ring-amber-400 focus:border-amber-400"
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
