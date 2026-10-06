/**
 * @file index.js
 * Public Google Reviews Module Entrypoint.
 * Clean barrel exports isolating all types, repository, service, cache, utilities, and components.
 */

// Types & Contracts
export * from "./types/reviewTypes.js";

// Cache
export { reviewCache } from "./cache/reviewCache.js";

// Service Layer
export { GoogleReviewService } from "./services/googleReviewService.js";

// Repository Layer
export { ReviewRepository } from "./repository/reviewRepository.js";

// Utilities
export { formatRelativeTime, formatAbsoluteDate, calculateReadingMetrics, generateInitialsAvatar } from "./utils/relativeTime.js";
export { analyzeSentiment } from "./utils/sentimentAnalyzer.js";
export { generateReviewSummary, verifyIssueResolution } from "./utils/summaryGenerator.js";
export { filterReviews, sortReviews } from "./utils/filterSorter.js";

// Client Hook
export { useGoogleReviews } from "./hooks/useGoogleReviews.js";

// UI Components
export { PublicReviewsContainer } from "./components/PublicReviewsContainer.jsx";
export { PublicReviewsHero } from "./components/PublicReviewsHero.jsx";
export { ReviewSearchAndFilters } from "./components/ReviewSearchAndFilters.jsx";
export { ReviewCard } from "./components/ReviewCard.jsx";
export { ReviewOwnerResponse } from "./components/ReviewOwnerResponse.jsx";
export { ReviewEmptyState } from "./components/ReviewEmptyState.jsx";
export { ReviewErrorState } from "./components/ReviewErrorState.jsx";
export { ReviewCardSkeleton } from "./components/ReviewCardSkeleton.jsx";
export { ReviewStatsSkeleton } from "./components/ReviewStatsSkeleton.jsx";
