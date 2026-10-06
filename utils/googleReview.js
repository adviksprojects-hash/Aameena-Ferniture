/**
 * Google Review Redirect Utility
 * Opens the verified Google Write Review interface in a new browser tab.
 *
 * STRICT SECURITY CONSTRAINTS:
 * - NO auto-typing
 * - NO auto-paste
 * - NO auto-submit
 * - NO browser automation
 * - Standard window.open only
 */

export const PRIMARY_GOOGLE_PLACE_ID = "ChIJB1k-wjTbxTsR7dA3i-yPr4Y";
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PRIMARY_GOOGLE_PLACE_ID}`;
export const BUSINESS_NAME = "AMEENA Distributors’s Sofa Set Furniture Company (Solapur Facility)";

/**
 * Open Google Write Review page in a clean new tab
 * @param {string} [customUrl] - Optional override URL
 * @returns {boolean} Whether window.open succeeded
 */
export function openGoogleReview(customUrl = GOOGLE_WRITE_REVIEW_URL) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const targetUrl = customUrl || GOOGLE_WRITE_REVIEW_URL;
    const newWindow = window.open(targetUrl, "_blank", "noopener,noreferrer");

    // Check if browser popup blocker prevented opening
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      console.warn("Pop-up blocker may have blocked opening the Google Review window.");
      // Fallback location change if blocked
      window.location.href = targetUrl;
      return true;
    }

    return true;
  } catch (err) {
    console.error("Failed to open Google Review URL:", err);
    return false;
  }
}
