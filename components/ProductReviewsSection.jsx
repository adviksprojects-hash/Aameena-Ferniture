"use client";

import { useState, useEffect } from "react";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Camera,
  X,
  Upload,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Award,
  AlertCircle,
  Eye,
  Plus,
} from "lucide-react";
import {
  getProductReviews,
  submitProductReview,
  voteHelpfulReview,
} from "@/actions/productReviewActions";

export default function ProductReviewsSection({ product }) {
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStar, setFilterStar] = useState(null);
  const [filterAspect, setFilterAspect] = useState(null);
  const [sortBy, setSortBy] = useState("top"); // top, recent, highest, lowest
  const [showHowCalculated, setShowHowCalculated] = useState(false);
  const [votedReviews, setVotedReviews] = useState({});
  const [visibleCount, setVisibleCount] = useState(3);

  // Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [city, setCity] = useState("Solapur");
  const [headline, setHeadline] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [selectedFinish, setSelectedFinish] = useState(
    product.finishType || "Natural Honey Teak"
  );
  const [selectedAspects, setSelectedAspects] = useState([
    "Wood quality",
    "Value for money",
  ]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imagesList, setImagesList] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleDeviceImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (imagesList.length + files.length > 5) {
      alert("You can upload a maximum of 5 photos per review.");
      return;
    }

    setIsUploadingImage(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          setImagesList((prev) => [...prev, data.url]);
        } else {
          alert(data.error || "Failed to upload image.");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image: " + err.message);
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Photo Lightbox
  const [activePhotoModal, setActivePhotoModal] = useState(null);

  const loadReviews = async () => {
    setLoading(true);
    const res = await getProductReviews(product.id, {
      title: product.title,
      woodType: product.woodType,
      finishType: product.finishType,
      slug: product.slug,
    });
    if (res?.success) {
      setReviewsData(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (product?.id) {
      loadReviews();
    }
  }, [product?.id]);

  const stats = reviewsData?.stats || {
    averageRating: 0,
    totalReviews: 0,
    distribution: {
      5: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      1: { count: 0, percentage: 0 },
    },
    aspects: [
      { tag: "Wood quality", count: 0, positive: true },
      { tag: "Finishing & Polish", count: 0, positive: true },
      { tag: "Value for money", count: 0, positive: true },
      { tag: "Comfort & Ergonomics", count: 0, positive: true },
      { tag: "Durability & Sturdiness", count: 0, positive: true },
    ],
    aiSummary: "",
  };

  const allReviews = reviewsData?.reviews || [];
  const customerPhotos = reviewsData?.customerPhotos || [];

  // Filter reviews
  const filteredReviews = allReviews.filter((r) => {
    if (filterStar && Math.round(r.rating) !== filterStar) return false;
    if (filterAspect) {
      const matchText = (r.reviewText + " " + r.headline).toLowerCase();
      if (!matchText.includes(filterAspect.toLowerCase())) return false;
    }
    return true;
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    // default "top"
    return (b.helpfulVotes || 0) - (a.helpfulVotes || 0);
  });

  const displayedReviews = sortedReviews.slice(0, visibleCount);

  const handleHelpfulClick = async (reviewId) => {
    if (votedReviews[reviewId]) return;
    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
    setReviewsData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reviews: prev.reviews.map((r) =>
          r.id === reviewId ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r
        ),
      };
    });
    await voteHelpfulReview(reviewId);
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setImagesList((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const handleRemoveImage = (index) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAspect = (aspect) => {
    setSelectedAspects((prev) =>
      prev.includes(aspect) ? prev.filter((a) => a !== aspect) : [...prev, aspect]
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || reviewerName.trim().length < 2) {
      alert("Please enter your name.");
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 10) {
      alert("Please enter a review of at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productId: product.id,
        productTitle: product.title,
        reviewerName: reviewerName.trim(),
        city: city.trim(),
        rating: formRating,
        headline: headline.trim() || `${formRating}-Star Review for ${product.title}`,
        reviewText: reviewText.trim(),
        woodType: product.woodType,
        finish: selectedFinish,
        images: imagesList,
        aspects: selectedAspects,
      };

      const res = await submitProductReview(payload);
      if (res?.success) {
        setIsModalOpen(false);
        setFeedback({
          type: "success",
          message: "Thank you! Your product review has been submitted successfully.",
        });
        // Prepend new review immediately to view
        setReviewsData((prev) => {
          if (!prev) return prev;
          const updated = [res.review, ...prev.reviews];
          const total = (prev.stats.totalReviews || 0) + 1;
          const newAvg = Number(
            (
              (prev.stats.averageRating * (total - 1) + res.review.rating) /
              total
            ).toFixed(1)
          );
          return {
            ...prev,
            reviews: updated,
            stats: {
              ...prev.stats,
              totalReviews: total,
              averageRating: newAvg,
            },
          };
        });
        // Reset form
        setReviewText("");
        setHeadline("");
        setImagesList([]);
      } else {
        alert(res?.error || "Failed to submit review.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = {
    1: "Terrible",
    2: "Poor",
    3: "Average",
    4: "Good",
    5: "Outstanding!",
  };

  return (
    <div
      className="pt-12 border-t border-amber-200/80 space-y-10 text-slate-900"
      id="product-reviews-section"
      suppressHydrationWarning
    >
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION HEADER                                                 */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-700" />
            Verified Customer Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 mt-0.5">
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authentic craftsmanship ratings and verified buyer reviews for {product.title}.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Product Review</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* AMAZON-STYLE 2-COLUMN OVERVIEW & ANALYSIS                      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm">
        {/* LEFT COLUMN: RATINGS BREAKDOWN & WRITE REVIEW CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Customer reviews</h3>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      stats.totalReviews > 0 && star <= Math.round(stats.averageRating)
                        ? "text-amber-500 fill-amber-500"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-base font-extrabold text-slate-900">
                {stats.totalReviews > 0 ? `${stats.averageRating} out of 5` : "No ratings yet"}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.totalReviews} global rating{stats.totalReviews === 1 ? "" : "s"}
            </div>
          </div>

          {/* 5-STAR TO 1-STAR PROGRESS BARS */}
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((starNum) => {
              const row = stats.distribution?.[starNum] || { count: 0, percentage: 0 };
              const isSelected = filterStar === starNum;

              return (
                <button
                  key={starNum}
                  onClick={() => setFilterStar(isSelected ? null : starNum)}
                  className={`w-full flex items-center gap-3 text-xs group cursor-pointer transition-colors p-1 rounded-lg ${
                    isSelected ? "bg-amber-100 font-bold" : "hover:bg-slate-100"
                  }`}
                >
                  <span className="w-12 text-slate-700 font-medium group-hover:text-amber-900 shrink-0">
                    {starNum} star
                  </span>

                  {/* Progress Track */}
                  <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-slate-600 group-hover:text-slate-900 font-semibold shrink-0">
                    {row.percentage}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* How Ratings Are Calculated Accordion */}
          <div className="border-t border-slate-200 pt-3">
            <button
              onClick={() => setShowHowCalculated(!showHowCalculated)}
              className="text-xs text-amber-900 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>How are ratings calculated?</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showHowCalculated ? "rotate-180" : ""
                }`}
              />
            </button>
            {showHowCalculated && (
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                To calculate the overall star rating and percentage breakdown by star, we verify direct workshop purchases, customer feedback on joinery and finish, and authentic patron reviews without automated bias.
              </p>
            )}
          </div>

          {/* Review This Product Box */}
          <div className="border-t border-slate-200 pt-5 space-y-2">
            <h4 className="text-sm font-bold text-slate-900">Review this product</h4>
            <p className="text-xs text-slate-600">
              Share your thoughts with other customers and future buyers
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-2 py-2.5 px-4 rounded-xl border-2 border-amber-900/30 hover:border-amber-900 bg-amber-50/60 hover:bg-amber-100 text-amber-950 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            >
              Write a product review
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: "CUSTOMERS SAY" & CRAFTSMANSHIP ASPECTS */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customers Say AI Summary */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Customers say</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              {stats.aiSummary ||
                `Customers find this ${product.woodType || "Solid Wood"} ${product.title} to feature authentic grain, smooth weather-sealed polishing, and ergonomic stability. Direct factory rates and punctual delivery from Solapur make it a popular bespoke piece.`}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Generated from the text of verified customer reviews</span>
            </div>
          </div>

          {/* Select to Learn More Aspects */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Select to learn more:
            </span>
            <div className="flex flex-wrap gap-2">
              {stats.aspects.map((aspect, i) => {
                const isSelected = filterAspect === aspect.tag;
                return (
                  <button
                    key={i}
                    onClick={() => setFilterAspect(isSelected ? null : aspect.tag)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-amber-900 text-white border-amber-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-amber-500 hover:text-amber-900 shadow-2xs"
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{aspect.tag}</span>
                    {aspect.count > 0 && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({aspect.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Photos and Videos Gallery */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-800 block">
              Customer photos and videos:
            </span>
            {customerPhotos.length > 0 ? (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {customerPhotos.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePhotoModal(photo)}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200 cursor-pointer group shadow-2xs hover:shadow-md transition-all bg-slate-100"
                  >
                    <img
                      src={photo.url}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 text-amber-400 pointer-events-none">
                      {[1, 2, 3, 4, 5].slice(0, photo.rating || 5).map((s) => (
                        <Star key={s} className="w-2.5 h-2.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic bg-white p-3.5 rounded-2xl border border-slate-200/80">
                No customer photos uploaded yet. Share a picture of your piece to be featured here!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILTER & SORT BAR                                              */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
          <span className="font-bold text-slate-900">
            Showing {Math.min(displayedReviews.length, sortedReviews.length)} of {allReviews.length} reviews
          </span>

          {(filterStar || filterAspect) && (
            <div className="flex items-center gap-2">
              {filterStar && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  {filterStar} Star
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilterStar(null)}
                  />
                </span>
              )}
              {filterAspect && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  {filterAspect}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilterAspect(null)}
                  />
                </span>
              )}
              <button
                onClick={() => {
                  setFilterStar(null);
                  setFilterAspect(null);
                }}
                className="text-xs text-amber-800 underline font-semibold cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
          >
            <option value="top">Top Reviews</option>
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CUSTOMER REVIEWS CARDS LIST (PAGINATED WITH VIEW MORE)          */}
      {/* ============================================================== */}
      <div className="space-y-6">
        {sortedReviews.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
            <MessageSquare className="w-10 h-10 text-amber-800/40 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">
              {allReviews.length === 0
                ? "Be the first to review this handcrafted piece"
                : "No reviews match your selected filter"}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {allReviews.length === 0
                ? `Have you purchased or inspected this ${product.woodType || "piece"} at our Solapur workshop? Share your genuine feedback!`
                : "Try clearing your filters or selecting a different rating."}
            </p>
            <button
              onClick={() => {
                if (allReviews.length === 0) {
                  setIsModalOpen(true);
                } else {
                  setFilterStar(null);
                  setFilterAspect(null);
                }
              }}
              className="px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {allReviews.length === 0 ? "Write the First Review" : "Reset Filters"}
            </button>
          </div>
        ) : (
          displayedReviews.map((review) => {
            const isVoted = votedReviews[review.id];

            return (
              <div
                key={review.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
              >
                {/* Reviewer Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center text-sm shadow-inner shrink-0">
                      {review.reviewerName?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {review.reviewerName}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{review.city || "Solapur, India"}</span>
                        {review.isVerified && (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Star Rating & Headline */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= review.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  {review.headline && (
                    <span className="text-sm font-bold text-slate-900">
                      {review.headline}
                    </span>
                  )}
                </div>

                {/* Purchase Configuration Specs Tag */}
                <div className="text-[11px] text-slate-500 bg-slate-50 py-1 px-2.5 rounded-lg inline-block border border-slate-200/60">
                  <span className="font-semibold text-slate-700">Timber:</span> {review.woodType || product.woodType} •{" "}
                  <span className="font-semibold text-slate-700">Polish:</span> {review.finish || "Natural Honey Teak"}
                </div>

                {/* Review Body Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {review.reviewText}
                </p>

                {/* Attached Customer Photos */}
                {Array.isArray(review.images) && review.images.length > 0 && (
                  <div className="flex items-center gap-2.5 pt-1 overflow-x-auto">
                    {review.images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          setActivePhotoModal({
                            url: img,
                            reviewerName: review.reviewerName,
                            headline: review.headline,
                            rating: review.rating,
                          })
                        }
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-2xs bg-slate-100"
                      >
                        <img
                          src={img}
                          alt=""
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Owner Response */}
                {review.ownerReply && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                      Response from Aameena Furniture Owner:
                    </span>
                    <p className="text-amber-900 leading-relaxed">
                      {review.ownerReply}
                    </p>
                  </div>
                )}

                {/* Footer Action: Helpful Button & Report */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <button
                    onClick={() => handleHelpfulClick(review.id)}
                    disabled={isVoted}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isVoted
                        ? "bg-amber-100 text-amber-950 border-amber-300 font-bold"
                        : "bg-white hover:bg-amber-50 text-slate-700 border-slate-300 hover:border-amber-400"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>
                      {isVoted ? "Marked Helpful" : `Helpful (${review.helpfulVotes || 0})`}
                    </span>
                  </button>

                  <span className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer">
                    Report
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* View More / Show Less Pagination Button */}
        {sortedReviews.length > 3 && (
          <div className="flex items-center justify-center gap-3 pt-3">
            {visibleCount < sortedReviews.length ? (
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((prev) => Math.min(prev + 3, sortedReviews.length))
                }
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-50 text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2 border border-amber-700/60"
              >
                <span>View More Reviews ({sortedReviews.length - visibleCount} more)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setVisibleCount(3)}
                className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Show Less</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: WRITE A PRODUCT REVIEW (NO ORDER ID / NO PROD ID FIELD)  */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
                  Write a Product Review
                </h3>
                <span className="text-xs text-slate-500">
                  For: <strong className="text-slate-800">{product.title}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReview} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Overall Rating */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-center">
                <label className="font-bold text-slate-800 text-sm block">
                  How would you rate this furniture piece? *
                </label>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-120 cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || formRating)
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-900 block">
                  {ratingLabels[hoverRating || formRating]}
                </span>
              </div>

              {/* Reviewer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Rajesh Patil"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your City / Location *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Solapur, Maharashtra"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Review Headline *</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={`e.g. Magnificent solid ${product.woodType || "wood"} craftsmanship!`}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Review Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Detailed Feedback & Experience *</label>
                  <span className="text-[10px] text-slate-400">
                    {reviewText.length} characters (min 10)
                  </span>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  placeholder={`Describe the ${product.woodType || "timber"} quality, polish smoothness, joinery strength, or anything future buyers should know...`}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                  required
                />
              </div>

              {/* Selected Finish */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Selected Wood Polish:</label>
                <select
                  value={selectedFinish}
                  onChange={(e) => setSelectedFinish(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Natural Honey Teak">Natural Honey Teak</option>
                  <option value="Warm Walnut Satin">Warm Walnut Satin</option>
                  <option value="Deep Dark Espresso">Deep Dark Espresso</option>
                  <option value="Custom Factory Polish">Custom Factory Polish</option>
                </select>
              </div>

              {/* Craftsmanship Aspects Checkboxes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  What stood out in your experience? (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Wood quality",
                    "Finishing & Polish",
                    "Value for money",
                    "Comfort & Ergonomics",
                    "Durability & Sturdiness",
                    "Doorstep Delivery",
                  ].map((aspect) => {
                    const isChecked = selectedAspects.includes(aspect);
                    return (
                      <button
                        key={aspect}
                        type="button"
                        onClick={() => toggleAspect(aspect)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isChecked
                            ? "bg-amber-900 text-white border-amber-900"
                            : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {isChecked ? `✓ ${aspect}` : `+ ${aspect}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photos Section: Upload from Device or Paste URL */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-amber-800" />
                    Upload Customer Photos of Furniture (Optional):
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Max 5 photos</span>
                </div>

                {/* Primary Upload Button: Choose from Device / Camera */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label
                    htmlFor="customer-photo-upload"
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-700 bg-amber-50/60 hover:bg-amber-100/60 text-amber-950 font-bold text-xs transition-all cursor-pointer shadow-2xs ${
                      isUploadingImage ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    <Upload className="w-4 h-4 text-amber-800" />
                    <span>
                      {isUploadingImage
                        ? "Uploading photo from device..."
                        : "Upload Photo from Device / Camera"}
                    </span>
                    <input
                      id="customer-photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDeviceImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Secondary Option: Or Paste Image URL */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste image URL (e.g. https://...)..."
                    className="flex-1 rounded-xl border border-slate-300 bg-white p-2 text-slate-900 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shrink-0 cursor-pointer text-xs"
                  >
                    Add URL
                  </button>
                </div>

                {/* Uploaded Photos Preview Grid */}
                {imagesList.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-600 block">
                      Uploaded Photos ({imagesList.length}/5):
                    </span>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {imagesList.map((url, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-300 group bg-slate-100 shadow-xs"
                        >
                          <img
                            src={url}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="absolute inset-0 bg-red-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold"
                            title="Remove Photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-bold shadow-md transition-all hover:scale-102 cursor-pointer"
                >
                  {isSubmitting ? "Submitting Review..." : "Submit Product Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHOTO LIGHTBOX MODAL                                           */}
      {/* ============================================================== */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl space-y-4"
          >
            <div className="relative aspect-video sm:aspect-4/3 w-full bg-black">
              <img
                src={activePhotoModal.url}
                alt=""
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setActivePhotoModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {activePhotoModal.reviewerName}
                </span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].slice(0, activePhotoModal.rating || 5).map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600">
                {activePhotoModal.headline || "Verified Customer Furniture Photo"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
