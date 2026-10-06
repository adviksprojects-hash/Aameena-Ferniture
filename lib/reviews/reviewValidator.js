/**
 * Backward compatibility re-export wrapper for reviewValidation.js
 */

export {
  checkMarketingWords,
  validateLanguageCorrectness as validateLanguageScript,
  classifyLength,
  classifyTone,
  validateGeneratedReview,
  validateReviewQuality,
  validateBatchQuality,
  checkFactSafety,
  countWords,
} from "./reviewValidation";
