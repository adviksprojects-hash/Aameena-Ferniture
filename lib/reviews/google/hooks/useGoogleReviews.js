"use client";

/**
 * @file useGoogleReviews.js
 * Client hook managing Google reviews search, filtering, sorting,
 * expansion, helpful micro-actions, and pagination.
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import { filterReviews, sortReviews } from "../utils/filterSorter.js";
import {
  SORT_OPTIONS,
  EMPTY_STATE_TYPES,
  createDefaultFilters,
} from "../types/reviewTypes.js";
// Analytics tracking no-ops (analytics modules retired in Phase 8.5.3)
const trackSearchTerm = () => {};
const trackRatingFilter = () => {};
const trackLanguageFilter = () => {};
const trackReviewExpanded = () => {};
const trackHelpfulClick = () => {};

export function useGoogleReviews({
  initialReviews = [],
  initialStats = null,
  pageSize = 10,
} = {}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [stats] = useState(initialStats);
  const [filters, setFilters] = useState(createDefaultFilters());
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReviews, setExpandedReviews] = useState(() => new Set());
  const [helpfulVotes, setHelpfulVotes] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("aameena_helpful_reviews");
        if (stored) {
          return new Set(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Could not read helpful votes from sessionStorage", e);
      }
    }
    return new Set();
  });
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const purgeOptimisticReview = (id) => {
    if (typeof window === "undefined" || !id) return;
    try {
      const raw = localStorage.getItem("aameena_optimistic_reviews");
      if (raw) {
        const optList = JSON.parse(raw);
        if (Array.isArray(optList)) {
          const updated = optList.filter((r) => r && r.id !== id);
          localStorage.setItem("aameena_optimistic_reviews", JSON.stringify(updated));
        }
      }
    } catch (err) {}
  };

  // Sync reviews when initialReviews updates from database
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("aameena_optimistic_reviews");
        if (raw) {
          const optList = JSON.parse(raw);
          if (Array.isArray(optList)) {
            const now = Date.now();
            const initialIds = new Set((initialReviews || []).map((r) => r.id));
            const freshRecent = optList.filter((r) => {
              if (!r || !r.id || initialIds.has(r.id)) return false;
              const t = new Date(r.createdAt || r._savedAt || 0).getTime();
              return now - t < 3 * 60 * 1000;
            });
            localStorage.setItem("aameena_optimistic_reviews", JSON.stringify(freshRecent));
            setReviews([...freshRecent, ...(initialReviews || [])]);
            return;
          }
        }
      } catch (e) {}
    }
    setReviews(initialReviews || []);
  }, [initialReviews]);

  // Mount-time check for optimistic reviews in localStorage (avoids hydration mismatch)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("aameena_optimistic_reviews");
      if (raw) {
        const optList = JSON.parse(raw);
        if (Array.isArray(optList) && optList.length > 0) {
          const now = Date.now();
          const validRecent = optList.filter((r) => {
            if (!r || !r.id) return false;
            const t = new Date(r.createdAt || r._savedAt || 0).getTime();
            return now - t < 3 * 60 * 1000;
          });
          localStorage.setItem("aameena_optimistic_reviews", JSON.stringify(validRecent));
          if (validRecent.length > 0) {
            setReviews((prev) => {
              const currentIds = new Set(prev.map((r) => r.id));
              const newToAdd = validRecent.filter((r) => !currentIds.has(r.id));
              if (newToAdd.length === 0) return prev;
              return [...newToAdd, ...prev]; // Newest review appears FIRST
            });
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load optimistic reviews from localStorage:", err);
    }
  }, []);

  // Real-time Live Synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const bc = new BroadcastChannel("aameena_reviews_sync");
    bc.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "NEW_REVIEW" && data.review) {
        const newReview = data.review;
        setReviews((prev) => {
          if (prev.some((r) => r.id === newReview.id)) return prev;
          return [newReview, ...prev]; // Newest review appears FIRST
        });
      } else if (data.type === "STATUS_UPDATE") {
        if (["HIDDEN", "DELETED", "REJECTED", "SPAM"].includes(data.status)) {
          purgeOptimisticReview(data.reviewId);
        }
        setReviews((prev) => {
          if (data.status === "APPROVED" && data.review) {
            return [data.review, ...prev.filter((r) => r.id !== data.review.id)];
          }
          if (["HIDDEN", "DELETED", "REJECTED", "SPAM"].includes(data.status)) {
            return prev.filter((r) => r.id !== data.reviewId);
          }
          return prev;
        });
      } else if (data.type === "DELETE_REVIEW") {
        purgeOptimisticReview(data.reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== data.reviewId));
      } else if (data.type === "REPLY_UPDATE") {
        setReviews((prev) =>
          prev.map((r) => {
            if (r.id === data.reviewId) {
              return {
                ...r,
                ownerResponse: {
                  text: data.replyText,
                  responseDate: new Date().toISOString(),
                  relativeTime: "Just now",
                  responderName: data.responderName || "Aameena Furniture (Owner)",
                  isVerifiedOwner: true,
                  isPinned: Boolean(data.isPinned),
                },
              };
            }
            return r;
          })
        );
      }
    };
    return () => {
      bc.close();
    };
  }, []);

  // Debounce search input by 250ms for smooth typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setFilters((prev) => ({ ...prev, search: searchInput }));
      if (searchInput.trim()) {
        trackSearchTerm(searchInput);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return filterReviews(reviews, {
      ...filters,
      search: debouncedSearch,
    });
  }, [reviews, filters, debouncedSearch]);

  // Sorted reviews
  const sortedReviews = useMemo(() => {
    return sortReviews(filteredReviews, filters.sortBy);
  }, [filteredReviews, filters.sortBy]);

  // Reset page to 1 when filters or debouncedSearch change
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(pageSize);
  }, [filters, debouncedSearch, pageSize]);

  // Page calculations (10 reviews per page by default)
  const totalPages = Math.max(1, Math.ceil(sortedReviews.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Paginated reviews for current page
  const paginatedReviews = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedReviews.slice(startIndex, startIndex + pageSize);
  }, [sortedReviews, safeCurrentPage, pageSize]);

  const hasNextPage = safeCurrentPage < totalPages;
  const hasPrevPage = safeCurrentPage > 1;
  const hasMore = visibleCount < sortedReviews.length;

  // Active filters count (Phase 8.3 Issue 7)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.rating !== "all") count++;
    if (filters.language !== "all") count++;
    if (filters.hasOwnerReply) count++;
    if (filters.onlyPositive) count++;
    if (filters.onlyNegative) count++;
    if (filters.onlyLongReviews) count++;
    if (filters.onlyVerified) count++;
    if (filters.withImages) count++;
    if (filters.woodType && filters.woodType !== "all") count++;
    if (filters.city && filters.city !== "all") count++;
    if (filters.category && filters.category !== "all") count++;
    if (filters.sortBy !== SORT_OPTIONS.NEWEST) count++;
    return count;
  }, [filters]);

  // Determine empty state classification
  const emptyStateType = useMemo(() => {
    if (sortedReviews.length > 0) return null;
    if (debouncedSearch) return EMPTY_STATE_TYPES.NO_SEARCH_RESULTS;
    if (filters.language !== "all") return EMPTY_STATE_TYPES.NO_LANGUAGE_MATCH;
    if (filters.hasOwnerReply) return EMPTY_STATE_TYPES.NO_OWNER_REPLIES;
    return EMPTY_STATE_TYPES.NO_REVIEWS;
  }, [sortedReviews.length, debouncedSearch, filters]);

  // Actions
  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setFilters((prev) => ({ ...prev, search: "" }));
  }, []);

  const handleRatingChange = useCallback((rating) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === rating ? "all" : rating,
    }));
    if (rating !== "all") {
      trackRatingFilter(rating);
    }
    setVisibleCount(pageSize);
  }, [pageSize]);

  const handleLanguageChange = useCallback((language) => {
    setFilters((prev) => ({
      ...prev,
      language: prev.language === language ? "all" : language,
    }));
    if (language !== "all") {
      trackLanguageFilter(language);
    }
    setVisibleCount(pageSize);
  }, [pageSize]);

  const toggleOwnerReply = useCallback(() => {
    setFilters((prev) => ({ ...prev, hasOwnerReply: !prev.hasOwnerReply }));
    setVisibleCount(pageSize);
  }, [pageSize]);

  const toggleOnlyPositive = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      onlyPositive: !prev.onlyPositive,
      onlyNegative: false, // mutually exclusive
    }));
    setVisibleCount(pageSize);
  }, [pageSize]);

  const toggleOnlyNegative = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      onlyNegative: !prev.onlyNegative,
      onlyPositive: false, // mutually exclusive
    }));
    setVisibleCount(pageSize);
  }, [pageSize]);

  const toggleOnlyLongReviews = useCallback(() => {
    setFilters((prev) => ({ ...prev, onlyLongReviews: !prev.onlyLongReviews }));
    setVisibleCount(pageSize);
  }, [pageSize]);

  const toggleVerified = useCallback(() => {
    setFilters((prev) => ({ ...prev, onlyVerified: !prev.onlyVerified }));
    setVisibleCount(pageSize);
  }, [pageSize]);

  const toggleWithImages = useCallback(() => {
    setFilters((prev) => ({ ...prev, withImages: !prev.withImages }));
    setVisibleCount(pageSize);
  }, [pageSize]);

  const handleWoodTypeChange = useCallback((woodType) => {
    setFilters((prev) => ({
      ...prev,
      woodType: prev.woodType === woodType ? "all" : woodType,
    }));
    setVisibleCount(pageSize);
  }, [pageSize]);

  const handleCityChange = useCallback((city) => {
    setFilters((prev) => ({
      ...prev,
      city: prev.city === city ? "all" : city,
    }));
    setVisibleCount(pageSize);
  }, [pageSize]);

  const handleCategoryChange = useCallback((category) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? "all" : category,
    }));
    setVisibleCount(pageSize);
  }, [pageSize]);

  const handleSortChange = useCallback((sortBy) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const toggleExpand = useCallback((reviewId) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
        trackReviewExpanded(reviewId);
      }
      return next;
    });
  }, []);

  const toggleHelpful = useCallback((reviewId) => {
    setHelpfulVotes((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
        trackHelpfulClick(reviewId);
      }

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("aameena_helpful_reviews", JSON.stringify([...next]));
        } catch (e) {
          console.warn("Could not save helpful vote to sessionStorage", e);
        }
      }
      return next;
    });
  }, []);

  const resetAllFilters = useCallback(() => {
    setFilters(createDefaultFilters());
    setSearchInput("");
    setDebouncedSearch("");
    setVisibleCount(pageSize);
  }, [pageSize]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + pageSize);
  }, [pageSize]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const setPage = useCallback((pageNum) => {
    const valid = Math.max(1, Math.min(totalPages, Number(pageNum) || 1));
    setCurrentPage(valid);
  }, [totalPages]);

  return {
    // Data
    reviews: paginatedReviews,
    allFilteredCount: sortedReviews.length,
    totalReviewsCount: reviews.length,
    stats,
    // Pagination
    currentPage: safeCurrentPage,
    totalPages,
    pageSize,
    hasNextPage,
    hasPrevPage,
    // State
    filters,
    searchInput,
    debouncedSearch,
    activeFiltersCount,
    emptyStateType,
    expandedReviews,
    helpfulVotes,
    hasMore,
    // Handlers
    setSearchQuery: handleSearchChange,
    clearSearch: handleClearSearch,
    setRatingFilter: handleRatingChange,
    setLanguageFilter: handleLanguageChange,
    toggleOwnerReplyFilter: toggleOwnerReply,
    toggleOnlyPositive,
    toggleOnlyNegative,
    toggleOnlyLongReviews,
    toggleVerified,
    toggleWithImages,
    setWoodTypeFilter: handleWoodTypeChange,
    setCityFilter: handleCityChange,
    setCategoryFilter: handleCategoryChange,
    setSortBy: handleSortChange,
    toggleExpandReview: toggleExpand,
    toggleHelpful,
    resetAllFilters,
    loadMore,
    goToNextPage,
    goToPrevPage,
    setPage,
  };
}

export default useGoogleReviews;
