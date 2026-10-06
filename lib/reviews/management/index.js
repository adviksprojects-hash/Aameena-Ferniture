/**
 * @file lib/reviews/management/index.js
 * Barrel export for Phase 8 Review Management, AI Generation, Moderation, and Admin Approval.
 */

// Types & Enums
export * from "./types/managementTypes.js";

// Validators
export * from "./validators/submissionValidator.js";

// Utilities
export * from "./utils/duplicateDetector.js";
export * from "./utils/geminiClient.js";
export * from "./utils/moderationEngine.js";
export * from "./utils/imageProcessor.js";

// Repository
export {
  reviewManagementRepository,
  ReviewManagementRepository,
} from "./repository/reviewManagementRepository.js";

// Service
export {
  reviewManagementService,
  ReviewManagementService,
} from "./services/reviewManagementService.js";

// Server Actions
export * from "./actions/reviewManagementActions.js";

// Hooks
export { useReviewSubmission } from "./hooks/useReviewSubmission.js";
export { useAdminReviewManagement } from "./hooks/useAdminReviewManagement.js";

// Components
export { ImageUploader } from "./components/ImageUploader.jsx";
export { AiReviewWriterModal } from "./components/AiReviewWriterModal.jsx";
export { AiImprovementModal } from "./components/AiImprovementModal.jsx";
export { AdminReviewStatsCards } from "./components/AdminReviewStatsCards.jsx";
export { BulkActionsBar } from "./components/BulkActionsBar.jsx";
export { AdminReviewDetailModal } from "./components/AdminReviewDetailModal.jsx";
export { AdminReviewTable } from "./components/AdminReviewTable.jsx";
export { ReviewSubmissionForm } from "./components/ReviewSubmissionForm.jsx";
