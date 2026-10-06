"use client";

/**
 * @file app/admin/reviews/page.jsx
 * Admin Review Moderation Dashboard.
 * Theme: Strictly consistent with Admin Panel (bg-slate-950, bg-slate-900, border-slate-800, amber-500).
 * Keep strictly: Search, Status Filter, Review List, Approve, Hide, Restore, Reply, Delete (Admin only).
 * Zero cards, zero stats.
 */

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAdminReviewManagement } from "@/lib/reviews/management/hooks/useAdminReviewManagement";
import { AdminReviewTable } from "@/lib/reviews/management/components/AdminReviewTable";
import { BulkActionsBar } from "@/lib/reviews/management/components/BulkActionsBar";
import { AdminReviewDetailModal } from "@/lib/reviews/management/components/AdminReviewDetailModal";
import { NotificationBell } from "@/lib/reviews/management/components/NotificationBell";

export default function AdminReviewsDashboardPage() {
  const {
    activeTab,
    searchQuery,
    ratingFilter,
    page,
    totalPages,
    total,
    reviews,
    isLoading,
    isActionLoading,
    selectedIds,
    selectedReviewForDetail,
    feedback,
    setFeedback,
    setSearchQuery,
    setRatingFilter,
    setPage,
    handleTabChange,
    toggleSelect,
    toggleSelectAll,
    approveReview,
    rejectReview,
    archiveReview,
    hideReview,
    deleteFromWebsite,
    restoreReview,
    deleteReview,
    executeBulkAction,
    addOwnerReply,
    deleteOwnerReply,
    togglePinOwnerReply,
    setSelectedReviewForDetail,
    undoAction,
    bulkReplyReviews,
    refreshData,
  } = useAdminReviewManagement("OVERVIEW");

  const handleNotificationSelectReview = (reviewId) => {
    const found = reviews.find((r) => r.id === reviewId);
    if (found) {
      setSelectedReviewForDetail(found);
    } else {
      setSearchQuery(reviewId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Admin Review Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Customer Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Approve, reply to, hide, or delete customer reviews on the website.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <NotificationBell onSelectReview={handleNotificationSelectReview} />

          <button
            type="button"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/ai-reviews"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>Live Reviews Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border animate-in fade-in duration-200 ${
            feedback.type === "error"
              ? "bg-rose-950/40 text-rose-300 border-rose-900/60"
              : "bg-emerald-950/40 text-emerald-300 border-emerald-900/60"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline ml-4 cursor-pointer text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: "OVERVIEW", label: "All Reviews" },
          { id: "APPROVED", label: "Approved" },
          { id: "PENDING", label: "Needs Review" },
          { id: "HIDDEN", label: "Hidden" },
          { id: "DELETED", label: "Trash" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            suppressHydrationWarning
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-b-2 border-amber-500 text-amber-400 bg-amber-950/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Review Table with Search & Moderation Actions */}
      <AdminReviewTable
        reviews={reviews}
        total={total}
        page={page}
        totalPages={totalPages}
        selectedIds={selectedIds}
        searchQuery={searchQuery}
        ratingFilter={ratingFilter}
        isLoading={isLoading}
        isSuperAdmin={true}
        currentRole="ADMIN"
        onSearchChange={setSearchQuery}
        onRatingFilterChange={setRatingFilter}
        onPageChange={setPage}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onPreview={setSelectedReviewForDetail}
        onApprove={approveReview}
        onReject={rejectReview}
        onHide={hideReview}
        onDeleteFromWebsite={deleteFromWebsite}
        onRestore={restoreReview}
        onDelete={deleteReview}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        selectedReviews={reviews.filter((r) => selectedIds.includes(r.id))}
        isSuperAdmin={true}
        onApprove={() => executeBulkAction("APPROVE")}
        onReject={() => executeBulkAction("REJECT")}
        onHide={() => executeBulkAction("HIDE")}
        onRestore={() => executeBulkAction("RESTORE")}
        onDeleteFromWebsite={() => executeBulkAction("SOFT_DELETE")}
        onDelete={() => executeBulkAction("PERMANENT_DELETE")}
        onBulkReply={bulkReplyReviews}
        onClearSelection={() => toggleSelectAll()}
        isLoading={isActionLoading}
        undoAction={undoAction}
      />

      {/* Review Detail & Owner Response Modal */}
      <AdminReviewDetailModal
        isOpen={Boolean(selectedReviewForDetail)}
        onClose={() => setSelectedReviewForDetail(null)}
        review={selectedReviewForDetail}
        onApprove={approveReview}
        onReject={rejectReview}
        onArchive={archiveReview}
        onAddReply={addOwnerReply}
        onDeleteReply={deleteOwnerReply}
        onTogglePinReply={togglePinOwnerReply}
        onDeleteFromWebsite={deleteFromWebsite}
        onPermanentDelete={deleteReview}
        isLoading={isActionLoading}
        isSuperAdmin={true}
        currentRole="ADMIN"
      />
    </div>
  );
}
