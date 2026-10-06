"use client";

/**
 * @file BulkActionsBar.jsx
 * Floating bottom action bar allowing admins to execute bulk Approve,
 * Reject, Hide, Restore, Soft Delete, Permanent Delete, Bulk Reply, and Bulk Multi-Format Export.
 * Includes explicit Confirmation Modal, reply composer, and Undo Action toast.
 */

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  EyeOff,
  RotateCcw,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  MessageSquare,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Undo2,
} from "lucide-react";
import {
  exportReviewsToCSV,
  exportReviewsToExcel,
  exportReviewsToJSON,
  printReviewsCatalog,
} from "../../export/reviewExportEngine.js";

export function BulkActionsBar({
  selectedCount = 0,
  selectedReviews = [],
  isSuperAdmin = true,
  onApprove,
  onReject,
  onHide,
  onRestore,
  onDeleteFromWebsite,
  onDelete,
  onBulkReply,
  onClearSelection,
  isLoading = false,
  undoAction = null, // { label: string, onUndo: () => void }
}) {
  const [confirmModal, setConfirmModal] = useState(null); // { action: string, title: string, warning?: string, isDestructive?: boolean, handler: Function }
  const [actionReason, setActionReason] = useState("");
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [bulkReplyText, setBulkReplyText] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // If undoAction is active even when selectedCount === 0, display floating undo banner
  if (selectedCount === 0 && undoAction) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-5 duration-200">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-900 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-stone-700 text-xs font-medium">
          <span>{undoAction.label || "Action completed successfully."}</span>
          <button
            type="button"
            onClick={undoAction.onUndo}
            className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Undo2 className="size-3.5" />
            <span>Undo</span>
          </button>
        </div>
      </div>
    );
  }

  if (selectedCount === 0) return null;

  const handleOpenConfirm = (actionType) => {
    switch (actionType) {
      case "APPROVE":
        setConfirmModal({
          action: "APPROVE",
          title: `Approve ${selectedCount} Reviews`,
          summary: `Publish ${selectedCount} selected reviews immediately to the public website (/reviews).`,
          handler: onApprove,
        });
        break;
      case "REJECT":
        setConfirmModal({
          action: "REJECT",
          title: `Reject ${selectedCount} Reviews`,
          summary: `Mark ${selectedCount} reviews as rejected and hide them from the website.`,
          handler: onReject,
        });
        break;
      case "HIDE":
        setConfirmModal({
          action: "HIDE",
          title: `Hide ${selectedCount} Reviews`,
          summary: `Soft-hide ${selectedCount} reviews from the public store catalog.`,
          handler: onHide,
        });
        break;
      case "RESTORE":
        setConfirmModal({
          action: "RESTORE",
          title: `Restore ${selectedCount} Reviews`,
          summary: `Restore ${selectedCount} reviews back to active moderation status.`,
          handler: onRestore,
        });
        break;
      case "DELETE_FROM_WEBSITE":
        setConfirmModal({
          action: "DELETE_FROM_WEBSITE",
          title: `Delete ${selectedCount} Reviews from Website`,
          summary: `Soft delete: Instantly remove ${selectedCount} reviews from /reviews while preserving database history.`,
          handler: onDeleteFromWebsite,
        });
        break;
      case "PERMANENT_DELETE":
        setConfirmModal({
          action: "PERMANENT_DELETE",
          title: `Permanently Delete ${selectedCount} Reviews`,
          summary: `Permanently wipe ${selectedCount} reviews and all their moderation records from PostgreSQL database.`,
          warning: "CRITICAL WARNING: This action is permanent and IRREVERSIBLE. Records cannot be recovered.",
          isDestructive: true,
          handler: onDelete,
        });
        break;
      default:
        break;
    }
  };

  const handleExecuteConfirmedAction = () => {
    if (confirmModal?.handler) {
      confirmModal.handler(actionReason);
    }
    setConfirmModal(null);
    setActionReason("");
  };

  const handleExecuteBulkReply = () => {
    if (!bulkReplyText.trim()) return;
    if (onBulkReply) {
      onBulkReply(bulkReplyText.trim());
    }
    setIsReplyModalOpen(false);
    setBulkReplyText("");
  };

  const handleExportCSV = () => {
    exportReviewsToCSV(selectedReviews);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    exportReviewsToExcel(selectedReviews);
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    exportReviewsToJSON(selectedReviews);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    printReviewsCatalog(selectedReviews);
    setShowExportMenu(false);
  };

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-5 duration-200 max-w-[95vw]">
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800 text-xs font-medium flex-wrap justify-center">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
              {selectedCount}
            </span>
            <span className="font-semibold text-slate-200">Selected</span>
          </div>

          {/* Action buttons with Modal Trigger */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenConfirm("APPROVE")}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Approve</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenConfirm("REJECT")}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenConfirm("HIDE")}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-stone-200 transition-colors cursor-pointer"
              title="Hide from /reviews"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenConfirm("RESTORE")}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white transition-colors cursor-pointer"
              title="Restore to Active"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore</span>
            </button>

            {/* Bulk Reply Trigger */}
            <button
              type="button"
              onClick={() => setIsReplyModalOpen(true)}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
              title="Reply to all selected reviews"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Bulk Reply</span>
            </button>

            {/* Export Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((prev) => !prev)}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
                title="Export selected reviews"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-36 bg-stone-900 border border-stone-700 rounded-xl shadow-xl p-1 space-y-0.5 z-50 text-xs">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors text-left"
                  >
                    <FileText className="size-3.5 text-emerald-400" />
                    <span>CSV (.csv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors text-left"
                  >
                    <FileSpreadsheet className="size-3.5 text-amber-400" />
                    <span>Excel (.xls)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors text-left"
                  >
                    <Download className="size-3.5 text-cyan-400" />
                    <span>JSON (.json)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors text-left border-t border-stone-800 pt-1"
                  >
                    <Printer className="size-3.5 text-purple-400" />
                    <span>Print PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Delete from Website (Soft delete) */}
            <button
              type="button"
              onClick={() => handleOpenConfirm("DELETE_FROM_WEBSITE")}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
              title="Delete from Website (Soft Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete from Website</span>
            </button>

            {/* Permanent Delete (Super Admin only) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => handleOpenConfirm("PERMANENT_DELETE")}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
                title="Permanently remove from PostgreSQL database"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-200" />
                <span>Permanent Delete</span>
              </button>
            )}
          </div>

          {/* Clear selection */}
          <button
            type="button"
            onClick={() => onClearSelection?.()}
            disabled={isLoading}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors ml-1 cursor-pointer"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                {confirmModal.isDestructive ? (
                  <span className="p-2 rounded-xl bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </span>
                ) : (
                  <span className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </span>
                )}
                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  {confirmModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              {confirmModal.summary}
            </p>

            {confirmModal.warning && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300">
                {confirmModal.warning}
              </div>
            )}

            {/* Optional Reason Input for Audit Trail */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Reason / Internal Audit Note (Optional)
              </label>
              <input
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g. Verified genuine customer, Spam text, etc."
                className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteConfirmedAction}
                disabled={isLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5 ${
                  confirmModal.isDestructive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm & Proceed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reply Modal */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  Bulk Reply to {selectedCount} Reviews
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReplyModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              This response will be added as an official owner reply to all {selectedCount} selected reviews simultaneously.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Official Response Message
              </label>
              <textarea
                value={bulkReplyText}
                onChange={(e) => setBulkReplyText(e.target.value)}
                rows={4}
                placeholder="Thank you for choosing Aameena Furniture! We take immense pride in crafting genuine Sagwan teak and Sheesham hardwood..."
                className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setIsReplyModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteBulkReply}
                disabled={isLoading || !bulkReplyText.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Publish Bulk Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BulkActionsBar;
