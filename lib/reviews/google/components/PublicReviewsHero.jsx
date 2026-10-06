"use client";

/**
 * @file PublicReviewsHero.jsx
 * Large statistics hero section for public Google reviews.
 * Displays aggregate rating, rating distribution bars, sentiment %, language breakdown, and latest update.
 */

import Link from "next/link";
import { Star, ShieldCheck, PenTool, Sparkles, MessageSquare, ThumbsUp, Globe, ArrowUpRight } from "lucide-react";
import { SENTIMENT_METADATA, SENTIMENT_TIERS } from "../types/reviewTypes.js";
import { formatRelativeTime } from "../utils/relativeTime.js";

export function PublicReviewsHero({
  stats,
  activeRatingFilter,
  onRatingFilterClick,
}) {
  if (!stats) return null;

  const sentimentMeta = SENTIMENT_METADATA[stats.overallSentiment] || SENTIMENT_METADATA[SENTIMENT_TIERS.VERY_POSITIVE];
  const relativeLatestDate = formatRelativeTime(stats.latestReviewDate);

  return (
    <section
      aria-label="Google Reviews Summary and Overall Statistics"
      className="relative overflow-hidden bg-gradient-to-b from-amber-900 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-amber-800/40"
    >
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 size-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 size-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Top Header Badge Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-700/30 pb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Google Verified Ratings
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/50">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                Customer Reviews & Craftsmanship Feedback
              </h1>
            </div>
          </div>

          {/* Call to Action: Patron Review Assistant */}
          <Link
            href="/ai-reviews"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-600/20 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <PenTool className="size-3.5" />
            <span>Share Your Review</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-center">
          {/* Column 1: Big Rating Score */}
          <div className="lg:col-span-4 space-y-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-xl sm:text-2xl font-medium text-amber-200/70">
                  / 5.0
                </span>
              </div>

              {/* Stars display */}
              <div className="flex items-center justify-center sm:justify-start gap-1 py-1" aria-label={`Average rating ${stats.averageRating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-5 ${
                      star <= Math.round(stats.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-stone-700 text-stone-700"
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-stone-300">
                Based on <strong className="text-white font-semibold">{stats.totalReviews} verified Google reviews</strong>
              </p>
            </div>

            {/* Sentiment Tag and Latest Date */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sentimentMeta.badgeClass}`}>
                <span className={`size-1.5 rounded-full ${sentimentMeta.dotClass}`} />
                {sentimentMeta.label}
              </span>
              <span className="text-[11px] text-amber-200/70 font-medium">
                Latest: {relativeLatestDate}
              </span>
            </div>
          </div>

          {/* Column 2: Interactive Rating Distribution Bars */}
          <div className="lg:col-span-5 space-y-2 border-y md:border-y-0 md:border-x border-amber-800/40 py-4 md:py-0 md:px-6">
            <div className="flex items-center justify-between text-xs text-amber-200/80 font-medium pb-1">
              <span>Rating Breakdown</span>
              <span className="text-[11px] text-stone-400">Click bar to filter</span>
            </div>

            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star] || 0;
              const percent = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
              const isSelected = activeRatingFilter === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRatingFilterClick && onRatingFilterClick(star)}
                  className={`w-full flex items-center gap-3 py-1 px-2 rounded-lg transition-colors group text-left ${
                    isSelected
                      ? "bg-amber-800/40 ring-1 ring-amber-400/50"
                      : "hover:bg-amber-900/30"
                  }`}
                  aria-label={`Filter by ${star} star reviews: ${count} reviews (${percent}%)`}
                >
                  <div className="flex items-center gap-1 w-10 text-xs font-semibold text-stone-300 group-hover:text-amber-300">
                    <span>{star}</span>
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                  </div>

                  {/* Progress Bar Container */}
                  <div className="flex-1 h-2.5 bg-stone-800/80 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected
                          ? "bg-amber-400"
                          : star >= 4
                          ? "bg-amber-500 group-hover:bg-amber-400"
                          : star === 3
                          ? "bg-amber-600"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-12 text-right text-xs text-stone-400 group-hover:text-stone-200 tabular-nums">
                    {count} ({percent}%)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Column 3: Satisfaction and Language Breakdown */}
          <div className="lg:col-span-3 space-y-3">
            {/* Positive Rate Card */}
            <div className="bg-stone-900/80 border border-amber-800/40 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="size-3.5 text-emerald-400" />
                  Customer Satisfaction
                </span>
                <span className="font-bold text-emerald-400">{stats.positivePercentage}%</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Positive recommendation rate for Solapur hardwood furniture.
              </p>
            </div>

            {/* Owner Reply Rate Card */}
            <div className="bg-stone-900/80 border border-amber-800/40 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="size-3.5 text-amber-400" />
                  Owner Response Rate
                </span>
                <span className="font-bold text-amber-300">{stats.ownerReplyRate}%</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Management replies directly to customer feedback and delivery notes.
              </p>
            </div>

            {/* Language Distribution Chips */}
            <div className="bg-stone-900/80 border border-amber-800/40 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1 text-xs text-stone-400">
                <Globe className="size-3.5 text-blue-400" />
                <span>Multilingual Reviews</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium">
                  EN: {stats.languageDistribution.en}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium">
                  मराठी: {stats.languageDistribution.mr}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 font-medium">
                  हिंदी: {stats.languageDistribution.hi}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PublicReviewsHero;
