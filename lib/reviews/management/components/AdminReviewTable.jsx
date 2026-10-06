"use client";

/**
 * @file AdminReviewTable.jsx
 * Data table for admin and manager review moderation.
 * Theme: Consistent with Admin Panel (bg-slate-950, bg-slate-900, border-slate-800, amber-500).
 * Row selection, status badges, moderation indicators, inline actions, search/filter controls, and pagination.
 */

import React, { useState } from "react";
import {
  Star,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  EyeOff,
  RotateCcw,
  Phone,
} from "lucide-react";
import { REVIEW_STATUS, MODERATION_STATUS } from "../types/managementTypes.js";

export function AdminReviewTable({
  reviews = [],
  total = 0,
  page = 1,
  totalPages = 1,
  selectedIds = [],
  searchQuery = "",
  ratingFilter = "all",
  isLoading = false,
  isSuperAdmin = true,
  currentRole = "ADMIN",
  onSearchChange,
  onRatingFilterChange,
  onPageChange,
  onToggleSelect,
  onToggleSelectAll,
  onPreview,
  onApprove,
  onReject,
  onHide,
  onDeleteFromWebsite,
  onRestore,
  onDelete,
}) {
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());
  const allSelected = reviews.length > 0 && selectedIds.length === reviews.length;

  const toggleRowExpand = (id) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Star filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            suppressHydrationWarning
            placeholder="Search by reviewer, city, or content..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={ratingFilter}
            suppressHydrationWarning
            onChange={(e) => onRatingFilterChange?.(e.target.value)}
            className="text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars only</option>
            <option value="3">3 Stars only</option>
            <option value="2">2 Stars only</option>
            <option value="1">1 Star only</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                  />
                </th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review Content</th>
                <th className="py-3 px-4">Safety & Flags</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No reviews found in this view.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => {
                  const isChecked = selectedIds.includes(rev.id);

                  return (
                    <tr
                      key={rev.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isChecked ? "bg-amber-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSelect?.(rev.id)}
                          className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                        />
                      </td>

                      {/* Reviewer info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {rev.reviewerName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{rev.city || "Solapur"}</span>
                          {rev.images?.length > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-400">
                              <ImageIcon className="w-3 h-3" />
                              <span>{rev.images.length}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-amber-400">
                          <span className="font-bold text-white">
                            {rev.rating}
                          </span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </div>
                      </td>

                      {/* Review text snippet with Read more toggle & metadata */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="space-y-1.5">
                          <p
                            className={`text-slate-300 leading-relaxed transition-all ${
                              expandedRowIds.has(rev.id)
                                ? "text-slate-100 whitespace-pre-line"
                                : "line-clamp-2"
                            }`}
                          >
                            {rev.reviewText}
                          </p>

                          {/* Inline Read more / Show less toggle */}
                          {rev.reviewText && rev.reviewText.length > 80 && (
                            <button
                              type="button"
                              onClick={() => toggleRowExpand(rev.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                            >
                              {expandedRowIds.has(rev.id) ? (
                                <>
                                  <span>Show less</span>
                                  <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  <span>Read full review</span>
                                  <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}

                          {/* Metadata chips */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {rev.furniturePurchased && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-300/90 bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded-md font-medium">
                                <span>{rev.furniturePurchased}</span>
                              </span>
                            )}
                            {rev.woodType && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300/90 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded-md font-medium">
                                <span>{rev.woodType}</span>
                              </span>
                            )}
                            {rev.phone && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded-md">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                <span>{rev.phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Safety / AI Moderation Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              rev.moderationStatus === MODERATION_STATUS.SAFE
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-850"
                                : rev.moderationStatus === MODERATION_STATUS.BLOCKED
                                ? "bg-rose-950 text-rose-300 border border-rose-850"
                                : "bg-amber-950 text-amber-300 border border-amber-850"
                            }`}
                          >
                            {rev.moderationStatus === MODERATION_STATUS.SAFE ? (
                              <ShieldCheck className="w-3 h-3" />
                            ) : (
                              <ShieldAlert className="w-3 h-3" />
                            )}
                            <span>{rev.moderationStatus}</span>
                          </span>

                          {rev.isDuplicate && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
                              Duplicate
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                            rev.status === REVIEW_STATUS.APPROVED
                              ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                              : rev.status === REVIEW_STATUS.REJECTED
                              ? "bg-rose-950/60 text-rose-400 border-rose-800/60"
                              : rev.status === REVIEW_STATUS.SPAM
                              ? "bg-purple-950/60 text-purple-400 border-purple-800/60"
                              : rev.status === REVIEW_STATUS.ARCHIVED
                              ? "bg-slate-800 text-slate-300 border-slate-700"
                              : rev.status === REVIEW_STATUS.DELETED
                              ? "bg-rose-950/60 text-rose-300 border-rose-800"
                              : "bg-amber-950/60 text-amber-400 border-amber-800/60"
                          }`}
                        >
                          {rev.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onPreview?.(rev)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer text-[11px] font-semibold shadow-xs"
                            title="See full review details & specifications"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Details</span>
                          </button>

                          {rev.status !== REVIEW_STATUS.APPROVED && (
                            <button
                              type="button"
                              onClick={() => onApprove?.(rev.id)}
                              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 transition-colors"
                              title="Approve Review"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {rev.status !== REVIEW_STATUS.REJECTED && (
                            <button
                              type="button"
                              onClick={() => onReject?.(rev.id, "Rejected by moderation")}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                              title="Reject Review"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Hide (Archive) */}
                          {rev.status !== REVIEW_STATUS.ARCHIVED && rev.status !== REVIEW_STATUS.DELETED && (
                            <button
                              type="button"
                              onClick={() => onHide?.(rev.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                              title="Hide from Website (Archive)"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete from Website (Soft delete to DELETED) */}
                          {rev.status !== REVIEW_STATUS.DELETED && (
                            <button
                              type="button"
                              onClick={() => onDeleteFromWebsite?.(rev.id)}
                              className="p-1.5 rounded-lg text-amber-500 hover:text-amber-400 hover:bg-amber-950/30 transition-colors"
                              title="Delete from Website (Soft Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Restore if Deleted or Archived */}
                          {(rev.status === REVIEW_STATUS.DELETED || rev.status === REVIEW_STATUS.ARCHIVED) && (
                            <button
                              type="button"
                              onClick={() => onRestore?.(rev.id, "PENDING")}
                              className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 transition-colors"
                              title="Restore to Pending"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Permanently Delete from DB (Admin only, blocked for Manager) */}
                          {isSuperAdmin && currentRole !== "MANAGER" && (
                            <button
                              type="button"
                              onClick={() => onDelete?.(rev.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                              title="Permanently Delete from Database"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{reviews.length}</strong> of{" "}
            <strong className="text-white">{total}</strong> reviews
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
