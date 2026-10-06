"use client";

/**
 * @file ReviewCard.jsx
 * Redesigned Premium Sagwan Furniture Review Card (Phase 8.5.1 Parts 6, 7, 8, 11).
 * Minimal, modern, responsive (light, dark, teak mode).
 * Collapsed by default (max 4 lines text with Read More).
 * Expands in-place to show full text, official owner response, AI summary, and furniture specs.
 * Features verified badge, customer images, helpful vote, and share.
 */

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Share2,
  Check,
  CheckCircle2,
  BadgeCheck,
  Camera,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { ReviewMediaCenter } from "../../media/components/ReviewMediaCenter.jsx";

function getCustomerInitials(name) {
  if (!name || typeof name !== "string") return "P";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ReviewCard({
  review,
  isExpanded = false,
  isHelpfulVoted = false,
  onToggleExpand,
  onToggleHelpful,
}) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [sharedFeedback, setSharedFeedback] = useState(false);

  const expanded = onToggleExpand ? isExpanded : localExpanded;

  const handleExpandToggle = () => {
    if (onToggleExpand) {
      onToggleExpand(review.id);
    } else {
      setLocalExpanded((prev) => !prev);
    }
  };

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/ai-reviews#review-${review.id}`
        : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Review by ${review.author?.name || "Customer"} — Aameena Furniture`,
          text: review.text,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") console.warn("Share notice:", err);
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl || review.text);
      setSharedFeedback(true);
      setTimeout(() => setSharedFeedback(false), 2500);
    } catch (e) {}
  };

  const effectiveHelpfulCount =
    (review.helpfulCount || review.helpfulVotes || 0) + (isHelpfulVoted ? 1 : 0);

  const authorName = review.author?.name || review.reviewerName || "Verified Patron";
  const avatarUrl = review.author?.avatarUrl || null;
  const ratingValue = Number(review.rating) || 5;
  const hasPurchasedProduct = Boolean(
    review.furniturePurchased &&
    review.furniturePurchased.trim() &&
    review.furniturePurchased !== "null" &&
    review.furniturePurchased !== "Showroom & Store Visit"
  );
  const isShowroom = Boolean(
    review.verificationBadge === "SHOWROOM_VISIT" ||
    review.furniturePurchased === "Showroom & Store Visit" ||
    review.furnitureCategory === "Showroom Visit" ||
    review.furnitureCategory === "Showroom Visit Only" ||
    (!review.verificationBadge && review.visitedShowroom && !hasPurchasedProduct)
  );
  const isVerifiedPurchase = Boolean(
    review.verificationBadge === "VERIFIED_PURCHASE" ||
    (!isShowroom && (hasPurchasedProduct || review.isVerified || review.verified))
  );

  const images = useMemo(() => {
    if (!Array.isArray(review.images)) return [];
    return review.images
      .map((img) => (typeof img === "object" && img ? img.url || img.src || "" : String(img || "")))
      .filter((url) => typeof url === "string" && url.trim().length > 0);
  }, [review.images]);

  return (
    <>
      <article
        id={`review-${review.id}`}
        data-review-id={review.id}
        className="group relative bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-fit space-y-4 will-change-transform"
        aria-label={`Customer review by ${authorName}, rated ${ratingValue} stars`}
      >
        <div className="space-y-3.5">
          {/* Top Row: Avatar, Name, Verified Badge, Date, Subtle Review ID */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Customer Avatar */}
              <div className="relative size-10 rounded-full overflow-hidden shrink-0 ring-2 ring-amber-500/20 bg-stone-100 dark:bg-stone-800">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={`${authorName}'s avatar`}
                    width={40}
                    height={40}
                    className="size-full object-cover"
                    unoptimized={avatarUrl.startsWith("data:") || !avatarUrl.includes("unsplash.com")}
                  />
                ) : (
                  <div className="size-full flex items-center justify-center font-bold text-xs text-amber-900 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300">
                    {getCustomerInitials(authorName)}
                  </div>
                )}
              </div>

              {/* Name, Verified Badge, City */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100 truncate">
                    {authorName}
                  </h3>
                  {/* Verified Badge */}
                  {isShowroom ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-900/60 shrink-0">
                      <BadgeCheck className="size-3" />
                      Showroom Visit
                    </span>
                  ) : isVerifiedPurchase ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-900/60 shrink-0">
                      <CheckCircle2 className="size-3" />
                      Verified Purchase
                    </span>
                  ) : null}
                </div>

                <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5 flex-wrap">
                  {review.city && (
                    <span className="flex items-center gap-0.5 text-[11px]">
                      <MapPin className="size-2.5 text-stone-400" />
                      <span>{review.city}</span>
                      <span>•</span>
                    </span>
                  )}
                  <span className="text-[11px]" suppressHydrationWarning>
                    {review.relativeTime || "Verified Customer"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5" aria-label={`${ratingValue} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-3.5 ${
                    star <= ratingValue
                      ? "fill-amber-400 text-amber-400"
                      : "fill-stone-200 text-stone-200 dark:fill-stone-800 dark:text-stone-800"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              {ratingValue.toFixed(1)}
            </span>
          </div>

          {/* Review Body Text (Max 4 lines clamped when collapsed, full text when expanded) */}
          <div className="relative">
            <p
              className={`text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed break-words whitespace-pre-line ${
                expanded ? "" : "line-clamp-4"
              }`}
            >
              {review.text}
            </p>

            {/* Read More / Show Less Button */}
            <div className="pt-1.5">
              <button
                type="button"
                onClick={handleExpandToggle}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
                aria-expanded={expanded}
              >
                <span>{expanded ? "Show less" : "Read more"}</span>
                {expanded ? (
                  <ChevronUp className="size-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Customer Attached Photos (preview thumbnails) */}
          {images.length > 0 && (
            <div className="pt-1 space-y-1">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <Camera className="size-3" />
                <span>Photos ({images.length})</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {images.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(i)}
                    className="relative size-14 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shrink-0 group shadow-2xs hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer"
                    title="View photo"
                  >
                    <Image
                      src={imgUrl}
                      alt={`Customer photo ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="56px"
                      unoptimized={imgUrl.startsWith("data:") || !imgUrl.includes("unsplash.com")}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EXPANDED SECTION (Part 7 & 8) */}
          {expanded && (
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300 ease-out">
              {/* Furniture Details or Showroom Visit Details */}
              {(review.furniturePurchased || review.woodType || review.furnitureCategory || isShowroom) && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    {isShowroom ? "Visit Details" : "Furniture Details"}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {!isShowroom && review.furniturePurchased && (
                      <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                        <span>🛋️</span>
                        <span>{review.furniturePurchased}</span>
                      </span>
                    )}
                    {isShowroom && (
                      <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                        <span>🏬</span>
                        <span>Solapur Flagship Showroom & Facility</span>
                      </span>
                    )}
                    {!isShowroom && review.woodType && (
                      <span className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                        <span>🪵</span>
                        <span>{review.woodType}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* AI Craftsmanship Summary (if present) */}
              {review.summary?.text && (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    <Sparkles className="size-3 text-amber-600 dark:text-amber-400" />
                    <span>AI Craftsmanship Summary</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
                    {review.summary.text}
                  </p>
                </div>
              )}

              {/* Official Owner Reply: Response from Aameena Furniture (Part 8) */}
              {review.ownerResponse && (
                <div className="p-3.5 bg-amber-900/5 dark:bg-amber-950/40 rounded-2xl border-l-4 border-amber-700 dark:border-amber-500 pl-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-xs text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <span>Response from Aameena Furniture</span>
                    </span>
                    {review.ownerResponse.responseDate && (
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">
                        {review.ownerResponse.formattedDate || review.ownerResponse.relativeTime || "Official Response"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic">
                    &ldquo;{review.ownerResponse.text}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Helpful Button & Share */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400 mt-auto">
          {/* Helpful Vote Button */}
          <button
            type="button"
            onClick={() => onToggleHelpful && onToggleHelpful(review.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              isHelpfulVoted
                ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 shadow-2xs"
                : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800/60 dark:hover:bg-stone-800 dark:text-stone-300 dark:border-stone-700"
            }`}
            aria-label={`Helpful vote. Currently ${effectiveHelpfulCount} helpful votes.`}
          >
            <ThumbsUp
              className={`size-3.5 ${isHelpfulVoted ? "fill-amber-600 text-amber-600" : ""}`}
              aria-hidden="true"
            />
            <span>Helpful ({effectiveHelpfulCount})</span>
          </button>

          {/* Share Button & External Link */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title={sharedFeedback ? "Link copied!" : "Share review"}
              aria-label="Share review"
            >
              {sharedFeedback ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Share2 className="size-3.5" />
              )}
            </button>

            {review.googleReviewUrl && (
              <a
                href={review.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                title="View on Google Maps"
                aria-label="View on Google Maps"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </article>

      {/* Media Lightbox */}
      {images.length > 0 && (
        <ReviewMediaCenter
          isOpen={selectedPhotoIndex !== null}
          onClose={() => setSelectedPhotoIndex(null)}
          mediaList={images.map((img, i) => ({
            url: img,
            type: "image",
            title: `${review.furniturePurchased || "Handcrafted Teakwood"} - Photo #${i + 1}`,
          }))}
          initialIndex={selectedPhotoIndex ?? 0}
          reviewerName={authorName}
          furnitureTitle={review.furniturePurchased || "Sagwan Teak Furniture"}
        />
      )}
    </>
  );
}

export default ReviewCard;
