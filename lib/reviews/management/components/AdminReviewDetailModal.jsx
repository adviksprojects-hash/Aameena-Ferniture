"use client";

/**
 * @file AdminReviewDetailModal.jsx
 * Comprehensive review inspection modal for administrators and managers.
 * Includes Customer details, Verified Purchase Management,
 * Owner Response Center with Templates, Review Media Center,
 * Internal Staff Notes, and Moderation Audit History.
 * Theme: Strictly consistent with Admin Panel (bg-slate-950, bg-slate-900, border-slate-800, amber-500).
 * 100% PostgreSQL driven via Prisma server actions.
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Star,
  CheckCircle2,
  XCircle,
  Archive,
  MessageSquare,
  Building,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Pin,
  Trash2,
  History,
  AlertTriangle,
  RotateCcw,
  FileText,
  Save,
  BadgeCheck,
  Camera,
  Check,
  Eye,
  Send,
  Zap,
} from "lucide-react";
import { MODERATION_STATUS, REVIEW_STATUS } from "../types/managementTypes.js";
import {
  saveReviewNotesAction,
  verifyReviewAction,
  requestVerificationAction,
  fetchReplyTemplatesAction,
} from "../actions/reviewManagementActions.js";
import { ReviewMediaCenter } from "../../media/components/ReviewMediaCenter.jsx";

const VERIFICATION_BADGES = [
  { id: "VERIFIED_PURCHASE", label: "Verified Purchase" },
  { id: "DELIVERED_CUSTOMER", label: "Delivered Customer" },
  { id: "SHOWROOM_VISIT", label: "Showroom Visit" },
  { id: "CUSTOM_ORDER", label: "Custom Order" },
  { id: "REPEAT_CUSTOMER", label: "Repeat Customer" },
];

export function AdminReviewDetailModal({
  isOpen,
  onClose,
  review,
  onApprove,
  onReject,
  onArchive,
  onAddReply,
  onDeleteReply,
  onTogglePinReply,
  onDeleteFromWebsite,
  onPermanentDelete,
  isLoading = false,
  isSuperAdmin = true,
  currentRole = "ADMIN",
}) {
  // State for Reply & Notes
  const [replyText, setReplyText] = useState(() => review?.ownerReply || "");
  const [isPinned, setIsPinned] = useState(() => Boolean(review?.isReplyPinned));
  const [internalNotes, setInternalNotes] = useState(() => review?.additionalNotes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Rejection State
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // History Toggle
  const [showHistorySection, setShowHistorySection] = useState(false);

  // Verification State
  const [isVerified, setIsVerified] = useState(() => Boolean(review?.isVerified));
  const [currentBadge, setCurrentBadge] = useState(() => review?.verificationBadge || "VERIFIED_PURCHASE");
  const [isUpdatingVerify, setIsUpdatingVerify] = useState(false);
  const [verifyStatusMessage, setVerifyStatusMessage] = useState("");
  const [showReqVerifyInput, setShowReqVerifyInput] = useState(false);
  const [reqVerifyReason, setReqVerifyReason] = useState("");

  // Reply Templates State
  const [templates, setTemplates] = useState([]);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  // Media Center State
  const [mediaCenterOpen, setMediaCenterOpen] = useState(false);
  const [mediaInitialIndex, setMediaInitialIndex] = useState(0);

  // Load Templates on Mount or Review change
  useEffect(() => {
    if (isOpen) {
      setReplyText(review?.ownerReply || "");
      setIsPinned(Boolean(review?.isReplyPinned));
      setInternalNotes(review?.additionalNotes || "");
      setIsVerified(Boolean(review?.isVerified));
      setCurrentBadge(review?.verificationBadge || "VERIFIED_PURCHASE");

      // Preload Reply Templates
      if (templates.length === 0) {
        fetchReplyTemplatesAction("ALL")
          .then((res) => {
            if (res.success && Array.isArray(res.templates)) {
              setTemplates(res.templates);
            }
          })
          .catch((err) => console.warn("Templates load notice:", err));
      }
    }
  }, [isOpen, review]);

  if (!isOpen || !review) return null;

  // Verification Handlers
  const handleVerifyBadge = async (badgeId) => {
    setIsUpdatingVerify(true);
    setVerifyStatusMessage("");
    try {
      const res = await verifyReviewAction({
        reviewId: review.id,
        isVerified: true,
        verificationBadge: badgeId,
        verifiedBy: currentRole,
        notes: `Verified as ${badgeId} via Admin Modal`,
      });
      if (res.success) {
        setIsVerified(true);
        setCurrentBadge(badgeId);
        setVerifyStatusMessage(`Verified with badge: ${badgeId}`);
        setTimeout(() => setVerifyStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setIsUpdatingVerify(false);
    }
  };

  const handleRevokeVerification = async () => {
    setIsUpdatingVerify(true);
    try {
      const res = await verifyReviewAction({
        reviewId: review.id,
        isVerified: false,
        verificationBadge: null,
        verifiedBy: currentRole,
        notes: "Verification revoked by Admin",
      });
      if (res.success) {
        setIsVerified(false);
        setVerifyStatusMessage("Verification revoked");
        setTimeout(() => setVerifyStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Revoke failed:", err);
    } finally {
      setIsUpdatingVerify(false);
    }
  };

  const handleSendVerifyRequest = async () => {
    if (!reqVerifyReason.trim()) return;
    setIsUpdatingVerify(true);
    try {
      const res = await requestVerificationAction({
        reviewId: review.id,
        reason: reqVerifyReason.trim(),
        requestedBy: currentRole,
      });
      if (res.success) {
        setVerifyStatusMessage("Verification request submitted to Admin");
        setShowReqVerifyInput(false);
        setReqVerifyReason("");
        setTimeout(() => setVerifyStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      setIsUpdatingVerify(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await saveReviewNotesAction(review.id, internalNotes);
      if (res.success) {
        setNotesSavedSuccess(true);
        setTimeout(() => setNotesSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Save notes failed:", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSaveReply = () => {
    if (replyText.trim()) {
      onAddReply?.(review.id, replyText.trim(), isPinned);
    }
  };

  const handleDeleteReply = () => {
    if (window.confirm("Are you sure you want to delete the official owner reply?")) {
      onDeleteReply?.(review.id);
      setReplyText("");
    }
  };

  const handleConfirmReject = () => {
    onReject?.(review.id, rejectReason || "Rejected by admin moderation");
    setShowRejectInput(false);
  };

  const handleApplyTemplate = (content) => {
    setReplyText(content);
    setShowTemplateDropdown(false);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${
              s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  const moderationHistory = Array.isArray(review.moderationHistory)
    ? review.moderationHistory
    : [];

  const replyHistory = Array.isArray(review.ownerReplyHistory)
    ? review.ownerReplyHistory
    : [];

  // Media files normalization
  const mediaList = Array.isArray(review.images)
    ? review.images
        .map((img, i) => {
          const url = typeof img === "object" && img ? img.url || img.src || "" : String(img || "");
          return {
            url,
            type: "image",
            title: `${review.furniturePurchased || "Furniture"} - Photo #${i + 1}`,
          };
        })
        .filter((item) => Boolean(item.url))
    : [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 shrink-0 bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm shadow-xs">
                {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : "C"}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white">
                    {review.reviewerName}
                  </h3>

                  {/* Review Status Badge */}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase border ${
                      review.status === REVIEW_STATUS.APPROVED
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                        : review.status === REVIEW_STATUS.REJECTED
                        ? "bg-rose-950/60 text-rose-400 border-rose-800/60"
                        : review.status === REVIEW_STATUS.SPAM
                        ? "bg-purple-950/60 text-purple-400 border-purple-800/60"
                        : review.status === REVIEW_STATUS.HIDDEN
                        ? "bg-slate-800 text-slate-300 border-slate-700"
                        : review.status === REVIEW_STATUS.DELETED
                        ? "bg-rose-950/60 text-rose-300 border-rose-800"
                        : "bg-amber-950/60 text-amber-400 border-amber-800/60"
                    }`}
                  >
                    {review.status}
                  </span>

                  {/* Verified Badge */}
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                      <BadgeCheck className="w-3 h-3 text-emerald-400" />
                      <span>{currentBadge ? currentBadge.replace(/_/g, " ") : "Verified Purchase"}</span>
                    </span>
                  ) : review.verificationRequested ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Verification Requested</span>
                    </span>
                  ) : null}

                  {review.isReplyPinned && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Pin className="w-2.5 h-2.5" />
                      <span>Pinned Reply</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  {renderStars(review.rating)}
                  <span className="text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-slate-400">• {review.city || "Solapur"}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
            {/* Main Review Content */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Customer Review Text
              </span>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                {review.reviewText}
              </div>
            </div>

            {/* Customer Photos Gallery */}
            {mediaList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Customer Photos ({mediaList.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Click to launch high-res zoom & rotation lightbox
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {mediaList.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMediaInitialIndex(idx);
                        setMediaCenterOpen(true);
                      }}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-800 hover:ring-2 hover:ring-amber-500 transition-all group shrink-0"
                    >
                      <Image
                        src={m.url}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="80px"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comprehensive Customer & Furniture Specifications Grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Customer & Craftsmanship Specifications
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Customer Name</span>
                  <span className="font-semibold text-white truncate block">
                    {review.reviewerName || "Verified Patron"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Phone Number</span>
                  {review.phone ? (
                    <a
                      href={`tel:${review.phone}`}
                      className="font-semibold text-amber-400 hover:underline flex items-center gap-1 truncate"
                    >
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{review.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-500 italic block">Not provided</span>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Furniture Item</span>
                  <span className="font-semibold text-amber-300 truncate block">
                    {review.furniturePurchased || "Handcrafted Furniture"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {review.furnitureCategory || "Living Room"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Timber / Wood Type</span>
                  <span className="font-semibold text-emerald-400 truncate block">
                    {review.woodType || "Sagwan Teak"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">City / Location</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {review.city || "Solapur"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Experience Type</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {review.visitedShowroom ? "Showroom Visit (Solapur)" : "Custom Delivery"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Delivery / Date</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {review.deliveryDate
                      ? new Date(review.deliveryDate).toLocaleDateString("en-IN")
                      : review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("en-IN")
                      : "Verified"}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Summary & Sentiment Insight */}
            {review.aiSummary && (
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Craftsmanship Insight & Sentiment</span>
                  {review.aiSentiment && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 font-semibold text-[9px]">
                      {review.aiSentiment}
                    </span>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {review.aiSummary}
                </p>
              </div>
            )}

            {/* VERIFIED PURCHASE SECTION */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Purchase Verification
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Current: {isVerified ? `Verified (${currentBadge})` : "Unverified Review"}
                    </span>
                  </div>
                </div>

                {verifyStatusMessage && (
                  <span className="text-xs font-semibold text-emerald-400 animate-pulse">
                    {verifyStatusMessage}
                  </span>
                )}
              </div>

              {/* Badges Selector (Super Admin) */}
              {isSuperAdmin && (
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-medium">Assign Verification Badge:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {VERIFICATION_BADGES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleVerifyBadge(b.id)}
                        disabled={isUpdatingVerify}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isVerified && currentBadge === b.id
                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xs"
                            : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}

                    {isVerified && (
                      <button
                        type="button"
                        onClick={handleRevokeVerification}
                        disabled={isUpdatingVerify}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-rose-800/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* OWNER RESPONSE CENTER */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Official Owner Reply
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {/* Template Picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTemplateDropdown((p) => !p)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 text-xs font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Insert Template</span>
                    </button>

                    {showTemplateDropdown && (
                      <div className="absolute right-0 mt-1 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 p-2 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                          Pre-seeded Templates:
                        </span>
                        {templates.length > 0 ? (
                          templates.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleApplyTemplate(t.content)}
                              className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors cursor-pointer"
                            >
                              <span className="font-bold block text-amber-400">
                                {t.title}
                              </span>
                              <span className="text-[10px] text-slate-400 line-clamp-1">
                                {t.content}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-2 text-xs text-slate-500">No templates found.</div>
                        )}
                      </div>
                    )}
                  </div>

                  {review.ownerReply && (
                    <button
                      type="button"
                      onClick={handleDeleteReply}
                      disabled={isLoading}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      title="Delete existing reply"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Reply</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Reply Textarea */}
              <div className="space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Type an official owner response from Aameena Furniture Solapur..."
                  className="w-full text-xs rounded-xl border border-slate-800 bg-slate-900 p-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-500"
                />

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Pin this reply to top of review</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveReply}
                    disabled={isLoading || !replyText.trim() || replyText === (review.ownerReply || "")}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{review.ownerReply ? "Update Reply" : "Post Reply"}</span>
                  </button>
                </div>
              </div>

              {/* Reply Edit History */}
              {replyHistory.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold block text-[11px] text-slate-400">
                    Reply Revision History ({replyHistory.length}):
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {replyHistory.map((ver, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 bg-slate-900 rounded-lg border border-slate-800"
                      >
                        <p className="italic text-slate-300">&ldquo;{ver.text}&rdquo;</p>
                        <span className="text-[10px] text-slate-500">
                          Edited on {new Date(ver.updatedAt || ver.date).toLocaleString("en-IN")} by{" "}
                          {ver.replyBy || "Owner"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Internal Staff Notes */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Internal Staff Notes (Private / Non-Public)
                  </h4>
                </div>
                {notesSavedSuccess && (
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Saved to database
                  </span>
                )}
              </div>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={2}
                placeholder="Add internal notes visible only to store managers and admins (e.g. verified order invoice #, workshop visit log)..."
                className="w-full text-xs rounded-xl border border-slate-800 bg-slate-900 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || internalNotes === (review?.additionalNotes || "")}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>{isSavingNotes ? "Saving..." : "Save Notes"}</span>
                </button>
              </div>
            </div>

            {/* Moderation Audit History Section */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Moderation History
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistorySection((prev) => !prev)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  {showHistorySection ? "Collapse History" : `View History (${moderationHistory.length})`}
                </button>
              </div>

              {showHistorySection && (
                <div className="space-y-2 pt-1 text-xs">
                  {moderationHistory.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No prior status transitions recorded.</p>
                  ) : (
                    moderationHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">
                              {entry.actionBy || "System"} ({entry.role || "ADMIN"})
                            </span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="font-bold text-amber-400">
                              {entry.oldStatus || "INITIAL"} → {entry.newStatus}
                            </span>
                          </div>
                          {entry.reason && (
                            <p className="text-[11px] text-slate-400 italic">
                              Reason: {entry.reason}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">
                          {new Date(entry.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer / Workflow Actions */}
          <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              Close
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              {showRejectInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Rejection reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="text-xs rounded-lg border border-rose-800 p-1.5 bg-slate-950 text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 cursor-pointer"
                  >
                    Confirm Reject
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    disabled={isLoading || review.status === REVIEW_STATUS.REJECTED}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteFromWebsite?.(review.id)}
                    disabled={isLoading || review.status === REVIEW_STATUS.HIDDEN}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-900/60 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50 text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer"
                    title="Soft-delete from website"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Delete from Website</span>
                  </button>

                  {/* Permanent Delete for Super Admin ONLY */}
                  {isSuperAdmin && currentRole !== "MANAGER" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "PERMANENT DELETE: This will completely erase this review and all its history from PostgreSQL. Proceed?"
                          )
                        ) {
                          onPermanentDelete?.(review.id);
                        }
                      }}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-800/80 bg-rose-950/60 text-rose-300 hover:bg-rose-900 text-xs font-medium transition-colors cursor-pointer"
                      title="Super Admin: Remove permanently from DB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanent Delete</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onApprove?.(review.id)}
                    disabled={isLoading || review.status === REVIEW_STATUS.APPROVED}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50 shadow-sm transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Media Center Lightbox */}
      <ReviewMediaCenter
        isOpen={mediaCenterOpen}
        onClose={() => setMediaCenterOpen(false)}
        mediaList={mediaList}
        initialIndex={mediaInitialIndex}
        reviewerName={review.reviewerName}
        furnitureTitle={review.furniturePurchased || "Handcrafted Sagwan Furniture"}
      />
    </>
  );
}

export default AdminReviewDetailModal;
