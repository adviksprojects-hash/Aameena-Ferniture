"use client";

/**
 * @file useAdminReviewManagement.js
 * Client hook managing Admin Review Dashboard state, tabs, filters,
 * pagination, selection, bulk actions, and preview modals.
 */

import { useState, useCallback, useEffect } from "react";
import {
  adminFetchReviewsAction,
  adminFetchReviewStatsAction,
  adminApproveReviewAction,
  adminRejectReviewAction,
  adminArchiveReviewAction,
  adminHideReviewAction,
  adminSoftDeleteReviewAction,
  adminRestoreReviewAction,
  adminDeleteReviewAction,
  adminBulkAction,
  adminAddOwnerReplyAction,
  adminDeleteOwnerReplyAction,
  adminTogglePinOwnerReplyAction,
  bulkReplyCustomerReviewsAction,
  bulkUndoReviewStatusAction,
} from "../actions/reviewManagementActions.js";

export function useAdminReviewManagement(initialTab = "PENDING") {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    SPAM: 0,
    REPORTED: 0,
    ARCHIVED: 0,
    DELETED: 0,
    TOTAL: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [selectedReviewForDetail, setSelectedReviewForDetail] = useState(null);
  const [selectedReviewForImprove, setSelectedReviewForImprove] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [undoAction, setUndoAction] = useState(null);

  // Initial and reactive data fetching
  useEffect(() => {
    let isSubscribed = true;

    async function loadData() {
      try {
        const filters = {
          page,
          limit,
          search: searchQuery,
          rating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
        };

        if (activeTab !== "ALL" && activeTab !== "OVERVIEW") {
          filters.status = activeTab;
        }

        const [reviewsRes, statsRes] = await Promise.all([
          adminFetchReviewsAction(filters),
          adminFetchReviewStatsAction(),
        ]);

        if (isSubscribed) {
          if (reviewsRes.success) {
            setReviews(reviewsRes.reviews || []);
            setTotal(reviewsRes.total || 0);
            setTotalPages(reviewsRes.totalPages || 1);
          } else {
            setFeedback({ type: "error", message: reviewsRes.error || "Failed to load reviews" });
          }

          if (statsRes.success && statsRes.stats) {
            setStats(statsRes.stats);
          }

          setIsLoading(false);
        }
      } catch (err) {
        if (isSubscribed) {
          setFeedback({ type: "error", message: err.message });
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [activeTab, page, limit, searchQuery, ratingFilter]);

  // Method for action callbacks and manual refresh button
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = {
        page,
        limit,
        search: searchQuery,
        rating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
      };

      if (activeTab !== "ALL" && activeTab !== "OVERVIEW") {
        filters.status = activeTab;
      }

      const [reviewsRes, statsRes] = await Promise.all([
        adminFetchReviewsAction(filters),
        adminFetchReviewStatsAction(),
      ]);

      if (reviewsRes.success) {
        setReviews(reviewsRes.reviews || []);
        setTotal(reviewsRes.total || 0);
        setTotalPages(reviewsRes.totalPages || 1);
      }

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, limit, searchQuery, ratingFilter]);

  // Phase 8.3 Part 3: Live synchronization across tabs via BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const bc = new BroadcastChannel("aameena_reviews_sync");
    bc.onmessage = () => {
      refreshData();
    };
    return () => {
      bc.close();
    };
  }, [refreshData]);

  // Tab change resets page and selected rows
  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab);
    setPage(1);
    setSelectedIds([]);
  }, []);

  // Selection handlers
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.length === reviews.length && reviews.length > 0) {
        return [];
      }
      return reviews.map((r) => r.id);
    });
  }, [reviews]);

  // Approval
  const approveReview = useCallback(
    async (id) => {
      setIsActionLoading(true);
      try {
        const res = await adminApproveReviewAction(id);
        if (res.success) {
          setFeedback({ type: "success", message: "Review approved and published" });
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const bc = new BroadcastChannel("aameena_reviews_sync");
              bc.postMessage({ type: "STATUS_UPDATE", reviewId: id, status: "APPROVED", review: res.review });
              bc.close();
            } catch (e) {}
          }
          await refreshData();
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to approve review" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshData]
  );

  // Rejection
  const rejectReview = useCallback(
    async (id, reason) => {
      setIsActionLoading(true);
      try {
        const res = await adminRejectReviewAction(id, reason);
        if (res.success) {
          setFeedback({ type: "success", message: "Review rejected" });
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const bc = new BroadcastChannel("aameena_reviews_sync");
              bc.postMessage({ type: "STATUS_UPDATE", reviewId: id, status: "REJECTED" });
              bc.close();
            } catch (e) {}
          }
          await refreshData();
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to reject review" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshData]
  );

  // Archive
  const archiveReview = useCallback(
    async (id) => {
      setIsActionLoading(true);
      try {
        const res = await adminArchiveReviewAction(id);
        if (res.success) {
          setFeedback({ type: "success", message: "Review archived" });
          await refreshData();
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to archive review" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshData]
  );

  // Restore
  const restoreReview = useCallback(
    async (id) => {
      setIsActionLoading(true);
      try {
        const res = await adminRestoreReviewAction(id);
        if (res.success) {
          setFeedback({ type: "success", message: "Review restored to Pending" });
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const bc = new BroadcastChannel("aameena_reviews_sync");
              bc.postMessage({ type: "STATUS_UPDATE", reviewId: id, status: "PENDING" });
              bc.close();
            } catch (e) {}
          }
          await refreshData();
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to restore review" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshData]
  );

  const purgeOptimisticReviewLocal = (id) => {
    if (typeof window === "undefined" || !id) return;
    try {
      const raw = localStorage.getItem("aameena_optimistic_reviews");
      if (raw) {
        const optList = JSON.parse(raw);
        if (Array.isArray(optList)) {
          const updated = optList.filter((item) => item && item.id !== id);
          localStorage.setItem("aameena_optimistic_reviews", JSON.stringify(updated));
        }
      }
    } catch (e) {}
  };

  // Hide from website (Archive)
  const hideReview = useCallback(
    async (id) => {
      setIsActionLoading(true);
      try {
        const res = await adminHideReviewAction(id);
        if (res.success) {
          purgeOptimisticReviewLocal(id);
          setFeedback({ type: "success", message: "Review hidden from website (archived)" });
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const bc = new BroadcastChannel("aameena_reviews_sync");
              bc.postMessage({ type: "STATUS_UPDATE", reviewId: id, status: "HIDDEN" });
              bc.close();
            } catch (e) {}
          }
          await refreshData();
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to hide review" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshData]
  );

  // Soft delete from website (status = DELETED)
  const deleteFromWebsite = useCallback(
    async (id) => {
      if (!confirm("Are you sure you want to remove this review from the website?")) return;
      setIsActionLoading(true);
      try {
        const res = await adminSoftDeleteReviewAction(id);
        if (res.success) {
          purgeOptimisticReviewLocal(id);
          setFeedback({ type: "success", message: "Review removed from website (marked as DELETED in database)" });
          setSelectedIds((prev) => prev.filter((item) => item !== id));
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const bc = new BroadcastChannel("aameena_reviews_sync");
              bc.postMessage({ type: "STATUS_UPDATE", reviewId: id, status: "DELETED" });
              bc.close();
            } catch (e) {}
          }
          await refreshData();
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to remove review from website" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshData]
  );

  // Permanent Delete
  const deleteReview = useCallback(
    async (id) => {
      if (!confirm("Are you sure you want to permanently delete this review from the database? This cannot be undone.")) return;
      setIsActionLoading(true);
      try {
        const res = await adminDeleteReviewAction(id);
        if (res.success) {
          purgeOptimisticReviewLocal(id);
          setFeedback({ type: "success", message: "Review permanently deleted from database" });
          setSelectedIds((prev) => prev.filter((item) => item !== id));
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const bc = new BroadcastChannel("aameena_reviews_sync");
              bc.postMessage({ type: "DELETE_REVIEW", reviewId: id });
              bc.close();
            } catch (e) {}
          }
          await refreshData();
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to delete review" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshData]
  );

  // Bulk action
  const executeBulkAction = useCallback(
    async (action) => {
      if (selectedIds.length === 0) return;
      if (action === "DELETE" && !confirm(`Permanently delete ${selectedIds.length} review(s) from database?`)) {
        return;
      }
      if (action === "SOFT_DELETE" && !confirm(`Remove ${selectedIds.length} review(s) from website?`)) {
        return;
      }

      const itemsSnapshot = reviews
        .filter((r) => selectedIds.includes(r.id))
        .map((r) => ({ id: r.id, previousStatus: r.status }));

      setIsActionLoading(true);
      try {
        const res = await adminBulkAction(selectedIds, action);
        if (res.success) {
          setFeedback({
            type: "success",
            message: `Successfully executed ${action.replace("_", " ")} on ${res.count} review(s)`,
          });

          // Enable Undo Action if not permanent delete
          if (action !== "PERMANENT_DELETE" && itemsSnapshot.length > 0) {
            setUndoAction({
              label: `Applied ${action.replace("_", " ")} to ${res.count} review(s).`,
              onUndo: async () => {
                setIsActionLoading(true);
                try {
                  const undoRes = await bulkUndoReviewStatusAction(itemsSnapshot);
                  if (undoRes.success) {
                    setFeedback({ type: "success", message: `Undone action for ${undoRes.count} review(s)` });
                    setUndoAction(null);
                    await refreshData();
                  }
                } catch (err) {
                  setFeedback({ type: "error", message: err.message });
                } finally {
                  setIsActionLoading(false);
                }
              },
            });
          }

          setSelectedIds([]);
          await refreshData();
        } else {
          setFeedback({ type: "error", message: res.error || "Bulk action failed" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [selectedIds, reviews, refreshData]
  );

  // Bulk reply to selected reviews (Phase 8.4)
  const bulkReplyReviews = useCallback(
    async (replyText) => {
      if (selectedIds.length === 0 || !replyText.trim()) return;
      setIsActionLoading(true);
      try {
        const res = await bulkReplyCustomerReviewsAction(selectedIds, replyText, {
          name: "Store Administrator",
          role: "ADMIN",
        });
        if (res.success) {
          setFeedback({
            type: "success",
            message: `Owner response applied to ${res.count} review(s)`,
          });
          setSelectedIds([]);
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const bc = new BroadcastChannel("aameena_reviews_sync");
              bc.postMessage({ type: "STATUS_UPDATE", reviewId: "BULK", status: "REPLY_ADDED" });
              bc.close();
            } catch (e) {}
          }
          await refreshData();
        } else {
          setFeedback({ type: "error", message: res.error || "Bulk reply failed" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [selectedIds, refreshData]
  );

  // Owner reply
  const addOwnerReply = useCallback(
    async (id, replyText) => {
      setIsActionLoading(true);
      try {
        const res = await adminAddOwnerReplyAction(id, replyText);
        if (res.success) {
          setFeedback({ type: "success", message: "Owner response published successfully" });
          await refreshData();
          // Update selected review if detail modal is open
          if (selectedReviewForDetail?.id === id) {
            setSelectedReviewForDetail((prev) => ({
              ...prev,
              ownerReply: replyText,
              ownerReplyDate: new Date().toISOString(),
            }));
          }
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to save reply" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshData, selectedReviewForDetail]
  );

  const deleteOwnerReply = useCallback(
    async (id) => {
      setIsActionLoading(true);
      try {
        const res = await adminDeleteOwnerReplyAction(id);
        if (res.success) {
          setFeedback({ type: "success", message: "Owner response removed successfully" });
          await refreshData();
          if (selectedReviewForDetail?.id === id) {
            setSelectedReviewForDetail((prev) => ({
              ...prev,
              ownerReply: null,
            }));
          }
        } else {
          setFeedback({ type: "error", message: res.error || "Failed to delete reply" });
        }
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshData, selectedReviewForDetail]
  );

  const togglePinOwnerReply = useCallback(
    async (id, isPinned) => {
      try {
        const res = await adminTogglePinOwnerReplyAction(id, isPinned);
        if (res.success) {
          await refreshData();
          if (selectedReviewForDetail?.id === id) {
            setSelectedReviewForDetail((prev) => ({
              ...prev,
              isReplyPinned: isPinned,
            }));
          }
        }
      } catch (err) {
        console.warn("Toggle pin warning:", err.message);
      }
    },
    [refreshData, selectedReviewForDetail]
  );

  return {
    activeTab,
    searchQuery,
    ratingFilter,
    page,
    totalPages,
    total,
    reviews,
    stats,
    isLoading,
    isActionLoading,
    selectedIds,
    selectedReviewForDetail,
    selectedReviewForImprove,
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
    setSelectedReviewForImprove,
    undoAction,
    setUndoAction,
    bulkReplyReviews,
    refreshData,
  };
}
