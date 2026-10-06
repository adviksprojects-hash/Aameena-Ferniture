/**
 * Universal cross-device clipboard copy and Google Review redirect utilities
 * Supports iOS Safari, Android Chrome, and modern desktop browsers (Chrome, Firefox, Edge, Safari)
 */
export const PRIMARY_GOOGLE_PLACE_ID = "ChIJB1k-wjTbxTsR7dA3i-yPr4Y";
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PRIMARY_GOOGLE_PLACE_ID}`;
export const BUSINESS_NAME = "AMEENA Distributors’s Sofa Set Furniture Company (Solapur Facility)";

export async function copyToClipboard(text) {
  if (typeof window === "undefined" || !text) {
    return { success: false, error: "Text not provided or window not defined" };
  }

  // 1. Try modern navigator.clipboard
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (e) {
      console.warn("navigator.clipboard failed, attempting fallback:", e);
    }
  }

  // 2. Fallback for iOS Safari, older WebViews, and non-HTTPS local contexts
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    textArea.style.opacity = "0";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return { success: Boolean(successful) };
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return { success: false, error: err.message || "Copy failed" };
  }
}

export async function copyToClipboardUniversal(text) {
  const res = await copyToClipboard(text);
  return res.success;
}

export function openGoogleReview(customUrl = GOOGLE_WRITE_REVIEW_URL) {
  if (typeof window === "undefined") return false;
  try {
    window.open(customUrl, "_blank", "noopener,noreferrer");
    return true;
  } catch (err) {
    console.error("openGoogleReview error:", err);
    return false;
  }
}
